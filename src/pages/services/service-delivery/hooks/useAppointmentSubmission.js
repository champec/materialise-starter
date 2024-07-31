// hooks/useAppointmentSubmission.js

import { useState } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'

export const useAppointmentSubmission = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createServiceDeliveries = async (appointmentId, serviceId, currentStageId) => {
    setLoading(true)
    setError(null)
    try {
      // Fetch all stages for the service
      const { data: stages, error: stagesError } = await supabase
        .from('ps_service_stages')
        .select('*')
        .eq('service_id', serviceId)
        .order('stage_number', { ascending: true })

      if (stagesError) throw stagesError

      // Create a service delivery for each stage
      const serviceDeliveries = stages.map(stage => ({
        appointment_id: appointmentId,
        service_id: serviceId,
        service_stage_id: stage.id,
        status: stage.id === currentStageId ? 'in_progress' : 'pending',
        details: {}
      }))

      const { data, error } = await supabase.from('ps_service_delivery').insert(serviceDeliveries)

      if (error) throw error

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }
  const submitServiceDelivery = async (appointmentId, serviceDeliveryId) => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Mark the specific service delivery as complete
      const { error: updateError } = await supabase
        .from('ps_service_delivery')
        .update({ status: 'complete', completed_at: new Date().toISOString() })
        .eq('id', serviceDeliveryId)

      if (updateError) throw updateError

      // Step 2: Fetch all service deliveries for this appointment
      const { data: allDeliveries, error: fetchError } = await supabase
        .from('ps_service_delivery')
        .select(
          `
          *,
          service:ps_services(name),
          stage:ps_service_stages(name, stage_number)
        `
        )
        .eq('appointment_id', appointmentId)

      if (fetchError) throw fetchError

      // Step 3: Check if all deliveries are complete
      const allComplete = allDeliveries.every(delivery => delivery.status === 'complete')

      // Step 4: Fetch the current appointment details
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('ps_appointment')
        .select('details')
        .eq('id', appointmentId)
        .single()

      if (appointmentError) throw appointmentError

      // Step 5: Prepare completion details for all stages
      const stagesDetails = allDeliveries.map(delivery => ({
        service_id: delivery.service_id,
        service_name: delivery.service.name,
        stage_id: delivery.service_stage_id,
        stage_name: delivery.stage.name,
        stage_number: delivery.stage.stage_number,
        status: delivery.status,
        completed_at: delivery.completed_at
      }))

      // Step 6: Update appointment details
      const updatedDetails = {
        ...appointmentData.details,
        service_delivery_progress: stagesDetails
      }

      // Step 7: Determine overall status
      const overStatus = allComplete ? 'completed' : 'partially_completed'

      // Step 8: Update appointment status and details
      const { data: updatedAppointment, error: finalUpdateError } = await supabase
        .from('ps_appointment')
        .update({
          over_status: overStatus,
          details: updatedDetails
        })
        .eq('id', appointmentId)
        .single()

      if (finalUpdateError) throw finalUpdateError

      return updatedAppointment
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Add this to your return statement
  return {
    createServiceDeliveries,
    submitServiceDelivery,
    loading,
    error
  }
}
