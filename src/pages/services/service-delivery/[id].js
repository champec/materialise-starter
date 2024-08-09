import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import AdvancedFormEngine from '../../../views/apps/services/serviceDelivery/components/AdvancedFormEngine'
import { getFormDefinitionForService } from '../../../views/apps/services/serviceDelivery/components/utils/getFormDefinitionForService'
import VideoCallPage from './remote-video'

function ServiceDeliveryPage() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serviceDelivery, setServiceDelivery] = useState(null)
  const [appointment, setAppointment] = useState(null)
  const [formDefinition, setFormDefinition] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [formDataToSubmit, setFormDataToSubmit] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  useEffect(() => {
    if (id) {
      fetchServiceDeliveryData()
    }
  }, [id])

  const fetchServiceDeliveryData = async () => {
    setLoading(true)
    try {
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('ps_service_delivery')
        .select('*, ps_service_stages(*)')
        .eq('id', id)
        .single()

      if (deliveryError) throw deliveryError

      const { data: appointmentData, error: appointmentError } = await supabase
        .from('ps_appointments')
        .select('*, ps_services(*), ps_service_stages(id)')
        .eq('id', deliveryData.appointment_id)
        .single()

      if (appointmentError) throw appointmentError

      setServiceDelivery(deliveryData)
      setAppointment(appointmentData)

      const formDef = getFormDefinitionForService(appointmentData.ps_service_stages?.id)
      console.log('FORM DEFINTIION', formDef)
      setFormDefinition(formDef)
    } catch (error) {
      console.error('Error fetching service delivery data:', error)
      showSnackbar('Error loading service delivery information', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = formData => {
    setFormDataToSubmit(formData)
    setConfirmDialogOpen(true)
  }

  const confirmSubmit = async () => {
    setConfirmDialogOpen(false)
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('ps_service_delivery')
        .update({ status: 'completed', details: formDataToSubmit })
        .eq('id', id)

      if (error) throw error

      showSnackbar('Service delivery completed successfully', 'success')
      setTimeout(() => router.push('/appointments'), 2000)
    } catch (error) {
      console.error('Error updating service delivery:', error)
      showSnackbar('Error completing service delivery', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveProgress = async formData => {
    try {
      const { error } = await supabase
        .from('ps_service_delivery')
        .update({ details: formData, status: 'in_progress' })
        .eq('id', id)

      if (error) throw error

      showSnackbar('Progress saved successfully', 'success')
    } catch (error) {
      console.error('Error saving progress:', error)
      showSnackbar('Error saving progress', 'error')
    }
  }

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    )
  }

  if (!serviceDelivery || !appointment || !formDefinition) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography color='error'>Error loading service delivery information</Typography>
      </Box>
    )
  }

  if (appointment.appointment_type === 'remote-video' && appointment.remote_details) {
    return (
      <VideoCallPage
        appointment={appointment}
        serviceDelivery={serviceDelivery}
        formDefinition={formDefinition}
        onSubmit={handleFormSubmit}
        onSaveProgress={handleSaveProgress}
      />
    )
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          Service Delivery: {appointment.ps_services.name}
        </Typography>
        <Typography variant='subtitle1' gutterBottom>
          Patient: {appointment.patient_object?.full_name}
        </Typography>
        <Typography variant='subtitle1' gutterBottom>
          Stage: {serviceDelivery.ps_service_stages.name}
        </Typography>
      </Paper>

      <AdvancedFormEngine
        formDefinition={formDefinition}
        initialData={serviceDelivery.details || {}}
        onSubmit={handleFormSubmit}
        onSaveProgress={handleSaveProgress}
      />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant='outlined' onClick={() => router.push('/appointments')}>
          Back to Appointments
        </Button>
      </Box>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to complete this service delivery? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmSubmit} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ServiceDeliveryPage
