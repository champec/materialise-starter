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
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material'
import { createServiceDeliveries } from '../hooks/useAppointmentSubmission'
import {
  fetchAppointments,
  fetchServiceDeliveries
} from '../../../../store/apps/pharmacy-services/pharmacyServicesThunks'
import { useDispatch, useSelector } from 'react-redux'
import ServiceDeliverySummary from './ServiceDeliverySummary'
import ServiceDeliveryChat from './ServiceDeliveryChat'
import Icon from 'src/@core/components/icon'
import { format } from 'date-fns'

function ServiceDeliveryComponent({ appointment: appointmentObject, onClose, onEdit }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [configuring, setConfiguring] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [showChat, setShowChat] = useState(false)
  const [canDeliverService, setCanDeliverService] = useState(null)
  const serviceDeliveries = useSelector(state => state.services.serviceDeliveries)
  const appointment = useSelector(state => state.services.appointments.find(a => a.id === appointmentObject?.id))

  useEffect(() => {
    if (appointment) {
      dispatch(fetchServiceDeliveries(appointmentObject?.id)).then(() => {
        setLoading(false)
      })
    }
  }, [appointment])

  const handleConfigureService = async () => {
    if (appointment.appointment_source !== 'pharmex' && serviceDeliveries.length === 0) {
      handleEditAppointment(appointment)
    } else {
      setConfiguring(true)
      try {
        await createServiceDeliveries(appointment.id, appointment.service_id, appointment.current_stage_id)
        await dispatch(fetchServiceDeliveries(appointment.id))
        dispatch(fetchAppointments())
        showSnackbar('Service configured successfully', 'success')
      } catch (error) {
        console.error('Error configuring service deliveries:', error)
        showSnackbar('Error configuring service', 'error')
      } finally {
        setConfiguring(false)
      }
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

  const formatDate = date => format(new Date(date), 'dd/MM/yyyy HH:mm')

  if (!appointment) {
    return <Typography>No appointment selected</Typography>
  }

  const showEditButton = serviceDeliveries.length > 0 || appointment.appointment_source === 'pharmex'
  const showConfigureButton = serviceDeliveries.length < 1

  const renderAppointmentDetails = () => (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant='h6' gutterBottom>
        Appointment Details
      </Typography>
      <Typography>
        <strong>Patient:</strong> {appointment.patient_object?.full_name}
      </Typography>
      <Typography>
        <strong>NHS Number:</strong> {appointment.nhs_number}
      </Typography>
      <Typography>
        <strong>Mobile:</strong> {appointment?.patient_object?.mobile_number}
      </Typography>
      <Typography>
        <strong>Presenting Complaint:</strong> {appointment.presenting_complaint}
      </Typography>
      <Typography>
        <strong>Service:</strong> {appointment?.ps_services?.name}
      </Typography>
      <Typography>
        <strong>Current Stage:</strong>{' '}
        {appointment?.current_stage_id ? `${appointment?.ps_service_stages?.name}` : 'Not set'}
      </Typography>
      <Typography>
        <strong>Appointment Type:</strong> {appointment.appointment_type === 'remote' ? 'Remote' : 'In-person'}{' '}
        appointment
      </Typography>
      <Typography>
        <strong>Scheduled Time:</strong>{' '}
        {appointment.scheduled_time ? formatDate(appointment.scheduled_time) : 'Not scheduled'}
      </Typography>
      <Typography>
        <strong>Source:</strong> {appointment.appointment_source}
      </Typography>
      {appointment.gp_object && (
        <Box mt={2}>
          <Typography variant='subtitle1'>GP Information</Typography>
          <Typography>{appointment.gp_object.name}</Typography>
          <Typography>{appointment.gp_object.address}</Typography>
        </Box>
      )}
      {appointment.referral && (
        <Box mt={2}>
          <Typography variant='subtitle1'>Referral Details</Typography>
          <Typography>{JSON.stringify(appointment.referral)}</Typography>
        </Box>
      )}
    </Paper>
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
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
              <Box>
                {renderAppointmentDetails()}
                {showEditButton && (
                  <Button variant='outlined' onClick={() => handleEditAppointment(appointment)} sx={{ mr: 1 }}>
                    Edit Appointment
                  </Button>
                )}
                {showConfigureButton && (
                  <Button
                    onClick={handleConfigureService}
                    disabled={
                      configuring || (appointment.appointment_source !== 'pharmex' && canDeliverService === null)
                    }
                  >
                    {configuring ? <CircularProgress size={24} /> : 'Configure Service'}
                  </Button>
                )}
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
                {renderAppointmentDetails()}
                {appointment.appointment_source !== 'pharmex' && (
                  <Box mb={2}>
                    <Typography>Can you deliver this service?</Typography>
                    <Button
                      variant={canDeliverService === true ? 'contained' : 'outlined'}
                      onClick={() => setCanDeliverService(true)}
                      sx={{ mr: 1 }}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={canDeliverService === false ? 'contained' : 'outlined'}
                      onClick={() => setCanDeliverService(false)}
                    >
                      No
                    </Button>
                  </Box>
                )}
                {showEditButton && (
                  <Button variant='outlined' onClick={() => handleEditAppointment(appointment)} sx={{ mr: 1 }}>
                    Edit Appointment
                  </Button>
                )}
                {showConfigureButton && (
                  <Button
                    onClick={handleConfigureService}
                    disabled={
                      configuring || (appointment.appointment_source !== 'pharmex' && canDeliverService === null)
                    }
                  >
                    {configuring ? <CircularProgress size={24} /> : 'Configure Service'}
                  </Button>
                )}
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
