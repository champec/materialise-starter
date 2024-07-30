import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material'
import { createServiceDeliveries } from '../hooks/useAppointmentSubmission'
import { fetchAppointments } from 'src/store/apps/pharmacy-services/pharmacyServicesThunks'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { useDispatch } from 'react-redux'

function ServiceDeliveryComponent({ appointment, onClose }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [configuring, setConfiguring] = useState(false)
  const [serviceDeliveries, setServiceDeliveries] = useState([])
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  useEffect(() => {
    if (appointment) {
      fetchServiceDeliveries()
    }
  }, [appointment])

  const fetchServiceDeliveries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ps_service_delivery')
        .select(`*, ps_service_stages!ps_service_delivery_service_stage_id_fkey(*)`)
        .eq('appointment_id', appointment.id)

      if (error) throw error
      setServiceDeliveries(data || [])
    } catch (error) {
      console.error('Error fetching service deliveries:', error)
      showSnackbar('Error fetching service deliveries', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigureService = async () => {
    setConfiguring(true)
    try {
      await createServiceDeliveries(appointment.id, appointment.service_id, appointment.current_stage_id)
      await fetchServiceDeliveries()
      dispatch(fetchAppointments())
      showSnackbar('Service configured successfully', 'success')
    } catch (error) {
      console.error('Error configuring service deliveries:', error)
      showSnackbar('Error configuring service', 'error')
    } finally {
      setConfiguring(false)
    }
  }

  const handleGoToDelivery = delivery => {
    // router.push(`/services/service-delivery/${delivery.id}`)
    const url = `/services/service-delivery/${delivery.id}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleView = delivery => {
    setSelectedDelivery(delivery)
    setViewDialogOpen(true)
  }

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  if (!appointment) {
    return <Typography>No appointment selected</Typography>
  }

  return (
    <Box>
      <Typography variant='h5'>Service Delivery for {appointment.patient_object?.full_name}</Typography>
      <Typography>Service: {appointment.service_name}</Typography>
      <Typography>Scheduled Time: {appointment.scheduled_time}</Typography>
      <Typography>Appointment Type: {appointment.appointment_type}</Typography>

      {loading ? (
        <CircularProgress />
      ) : serviceDeliveries.length > 0 ? (
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Stage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serviceDeliveries.map(delivery => (
                <TableRow key={delivery.id}>
                  <TableCell>{delivery.ps_service_stages.name}</TableCell>
                  <TableCell>{delivery.status}</TableCell>
                  <TableCell>
                    <Button variant='contained' size='small' onClick={() => handleGoToDelivery(delivery)}>
                      Go to Delivery
                    </Button>
                    <Button variant='outlined' size='small' onClick={() => handleView(delivery)} sx={{ ml: 1 }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Box>
          <Typography>No service deliveries configured</Typography>
          <Button onClick={handleConfigureService} disabled={configuring}>
            {configuring ? <CircularProgress size={24} /> : 'Configure Service'}
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Button onClick={fetchServiceDeliveries} disabled={loading} sx={{ mr: 1 }}>
          Refresh
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Box>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
        <DialogTitle>Delivery Details</DialogTitle>
        <DialogContent>
          {selectedDelivery && (
            <Box>
              <Typography>Stage: {selectedDelivery.ps_service_stages.name}</Typography>
              <Typography>Status: {selectedDelivery.status}</Typography>
              <Typography>Appointment Type: {appointment.appointment_type}</Typography>
              {/* Add more delivery details here */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
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

export default ServiceDeliveryComponent
