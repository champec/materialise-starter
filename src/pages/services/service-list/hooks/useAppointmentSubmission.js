import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { createThreadAndSendSMS, scheduleReminder } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { addEvent, updateEvent } from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import { parseISO, addMinutes, format, parse } from 'date-fns'
import { createAppointment, updateAppointment } from 'src/store/apps/pharmacy-services/pharmacyServicesThunks'

export const createServiceDeliveries = async (appointmentId, serviceId, appointmentStageId, isUpdate = false) => {
  // Fetch the service details to check if it's multi-stage
  const { data: serviceData, error: serviceError } = await supabase
    .from('ps_services')
    .select('multi')
    .eq('id', serviceId)
    .single()

  if (serviceError) throw new Error('Error fetching service details')

  if (!serviceData?.multi) {
    // Single-stage service logic (remains the same)
    const { data: existingDelivery, error: fetchError } = await supabase
      .from('ps_service_delivery')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') throw new Error('Error fetching existing service delivery')

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

      if (updateError) throw new Error('Error updating existing service delivery')
    } else {
      // Create new delivery
      const { error: insertError } = await supabase.from('ps_service_delivery').insert({
        appointment_id: appointmentId,
        service_id: serviceId,
        service_stage_id: appointmentStageId,
        status: 'In Progress',
        outcome: 'pending'
      })

      if (insertError) throw new Error('Error creating new service delivery')
    }
  } else {
    // Multi-stage service logic
    // Fetch all stages for this service
    const { data: stages, error: stagesError } = await supabase
      .from('ps_service_stages')
      .select('id')
      .eq('service_id', serviceId)

    if (stagesError) throw new Error('Error fetching service stages')

    if (!isUpdate) {
      // For new appointments, create delivery records for all stages
      const deliveriesToInsert = stages.map(stage => ({
        appointment_id: appointmentId,
        service_id: serviceId,
        service_stage_id: stage.id,
        status: stage.id === appointmentStageId ? 'In Progress' : 'Not Started',
        outcome: 'pending'
      }))

      const { error: insertError } = await supabase.from('ps_service_delivery').insert(deliveriesToInsert)

      if (insertError) throw new Error('Error creating new service deliveries')
    } else {
      // For updates, handle each stage individually
      const { data: existingDeliveries, error: fetchError } = await supabase
        .from('ps_service_delivery')
        .select('*')
        .eq('appointment_id', appointmentId)

      if (fetchError) throw new Error('Error fetching existing service deliveries')

      for (const stage of stages) {
        const existingDelivery = existingDeliveries.find(d => d.service_stage_id === stage.id)

        if (existingDelivery) {
          // Update existing delivery
          await supabase
            .from('ps_service_delivery')
            .update({
              status: stage.id === appointmentStageId ? 'In Progress' : 'Not Started',
              service_id: serviceId
            })
            .eq('id', existingDelivery.id)
        } else {
          // Create new delivery if it doesn't exist
          await supabase.from('ps_service_delivery').insert({
            appointment_id: appointmentId,
            service_id: serviceId,
            service_stage_id: stage.id,
            status: stage.id === appointmentStageId ? 'In Progress' : 'Not Started',
            outcome: 'pending'
          })
        }
      }

      // Set all deliveries not matching the current stage to 'Inactive'
      await supabase
        .from('ps_service_delivery')
        .update({ status: 'Inactive' })
        .eq('appointment_id', appointmentId)
        .neq('service_stage_id', appointmentStageId)
    }
  }
}

// export const createServiceDeliveries = async (appointmentId, serviceId, appointmentStageId) => {
//   // Fetch service details along with its stages
//   const { data: serviceData, error: serviceError } = await supabase
//     .from('ps_services')
//     .select(
//       `
//         *,
//         ps_service_stages (*)
//       `
//     )
//     .eq('id', serviceId)
//     .single()

//   if (serviceError) throw new Error('Error fetching service details')

//   let deliveryRecords = []

