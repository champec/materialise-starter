import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { createThreadAndSendSMS, scheduleReminder } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { addEvent, updateEvent } from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import { parseISO, addMinutes, format, parse } from 'date-fns'
import { createAppointment, updateAppointment } from '../../../../store/apps/pharmacy-services/pharmacyServicesThunks' //'src/store/apps/pharmacy-services/pharmacyServicesThunks'

export const createServiceDeliveries = async (appointmentId, serviceId, appointmentStageId, isUpdate = false) => {
  console.log('CREATING SERVICE DELIVERIES', { appointmentId, serviceId, appointmentStageId, isUpdate })
  // Fetch the service details to check if it's multi-stage
  const { data: serviceData, error: serviceError } = await supabase
    .from('ps_services')
    .select('multi')
    .eq('id', serviceId)
    .single()

  if (serviceError) throw new Error('Error fetching service details')

  console.log('SERVICE DATA', serviceData)

  if (!serviceData?.multi) {
    // Single-stage service logic (remains the same)
    const { data: existingDelivery, error: fetchError } = await supabase
      .from('ps_service_delivery')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116')
      throw new Error('Error fetching existing service delivery', fetchError)

    console.log('EXISTING DELIVERY', existingDelivery)

    if (existingDelivery) {
      // Update existing delivery
      const { error: updateError } = await supabase
        .from('ps_service_delivery')
        .update({
          status: 'In Progress',
          service_id: serviceId,
          service_stage_id: appointmentStageId
        })
        .eq('id', existingDelivery.id)

      if (updateError) throw new Error('Error updating existing service delivery', updateError)
    } else {
      // Create new delivery
      const { error: insertError } = await supabase.from('ps_service_delivery').insert({
        appointment_id: appointmentId,
        service_id: serviceId,
        service_stage_id: appointmentStageId,
        status: 'In Progress',
        outcome: 'pending'
      })

      if (insertError) throw new Error('Error creating new service delivery', insertError)
    }
  } else {
    // Multi-stage service logic
    // Fetch all stages for this service
    const { data: stages, error: stagesError } = await supabase
      .from('ps_service_stages')
      .select('id')
      .eq('service_id', serviceId)

    if (stagesError) throw new Error('Error fetching service stages', stagesError)

    console.log('STAGES', stages)
    if (!isUpdate) {
      // For new appointments, create delivery records for all stages
      const deliveriesToInsert = stages.map(stage => ({
        appointment_id: appointmentId,
        service_id: serviceId,
        service_stage_id: stage.id,
        status: stage.id === appointmentStageId ? 'In Progress' : 'Not Started',
        outcome: 'pending'
      }))

      console.log('DELIVERIES TO INSERT', deliveriesToInsert)

      const { error: insertError } = await supabase.from('ps_service_delivery').insert(deliveriesToInsert)

      if (insertError) throw new Error('Error creating new service deliveries')
    } else {
      // For updates, handle each stage individually
      const { data: existingDeliveries, error: fetchError } = await supabase
        .from('ps_service_delivery')
        .select('*')
        .eq('appointment_id', appointmentId)

      if (fetchError) throw new Error('Error fetching existing service deliveries', fetchError)

      console.log('EXISTING DELIVERIES', existingDeliveries)

      for (const stage of stages) {
        const existingDelivery = existingDeliveries.find(d => d.service_stage_id === stage.id)

        if (existingDelivery) {
          // Update existing delivery
          const { error: updateError } = await supabase
            .from('ps_service_delivery')
            .update({
              status: stage.id === appointmentStageId ? 'In Progress' : 'Not Started',
              service_id: serviceId
            })
            .eq('id', existingDelivery.id)

          if (updateError) throw new Error('Error updating existing service delivery', updateError)
        } else {
          // Create new delivery if it doesn't exist
          const { error: insertError } = await supabase.from('ps_service_delivery').insert({
            appointment_id: appointmentId,
            service_id: serviceId,
            service_stage_id: stage.id,
            status: stage.id === appointmentStageId ? 'In Progress' : 'Not Started',
            outcome: 'pending'
          })

          if (insertError) throw new Error('Error creating new service delivery', insertError)
        }
      }

      // Set all deliveries not matching the current stage to 'Inactive'
      const { error: updateError } = await supabase
        .from('ps_service_delivery')
        .update({ status: 'Inactive' })
        .eq('appointment_id', appointmentId)
        .neq('service_stage_id', appointmentStageId)

      if (updateError) throw new Error('Error updating service deliveries', updateError)
    }
  }
}

