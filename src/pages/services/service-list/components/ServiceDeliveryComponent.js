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
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material'
import { createServiceDeliveries } from '../hooks/useAppointmentSubmission'
import {
  fetchAppointments,
  fetchServiceDeliveries
} from '../../../../store/apps/pharmacy-services/pharmacyServicesThunks' //'src/store/apps/pharmacy-services/pharmacyServicesThunks'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { useDispatch, useSelector } from 'react-redux'
import ServiceDeliverySummary from './ServiceDeliverySummary'
import ServiceDeliveryChat from './ServiceDeliveryChat'
import Icon from 'src/@core/components/icon'

function ServiceDeliveryComponent({ appointment: appointmentObject, onClose, onEdit }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [configuring, setConfiguring] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [showChat, setShowChat] = useState(false)
  const serviceDeliveries = useSelector(state => state.services.serviceDeliveries)
  const appointment = useSelector(state => state.services.appointments.find(a => a.id === appointmentObject?.id))

  useEffect(() => {
    if (appointment) {
      dispatch(fetchServiceDeliveries(appointmentObject?.id)).then(() => {
        console.log('serviceDeliveries', serviceDeliveries)
        setLoading(false)
      })
    }
  }, [appointment])

  // const fetchServiceDeliveries = async () => {
  //   setLoading(true)
  //   try {
  //     const data = await dispatch(fetchServiceDeliveries(appointment)).unwrap()
  //   } catch (error) {
  //     console.error('Error fetching service deliveries:', error)
  //     showSnackbar('Error fetching service deliveries', 'error')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

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

  const handleEditAppointment = appointment => {
    onEdit(appointment)
  }

  const handleGoToDelivery = delivery => {
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

  const toggleChat = () => setShowChat(!showChat)

  if (!appointment) {
    return <Typography>No appointment selected</Typography>
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ mb: 4 }}>
          <Typography variant='h5'>Service Delivery for {appointment.patient_object?.full_name}</Typography>
          <Typography>Service: {appointment?.ps_services?.name}</Typography>
          <Typography>Scheduled Time: {appointment.scheduled_time}</Typography>
          <Typography>Appointment Type: {appointment.appointment_type}</Typography>

          <Button variant='outlined' onClick={() => handleEditAppointment(appointment)}>
            Edit Appointment
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button
                variant='contained'
                onClick={toggleChat}
                startIcon={<Icon icon={showChat ? 'mdi:table' : 'mdi:message-outline'} />}
              >
                {showChat ? 'Show Deliveries' : 'Show Chat'}
              </Button>
              <Button onClick={onClose}>Close</Button>
            </Box>
            {showChat ? (
              <ServiceDeliveryChat appointment={appointment} />
            ) : loading ? (
              <CircularProgress />
            ) : serviceDeliveries.length > 0 ? (
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
            ) : (
              <Box>
                <Typography>No service deliveries configured</Typography>
                <Button onClick={handleConfigureService} disabled={configuring}>
                  {configuring ? <CircularProgress size={24} /> : 'Configure Service'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {selectedDelivery && (
        <ServiceDeliverySummary
          deliveryId={selectedDelivery.id}
          onClose={() => {
            setViewDialogOpen(false)
            setSelectedDelivery(null)
          }}
        />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  )
}

export default ServiceDeliveryComponent