//   if (serviceData.multi_stage) {
//     // Create a service delivery for each stage
//     deliveryRecords = serviceData.ps_service_stages.map(stage => ({
//       appointment_id: appointmentId,
//       service_id: serviceId,
//       service_stage_id: stage.id,
//       status: 'Not Started',
//       outcome: 'pending'
//     }))
//   } else {
//     // For single-stage services, create one delivery using the appointment's service_stage_id
//     deliveryRecords = [
//       {
//         appointment_id: appointmentId,
//         service_id: serviceId,
//         service_stage_id: appointmentStageId,
//         status: 'Not Started',
//         outcome: 'pending'
//       }
//     ]
//   }

//   const { error: deliveryError } = await supabase.from('ps_service_delivery').insert(deliveryRecords)

//   if (deliveryError) {
//     console.log(deliveryError)
//     throw new Error('Error creating service delivery records', deliveryError.message)
//   }
// }

const useAppointmentSubmission = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const userId = useSelector(state => state.user.user.id)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const notifyApiKey = useSelector(state => state.organisation.organisation.notifyApiKey)

  const handleAppointment = async (appointmentData, isUpdate = false) => {
    setLoading(true)
    let dailyData = null
    let appointmentResult = null

    try {
      // Generate a scheduled meeting if it's a new remote video appointment
      if (appointmentData.appointment_type === 'remote-video' && !isUpdate) {
        const unixTimeStamp = dayjs(appointmentData.scheduled_time).unix()
        const { data: dailyResponse, error: dailyError } = await supabase.functions.invoke('daily-scheduler', {
          body: { scheduledTime: unixTimeStamp }
        })

        if (dailyError) throw new Error('Error generating video link')
        dailyData = dailyResponse
      }

      // Prepare appointment payload
      const appointmentPayload = {
        ...appointmentData,
        pharmacy_id: orgId,
        remote_details: isUpdate
          ? appointmentData.remote_details
          : {
              url: dailyData?.room?.url,
              hcp_token: dailyData?.hcpToken,
              patient_token: dailyData?.patientToken
            }
      }

      // Create or update the appointment
      if (isUpdate) {
        const { payload, error } = await dispatch(updateAppointment(appointmentPayload))
        if (error) throw new Error('Error updating appointment')
        appointmentResult = payload

        await createServiceDeliveries(
          appointmentResult.id,
          appointmentData.service_id,
          appointmentData.current_stage_id,
          isUpdate
        )
      } else {
        const { payload, error } = await dispatch(createAppointment(appointmentPayload))
        if (error) throw new Error('Error creating appointment')
        appointmentResult = payload

        await createServiceDeliveries(
          appointmentResult.id,
          appointmentData.service_id,
          appointmentData.current_stage_id,
          isUpdate
        )
      }

      // Handle event creation or update
      const startTime = parse(appointmentData.scheduled_time, 'EEE MMM dd yyyy HH:mm:ss xx', new Date())
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

      if (isUpdate) {
        await dispatch(updateEvent({ id: appointmentData.event_id, ...eventPayload }))
      } else {
        await dispatch(addEvent(eventPayload))
      }

      // Handle SMS notifications
      if (appointmentData.details.sendTextUpdate) {
        const userLink = `https://pharmex.uk/pharmacy-first/patient/${appointmentResult.id}`
        const message = `Your Pharmacy First appointment is ${isUpdate ? 'updated and' : ''} scheduled for ${dayjs(
          appointmentData.scheduled_time
        ).format('YYYY-MM-DD HH:mm')}. ${
          appointmentData.appointment_type === 'remote-video' ? `Use this link to join the meeting: ${userLink}` : ''
        } Your secure word is your first name: ${appointmentData.patient_object.first_name}`

        await dispatch(
          createThreadAndSendSMS({
            patientId: appointmentData.patient_id,
            patientName: appointmentData.patient_object.full_name,
            message,
            phoneNumber: appointmentData.patient_object.mobile_number,
            appointmentId: appointmentResult.id,
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
      return appointmentResult
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const submitAppointment = appointmentData => handleAppointment(appointmentData, false)
  const updateExistingAppointment = appointmentData => handleAppointment(appointmentData, true)

  return { submitAppointment, updateExistingAppointment, loading }
}

export default useAppointmentSubmission
