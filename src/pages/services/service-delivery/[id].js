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
  Alert,
  Drawer
} from '@mui/material'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import AdvancedFormEngine from '../../../views/apps/services/serviceDelivery/components/AdvancedFormEngine'
import { getFormDefinitionForService } from '../../../views/apps/services/serviceDelivery/components/utils/getFormDefinitionForService'
import VideoCallPage from './remote-video'
import ConsultationNotesComponent from '../service-stats/AIConsult'
import Icon from 'src/@core/components/icon'

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
  const [currentNodeId, setCurrentNodeId] = useState(formDefinition?.startNode)
  const [formData, setFormData] = useState({})
  const [history, setHistory] = useState([formDefinition?.startNode])
  const [errors, setErrors] = useState({})
  const [isLocked, setIsLocked] = useState(false)

  // AI CHAT BOT STATES
  const [notes, setNotes] = useState('')
  const [recommendation, setRecommendation] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [chatBotMessages, setChatBotMessages] = useState([])
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)

  // END AI CHAT BOT STATES

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

      const formDef = getFormDefinitionForService(deliveryData.ps_service_stages)
      console.log(
        'FORM DEFINTIION',
        formDef,
        'delivery data',
        deliveryData,
        'appointment data',
        appointmentData.ps_service_stages.id
      )
      setCurrentNodeId(formDef?.startNode)
      setHistory([formDef?.startNode])
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
        .update({
          status: 'completed',
          details: formDataToSubmit,
          shared_data: formDataToSubmit?.medicationDetails?.medications
            ? formDataToSubmit?.medicationDetails?.medications
            : null
        })
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
        .update({
          details: formData,
          status: 'in_progress',
          shared_data: formData?.medicationDetails?.medications ? formData?.medicationDetails?.medications : null
        })
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
      <>
        <Button startIcon={<Icon icon='mdi:robot' />} onClick={() => setAiDrawerOpen(true)}>
          AI Assistance
        </Button>
        <VideoCallPage
          appointment={appointment}
          serviceDelivery={serviceDelivery}
          formDefinition={formDefinition}
          onSubmit={handleFormSubmit}
          onSaveProgress={handleSaveProgress}
          setCurrentNodeId={setCurrentNodeId}
          currentNodeId={currentNodeId}
          history={history}
          setHistory={setHistory}
          setErrors={setErrors}
          errors={errors}
          formData={formData}
          setFormData={setFormData}
        />
        <Drawer
          anchor='right'
          open={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '40%',
              maxWidth: '600px',
              padding: 2
            }
          }}
        >
          <Box>
            <Typography variant='h6'>AI Assistance</Typography>
          </Box>
          <ConsultationNotesComponent
            patientInfo={appointment?.patient_object}
            notes={notes}
            setNotes={setNotes}
            recommendation={recommendation}
            setRecommendation={setRecommendation}
            conversationHistory={conversationHistory}
            setConversationHistory={setConversationHistory}
            chatBotMessages={chatBotMessages}
            setChatBotMessages={setChatBotMessages}
          />
        </Drawer>
      </>
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
        <Button startIcon={<Icon icon='mdi:robot' />} onClick={() => setAiDrawerOpen(true)}>
          AI Assistance
        </Button>
      </Paper>

      {formDefinition && (
        <AdvancedFormEngine
          formDefinition={formDefinition}
          initialData={serviceDelivery.details || {}}
          onSubmit={handleFormSubmit}
          onSaveProgress={handleSaveProgress}
          // new states

          // initialData={}
          formData={formData}
          setFormData={setFormData}
          currentNodeId={currentNodeId}
          setCurrentNodeId={setCurrentNodeId}
          history={history}
          setHistory={setHistory}
          isLocked={isLocked}
          setIsLocked={setIsLocked}
          errors={errors}
          setErrors={setErrors}
          sharedData={serviceDelivery.shared_data}
        />
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant='outlined' onClick={() => router.push('/appointments')}>
          Back to Appointments
        </Button>
      </Box>
      <Drawer
        anchor='right'
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '40%',
            maxWidth: '600px',
            padding: 2
          }
        }}
      >
        <Box>
          <Typography variant='h6'>AI Assistance</Typography>
        </Box>
        <ConsultationNotesComponent
          patientInfo={patientInfo}
          notes={notes}
          setNotes={setNotes}
          recommendation={recommendation}
          setRecommendation={setRecommendation}
          conversationHistory={conversationHistory}
          setConversationHistory={setConversationHistory}
          chatBotMessages={chatBotMessages}
          setChatBotMessages={setChatBotMessages}
        />
      </Drawer>

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
