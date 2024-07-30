import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Typography, Box, CircularProgress, Button } from '@mui/material'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import AdvancedFormEngine from '../../components/AdvancedFormEngine'
import { getFormDefinitionForService } from '../../utils/formDefinitions'

function ServiceDeliveryPage() {
  const router = useRouter()
  const { id, appointmentId } = router.query
  const [loading, setLoading] = useState(true)
  const [serviceDelivery, setServiceDelivery] = useState(null)
  const [appointment, setAppointment] = useState(null)
  const [formDefinition, setFormDefinition] = useState(null)

  useEffect(() => {
    if (id && appointmentId) {
      fetchServiceDeliveryAndAppointment()
    }
  }, [id, appointmentId])

  const fetchServiceDeliveryAndAppointment = async () => {
    setLoading(true)
    try {
      // Fetch service delivery
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('ps_service_delivery')
        .select('*, ps_service_stages(*)')
        .eq('id', id)
        .single()

      if (deliveryError) throw deliveryError

      // Fetch appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('ps_appointments')
        .select('*, ps_services(*)')
        .eq('id', appointmentId)
        .single()

      if (appointmentError) throw appointmentError

      setServiceDelivery(deliveryData)
      setAppointment(appointmentData)

      // Get form definition based on the service
      const formDef = getFormDefinitionForService(appointmentData.ps_services.id)
      setFormDefinition(formDef)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async formData => {
    // Here you would handle the form submission,
    // updating the service delivery status, etc.
    console.log('Form submitted:', formData)
    // Update service delivery status
    try {
      const { error } = await supabase
        .from('ps_service_delivery')
        .update({ status: 'completed', details: formData })
        .eq('id', id)

      if (error) throw error

      // Navigate back to the appointments page or show a success message
      router.push('/appointments')
    } catch (error) {
      console.error('Error updating service delivery:', error)
      // Show an error message
    }
  }

  const handleSaveProgress = async formData => {
    try {
      const { error } = await supabase
        .from('ps_service_delivery')
        .update({ details: formData, status: 'in_progress' })
        .eq('id', id)

      if (error) throw error

      console.log('Progress saved')
      // Optionally, show a success message to the user
    } catch (error) {
      console.error('Error saving progress:', error)
      // Show an error message to the user
    }
  }

  if (loading) {
    return <CircularProgress />
  }

  if (!serviceDelivery || !appointment || !formDefinition) {
    return <Typography>Error loading service delivery information</Typography>
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
      <Typography variant='h4' gutterBottom>
        Service Delivery: {appointment.ps_services.name}
      </Typography>
      <Typography variant='subtitle1' gutterBottom>
        Patient: {appointment.patient_object?.full_name}
      </Typography>
      <Typography variant='subtitle1' gutterBottom>
        Stage: {serviceDelivery.ps_service_stages.name}
      </Typography>

      <AdvancedFormEngine
        formDefinition={formDefinition}
        initialData={serviceDelivery.details || {}}
        onSubmit={handleFormSubmit}
        onSaveProgress={handleSaveProgress}
      />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant='outlined' onClick={() => router.back()}>
          Back to Appointments
        </Button>
        <Button variant='contained' onClick={() => handleSaveProgress(formDefinition.getCurrentFormData())}>
          Save Progress
        </Button>
      </Box>
    </Box>
  )
}

export default ServiceDeliveryPage