const useAppointmentSubmission = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const userId = useSelector(state => state.user.user.id)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const notifyApiKey = useSelector(state => state.organisation.organisation.notifyApiKey)

  const handleAppointment = async (appointmentData, isUpdate = false, generateLink = true) => {
    console.log('Starting handleAppointment', { appointmentData, isUpdate, generateLink })
    setLoading(true)
    let dailyData = null
    let appointmentResult = null

    try {
      // Generate a scheduled meeting if it's a new remote video appointment
      if (appointmentData.appointment_type === 'remote-video' && (!isUpdate || (isUpdate && generateLink))) {
        console.log('Generating video link for remote appointment')
        const unixTimeStamp = dayjs(appointmentData.scheduled_time).unix()
        console.log('Invoking daily-scheduler function with timestamp:', unixTimeStamp)
        const { data: dailyResponse, error: dailyError } = await supabase.functions.invoke('daily-scheduler', {
          body: { scheduledTime: unixTimeStamp }
        })

        if (dailyError) {
          console.error('Error generating video link:', dailyError)
          throw new Error('Error generating video link')
        }
        dailyData = dailyResponse
        console.log('Video link generated successfully', dailyData)
      }

      // Prepare appointment payload
      const appointmentPayload = {
        ...appointmentData,
        pharmacy_id: orgId,
        remote_details:
          appointmentData.appointment_type === 'remote-video'
            ? isUpdate && !generateLink
              ? appointmentData.remote_details
              : {
                  url: dailyData?.room?.url,
                  hcp_token: dailyData?.hcpToken,
                  patient_token: dailyData?.patientToken
                }
            : null
      }
      console.log('Prepared appointment payload', appointmentPayload)

      // Create or update the appointment
      if (isUpdate) {
        console.log('Updating existing appointment')
        // from quick service appointment is sent with a addition param of sendText and data is called with the appointmentData
        const appointmentData = appointmentPayload
        const { payload, error } = await dispatch(updateAppointment({ appointmentData }))
        if (error) {
          console.error('Error updating appointment:', error)
          throw new Error('Error updating appointment')
        }
        appointmentResult = payload
        console.log('Appointment updated successfully', appointmentResult)
      } else {
        console.log('Creating new appointment')
        const { payload, error } = await dispatch(createAppointment(appointmentPayload))
        if (error) {
          console.error('Error creating appointment:', error)
          throw new Error('Error creating appointment')
        }
        const { data: appointmentData, error: appointmentError } = payload
        if (appointmentError) {
          console.error('Error creating appointment:', appointmentError)
          throw new Error('Error creating appointment')
        }
        appointmentResult = appointmentData
        console.log('Appointment created successfully', appointmentResult)
      }

      console.log('Creating service deliveries')
      await createServiceDeliveries(
        appointmentResult.id,
        appointmentData.service_id,
        appointmentData.current_stage_id,
        isUpdate
      )
      console.log('Service deliveries created successfully')

      // Handle event creation or update
      console.log('Handling event creation/update')
      let startTime
      if (appointmentData.scheduled_time instanceof Date) {
        startTime = appointmentData.scheduled_time
      } else {
        startTime = parse(appointmentData.scheduled_time, 'EEE MMM dd yyyy HH:mm:ss xx', new Date())
      }

      const duration = appointmentData?.duration || 30
      const endTime = addMinutes(startTime, duration)

      const eventPayload = {
        start: startTime,
        end: endTime,
        location: appointmentData.appointment_type === 'remote-video' ? 'online' : 'in-person',
        company_id: orgId,
        created_by: userId,
        allDay: false,
        service_type: appointmentData.service_id,
        title: 'Pharmacy First Appointment',
        url: appointmentData.remote_details?.url || null,
        appointment_id: appointmentResult.id
      }
      console.log('Event payload prepared', eventPayload)

      if (isUpdate) {
        console.log('Updating existing event')
        const updateResult = await dispatch(updateEvent({ id: appointmentData.event_id, ...eventPayload }))
        console.log('Event update result:', updateResult)
      } else {
        console.log('Adding new event')
        const addResult = await dispatch(addEvent(eventPayload))
        console.log('Event add result:', addResult)
      }

      // Handle SMS notifications
      if (appointmentData.details.sendTextUpdate) {
        console.log('Sending SMS notification')
        const userLink = `https://pharmex.uk/pharmacy-first/patient/${appointmentResult.id}`
        const message = `Your Pharmacy First appointment is ${isUpdate ? 'updated and' : ''} scheduled for ${dayjs(
          appointmentData.scheduled_time
        ).format('YYYY-MM-DD HH:mm')}. ${
          appointmentData.appointment_type === 'remote-video' ? `Use this link to join the meeting: ${userLink}` : ''
        } Your secure word is your first name: ${appointmentData.patient_object.first_name}`

        const smsResult = await dispatch(
          createThreadAndSendSMS({
            patientId: appointmentData.patient_id,
            patientName: appointmentData.patient_object.full_name,
            message,
            phoneNumber: appointmentData.patient_object.mobile_number,
            appointmentId: appointmentResult.id,
            time: appointmentData.scheduled_time
          })
        )
        console.log('SMS notification sent, result:', smsResult)

        // Schedule a reminder
        console.log('Scheduling reminder')
        const reminderDate = dayjs(appointmentData.scheduled_time).subtract(30, 'minute')
        const reminderResult = await dispatch(
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
        console.log('Reminder scheduled, result:', reminderResult)
      }

      setLoading(false)
      console.log('Appointment handling completed successfully')
      return appointmentResult
    } catch (error) {
      console.error('Error in handleAppointment:', error)
      console.error('Error stack:', error.stack)
      console.error('Current state:', { dailyData, appointmentResult })
      setLoading(false)
      throw error
    }
  }

  const submitAppointment = appointmentData => handleAppointment(appointmentData, false)
  const updateExistingAppointment = (appointmentData, generateLink) =>
    handleAppointment(appointmentData, true, generateLink)

  return { submitAppointment, updateExistingAppointment, loading }
}

export default useAppointmentSubmission
