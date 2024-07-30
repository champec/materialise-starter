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

      const { data, error } = await supabase
        .from('ps_service_delivery')
        .insert(serviceDeliveries)

      if (error) throw error

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const submitServiceDelivery