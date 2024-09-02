import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Modal,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { useSelector } from 'react-redux'

const ServiceManagement = () => {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [subscriptions, setSubscriptions] = useState({})
  const [selectedService, setSelectedService] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('info')
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
    open: false,
    serviceId: null
  })

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setOpenSnackbar(true)
  }

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }

  useEffect(() => {
    fetchServices()
    fetchSubscriptions()
  }, [])

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('ps_services')
      .select('*')
      .or(`is_custom.eq.false,organisation.eq.${orgId}`)

    if (error) console.error('Error fetching services:', error)
    else setServices(data)
  }

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase.from('ps_pharmacy_services').select('service_id').eq('pharmacy_id', orgId)

    if (error) console.error('Error fetching subscriptions:', error)
    else {
      const subMap = data.reduce((acc, sub) => {
        acc[sub.service_id] = true
        return acc
      }, {})
      setSubscriptions(subMap)
    }
  }

  const handleSubscription = async (serviceId, isSubscribed) => {
    if (isSubscribed) {
      const { error } = await supabase
        .from('ps_pharmacy_services')
        .delete()
        .eq('service_id', serviceId)
        .eq('pharmacy_id', orgId)

      if (error) console.error('Error unsubscribing:', error)
      else setSubscriptions(prev => ({ ...prev, [serviceId]: false }))
    } else {
      const { error } = await supabase
        .from('ps_pharmacy_services')
        .insert({ service_id: serviceId, pharmacy_id: orgId })

      if (error) console.error('Error subscribing:', error)
      else setSubscriptions(prev => ({ ...prev, [serviceId]: true }))
    }
  }

  const handleDeleteService = async serviceId => {
    setConfirmDeleteDialog({ open: false, serviceId: null })
    setLoading(true)
    try {
      const { error } = await supabase.from('ps_services').delete().eq('id', serviceId)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting service:', error)
      showSnackbar('Error deleting service. Please try again.', 'error')
    } finally {
      setLoading(false)
      fetchServices()
      fetchSubscriptions()
      setSelectedService(null)
      setIsModalOpen(false)
    }
  }

  const handleViewDetails = service => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedService(null)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant='h4'>Service Management</Typography>
        <Box>
          <Button
            variant='contained'
            startIcon={<Icon icon='mdi:calendar-month' />}
            onClick={() => router.push('/services/service-management/availability')}
            sx={{ mr: 2 }}
          >
            Manage Availability
          </Button>
          <Button
            variant='contained'
            startIcon={<Icon icon='mdi:plus' />}
            onClick={() => router.push('/services/service-management/create')}
          >
            Create Custom Service
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Subscribed</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map(service => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{service.is_custom ? 'Custom' : 'Standard'}</TableCell>
                <TableCell>
                  <Switch
                    checked={!!subscriptions[service.id]}
                    onChange={() => handleSubscription(service.id, subscriptions[service.id])}
                    disabled={service.is_custom && service.organisation !== orgId}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title='View Details'>
                    <IconButton onClick={() => handleViewDetails(service)}>
                      <Icon icon='mdi:eye' />
                    </IconButton>
                  </Tooltip>
                  {service.is_custom && service.organisation === orgId && (
                    <>
                      <Tooltip title='Edit'>
                        <IconButton onClick={() => router.push(`/services/service-management/create?id=${service.id}`)}>
                          <Icon icon='mdi:pencil' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton onClick={() => setConfirmDeleteDialog({ open: true, serviceId: service.id })}>
                          <Icon icon='mdi:delete' />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />

      <Dialog
        open={confirmDeleteDialog.open}
        onClose={() => setConfirmDeleteDialog({ open: false, serviceId: null })}
        aria-labelledby='confirm-delete-dialog-title'
        aria-describedby='confirm-delete-dialog-description'
      >
        <DialogTitle id='confirm-delete-dialog-title'>Delete Service</DialogTitle>
        <DialogContent>
          <DialogContentText id='confirm-delete-dialog-description'>
            Are you sure you want to delete this service?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog({ open: false, serviceId: null })}>Cancel</Button>
          <Button onClick={() => handleDeleteService(confirmDeleteDialog.serviceId)}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby='service-details-modal'
        aria-describedby='modal-modal-description'
      >
        <Card
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4
          }}
        >
          {selectedService && (
            <>
              <CardContent>
                <Typography variant='h5' component='div'>
                  {selectedService.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color='text.secondary'>
                  {selectedService.is_custom ? 'Custom Service' : 'Standard Service'}
                </Typography>
                <Typography variant='body2'>{selectedService.description}</Typography>
                <Typography variant='body2' sx={{ mt: 2 }}>
                  Abbreviation: {selectedService.abbreviation}
                </Typography>
                <Typography variant='body2'>Multi-stage: {selectedService.multi ? 'Yes' : 'No'}</Typography>
              </CardContent>
              <CardActions>
                <Button size='small' onClick={handleCloseModal}>
                  Close
                </Button>
              </CardActions>
            </>
          )}
        </Card>
      </Modal>
    </Box>
  )
}

export default ServiceManagement
