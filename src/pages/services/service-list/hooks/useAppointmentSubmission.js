import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
// import { supabase } from '../path/to/your/supabaseClient'
import { supabaseOrg as supabase } from 'src/configs/supabase'
// import { createThreadAndSendSMS, scheduleReminder } from '../path/to/your/smsActions'
import { createThreadAndSendSMS, scheduleReminder } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
// import { addEvent, simpleEventUpdate } from '../path/to/your/eventActions'
import { addEvent, simpleEventUpdate } from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import { parseISO, addMinutes, format, parse } from 'date-fns'

export const createServiceDeliveries = async (appointmentId, serviceId, appointmentStageId) => {
  // Fetch service details along with its stages
  const { data: serviceData, error: serviceError } = await supabase
    .from('ps_services')
    .select(
      `
        *,
        ps_service_stages (*)
      `
    )
    .eq('id', serviceId)
    .single()

  if (serviceError) throw new Error('Error fetching service details')

  let deliveryRecords = []

  if (serviceData.multi_stage) {
    // Create a service delivery for each stage
    deliveryRecords = serviceData.ps_service_stages.map(stage => ({
      appointment_id: appointmentId,
      service_id: serviceId,
      service_stage_id: stage.id,
      status: 'Not Started',
      outcome: 'pending'
    }))
  } else {
    // For single-stage services, create one delivery using the appointment's service_stage_id
    deliveryRecords = [
      {
        appointment_id: appointmentId,
        service_id: serviceId,
        service_stage_id: appointmentStageId,
        status: 'Not Started',
        outcome: 'pending'
      }
    ]
  }

  const { error: deliveryError } = await supabase.from('ps_service_delivery').insert(deliveryRecords)

  if (deliveryError) {
    console.log(deliveryError)
    throw new Error('Error creating service delivery records', deliveryError.message)
  }
}

const useAppointmentSubmission = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const userId = useSelector(state => state.user.user.id)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const notifyApiKey = useSelector(state => state.organisation.organisation.notifyApiKey)

  const submitAppointment = async appointmentData => {
    setLoading(true)
    let dailyData = null
    let newAppointment = null

    try {
      // Generate a scheduled meeting if it's a remote video appointment
      if (appointmentData.appointment_type === 'remote-video') {
        const unixTimeStamp = dayjs(appointmentData.scheduled_time).unix()
        const { data: dailyResponse, error: dailyError } = await supabase.functions.invoke('daily-scheduler', {
          body: { scheduledTime: unixTimeStamp }
        })

        if (dailyError) throw new Error('Error generating video link')
        dailyData = dailyResponse
      }

      // Create the appointment
      const appointmentPayload = {
        ...appointmentData,
        pharmacy_id: orgId,
        // booked_by: userId,
        remote_details: {
          url: dailyData?.room?.url,
          hcp_token: dailyData?.hcpToken,
          patient_token: dailyData?.patientToken
        }
      }

      const { data: newAppointmentData, error: appointmentError } = await supabase
        .from('ps_appointments')
        .insert(appointmentPayload)
        .select('*')

      if (appointmentError) throw new Error('Error creating appointment')
      newAppointment = newAppointmentData[0]

      await createServiceDeliveries(newAppointment.id, appointmentData.service_id, appointmentData.current_stage_id)

      console.log('scheduled time', appointmentData.scheduled_time)
      const startTime = parse(appointmentData.scheduled_time, 'EEE MMM dd yyyy HH:mm:ss xx', new Date())
      // Create an event for the appointment
      const duration = appointmentData?.duration || 30
      const endTime = addMinutes(startTime, duration)

      console.log('Start time:', startTime)
      console.log('End time:', endTime)
      const eventPayload = {
        start: appointmentData.scheduled_time,
        end: appointmentData.scheduled_time,
        location: appointmentData.appointment_type === 'remote-video' ? 'online' : 'in-person',
        company_id: orgId,
        created_by: userId,
        allDay: false,
        service_type: appointmentData.service_id,
        title: 'Pharmacy First Appointment',
        url: dailyData?.room?.url || null,
        appointment_id: newAppointment.id
      }

      const { payload: newEvent, error: eventError } = await dispatch(addEvent(eventPayload))
      if (eventError) throw new Error('Error creating event')

      // Send SMS if sendTextUpdate is true
      if (appointmentData.details.sendTextUpdate) {
        const userLink = `https://pharmex.uk/pharmacy-first/patient/${newAppointment.id}`
        const message = `Your Pharmacy First appointment is scheduled for ${dayjs(
          appointmentData.scheduled_time
        ).format('YYYY-MM-DD HH:mm')}. ${
          appointmentData.appointment_type === 'remote-video' ? `Use this link to join the meeting: ${userLink}` : ''
        } Your secure word is your first name: ${appointmentData.patient_object.first_name}`

        await dispatch(
          createThreadAndSendSMS({
            patientId: appointmentData.patient_.id,
            patientName: appointmentData.patient_object.full_name,
            message,
            phoneNumber: appointmentData.patient_object.mobile_number,
            appointmentId: newAppointment.id,
            time: appointmentData.scheduled_time
          })
        )

        // Schedule a reminder
        const reminderDate = dayjs(appointmentData.scheduled_time).subtract(30, 'minute')
        await dispatch(
          scheduleReminder({
            phoneNumber: appointmentData.patient_object.mobile_number,
            message,
            time: reminderDate,
            apiKey: notifyApiKey,
            organisation_id: orgId,
            org_message: `Upcoming appointment with ${appointmentData.patient_object.full_name}`,
            title: `Pharmacy First Appointment Reminder`
          })
        )
      }

      setLoading(false)
      return newAppointment
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  return { submitAppointment, loading }
}

export default useAppointmentSubmission
