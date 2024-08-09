import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import withReducer from 'src/@core/HOC/withReducer'
import pharmacyServicesSlice, {
  setServiceFilter,
  setStatusFilter,
  selectFilteredAppointments,
  selectServices,
  selectServiceFilter,
  selectStatusFilter
} from 'src/store/apps/pharmacy-services/pharmacyServicesSlice'
import format from 'date-fns/format'
import { fetchAppointments, fetchServicesWithStages } from 'src/store/apps/pharmacy-services/pharmacyServicesThunks'
import {
  Grid,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Container,
  Box,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  Menu,
  Dialog,
  DialogContent,
  Tooltip,
  IconButton,
  DialogTitle,
  DialogActions
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import BatchActionsModal from './components/BatchActionsModal'
import Icon from 'src/@core/components/icon'
import BookingComponent from './BookingComponent'
import ServiceDeliveryComponent from './components/ServiceDeliveryComponent'

const Header = ({ onNewBooking }) => (
  <AppBar position='static'>
    <Toolbar>
      <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
        Pharmacy Services
      </Typography>
      <Button color='inherit' onClick={onNewBooking}>
        New Booking
      </Button>
    </Toolbar>
  </AppBar>
)

const Footer = () => (
  <Box component='footer' sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'primary.main', color: 'white' }}>
    <Container maxWidth='sm'>
      <Typography variant='body1'>© 2024 Pharmacy Services. All rights reserved.</Typography>
    </Container>
  </Box>
)

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

function PharmacyServicesPage() {
  const dispatch = useDispatch()
  const appointments = useSelector(selectFilteredAppointments)
  const services = useSelector(selectServices)
  const [pageSize, setPageSize] = useState(10)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const selectedServices = useSelector(selectServiceFilter)
  const selectedStatuses = useSelector(selectStatusFilter)
  const [anchorEl, setAnchorEl] = useState(null)
  const [batchActionAnchorEl, setBatchActionAnchorEl] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [openStatusDetails, setOpenStatusDetails] = useState(false)
  const [statusDetails, setStatusDetails] = useState(null)
  const [isBatchActionsModalOpen, setIsBatchActionsModalOpen] = useState(false)
  const [selectedAppointments, setSelectedAppointments] = useState([])
  const [currentBatchAction, setCurrentBatchAction] = useState('')

  const statuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled']

  console.log('APPOINTMENTS', { appointments })

  const handleActionClick = (event, appointment) => {
    setAnchorEl(event.currentTarget)
    setSelectedAppointment(appointment)
  }

  const handleBatchActionSelect = action => {
    handleBatchActionClose()
    setCurrentBatchAction(action)
    setIsBatchActionsModalOpen(true)
  }

  const handleActionClose = () => {
    setAnchorEl(null)
    // setSelectedAppointment(null)
  }

  const handleActionSelect = action => {
    handleActionClose()
    switch (action) {
      case 'edit':
        setEditingAppointment(selectedAppointment)
        setIsDrawerOpen(true)
        break
      case 'deliver':
        setIsDeliveryModalOpen(true)
        break
      // Add more cases for other actions as needed
    }
  }

  const handleBatchActionsClick = event => {
    setBatchActionAnchorEl(event.currentTarget)
  }

  useEffect(() => {
    dispatch(fetchAppointments())
    dispatch(fetchServicesWithStages())
  }, [dispatch])

  useEffect(() => {
    dispatch(setServiceFilter(selectedServices))
  }, [selectedServices, dispatch])

  useEffect(() => {
    dispatch(setStatusFilter(selectedStatuses))
  }, [selectedStatuses, dispatch])

  const handleNewBooking = () => {
    setEditingAppointment(null)
    setIsDrawerOpen(true)
  }

  const handleEditBooking = appointment => {
    setEditingAppointment(appointment)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setEditingAppointment(null)
  }

  const handleServiceChange = (event, child) => {
    const clickedValue = child.props.value
    console.log('Clicked service:', clickedValue)

    let newSelectedServices
    if (clickedValue === 'all') {
      newSelectedServices = selectedServices.includes('all') ? [] : ['all', ...services.map(s => s.id)]
    } else {
      if (selectedServices.includes(clickedValue)) {
        newSelectedServices = selectedServices.filter(id => id !== clickedValue && id !== 'all')
      } else {
        newSelectedServices = [...selectedServices.filter(id => id !== 'all'), clickedValue]
        if (newSelectedServices.length === services.length) {
          newSelectedServices.unshift('all')
        }
      }
    }

    dispatch(setServiceFilter(newSelectedServices))
  }

  const renderStatusDetails = (service, statusDetails) => {
    // This function will render status details based on the service type
    // You can customize this further based on your specific requirements
    switch (service.abbreviation) {
      case 'PFx':
        return (
          <>
            <div>Current stage: {statusDetails?.currentStage}</div>
            <div>Completed stages: {statusDetails?.completedStages.join(', ')}</div>
          </>
        )
      case 'DMSx':
        return (
          <>
            <div>Referral status: {statusDetails?.referralStatus}</div>
            <div>Review status: {statusDetails?.reviewStatus}</div>
          </>
        )
      // Add more cases for other service types
      default:
        return JSON.stringify(statusDetails)
    }
  }

  const handleStatusDetailsClick = appointment => {
    const service = services.find(s => s.id === appointment.service_id)
    const statusDetailsContent = renderStatusDetails(service, appointment.status_details)
    setStatusDetails(statusDetailsContent)
    // setServiceName(service.name);
    setOpenStatusDetails(true)
  }

  const handleCloseStatusDetails = () => {
    setOpenStatusDetails(false)
  }

  const handleStatusChange = (event, child) => {
    const clickedValue = child.props.value
    console.log('Clicked status:', clickedValue)

    let newSelectedStatuses
    if (clickedValue === 'all') {
      newSelectedStatuses = selectedStatuses.includes('all') ? [] : ['all', ...statuses]
    } else {
      if (selectedStatuses.includes(clickedValue)) {
        newSelectedStatuses = selectedStatuses.filter(status => status !== clickedValue && status !== 'all')
      } else {
        newSelectedStatuses = [...selectedStatuses.filter(status => status !== 'all'), clickedValue]
        if (newSelectedStatuses.length === statuses.length) {
          newSelectedStatuses.unshift('all')
        }
      }
    }

    dispatch(setStatusFilter(newSelectedStatuses))
  }

  const renderServiceValue = selected => {
    if (selected.includes('all')) {
      return 'All'
    }
    return selected.map(id => services.find(s => s.id === id)?.name).join(', ')
  }

  const handleBatchActionClose = () => {
    setBatchActionAnchorEl(null)
  }

  const renderStatusValue = selected => {
    if (selected.includes('all')) {
      return 'All'
    }
    return selected.join(', ')
  }

  const columns = [
    // { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'patientName',
      headerName: 'Patient Name',
      width: 130,
      valueGetter: params => params.row.patient_object?.full_name || 'N/A'
    },
    {
      field: 'serviceName',
      headerName: 'Service',
      width: 130,
      valueGetter: params => {
        const service = services.find(s => s.id === params.row.service_id)
        return service ? `${service.abbreviation} - ${service.name}` : ''
      }
    },
    {
      field: 'currentStage',
      headerName: 'Current Stage',
      width: 150,
      valueGetter: params => {
        const service = services.find(s => s.id === params.row.service_id)
        const stage = service?.stages.find(stage => stage.id === params.row.current_stage_id)
        return stage ? stage.name : 'N/A'
      }
    },
    {
      field: 'scheduledTime',
      headerName: 'Scheduled Time',
      width: 180,
      valueGetter: params => format(new Date(params.row.scheduled_time), 'PPpp')
    },
    {
      field: 'overall_status',
      headerName: 'Status',
      width: 180,
      renderCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {params.row.overall_status}
          <Tooltip title='View Status Details'>
            <IconButton size='small' onClick={() => handleStatusDetailsClick(params.row)}>
              <Icon icon='icon-park:info' fontSize='small' />
            </IconButton>
          </Tooltip>
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: params => (
        <Button onClick={event => handleActionClick(event, params.row)} variant='outlined' size='small'>
          Actions
        </Button>
      )
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onNewBooking={handleNewBooking} />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant='h4' gutterBottom>
              Appointments
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id='service-multiple-checkbox-label'>Services</InputLabel>
              <Select
                labelId='service-multiple-checkbox-label'
                id='service-multiple-checkbox'
                multiple
                value={selectedServices}
                onChange={handleServiceChange}
                input={<OutlinedInput label='Services' />}
                renderValue={renderServiceValue}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                      width: 300 // Increase width to prevent text cutoff
                    }
                  }
                }}
              >
                <MenuItem value='all'>
                  <Checkbox checked={selectedServices.length === services.length + 1} />
                  <ListItemText
                    primary={selectedServices.length === services.length + 1 ? 'Deselect All' : 'Select All'}
                  />
                </MenuItem>
                {services.map(service => (
                  <MenuItem key={service.id} value={service.id} style={{ whiteSpace: 'normal' }}>
                    <Checkbox checked={selectedServices.includes(service.id) || selectedServices.includes('all')} />
                    <ListItemText
                      primary={service.name}
                      secondary={service.abbreviation}
                      primaryTypographyProps={{ style: { whiteSpace: 'normal' } }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id='status-multiple-checkbox-label'>Statuses</InputLabel>
              <Select
                labelId='status-multiple-checkbox-label'
                id='status-multiple-checkbox'
                multiple
                value={selectedStatuses}
                onChange={handleStatusChange}
                input={<OutlinedInput label='Statuses' />}
                renderValue={renderStatusValue}
                MenuProps={MenuProps}
              >
                <MenuItem value='all'>
                  <Checkbox checked={selectedStatuses.length === statuses.length + 1} />
                  <ListItemText
                    primary={selectedStatuses.length === statuses.length + 1 ? 'Deselect All' : 'Select All'}
                  />
                </MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={selectedStatuses.includes(status) || selectedStatuses.includes('all')} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant='contained'
              color='primary'
              onClick={handleBatchActionsClick}
              disabled={selectedAppointments.length === 0}
              endIcon={<Icon icon='mdi:chevron-down' />}
              fullWidth
            >
              Batch Actions
            </Button>
            <Menu anchorEl={batchActionAnchorEl} open={Boolean(batchActionAnchorEl)} onClose={handleBatchActionClose}>
              <MenuItem onClick={() => handleBatchActionSelect('submitClaim')}>Submit Claim</MenuItem>
              {/* Add more menu items for other batch actions here */}
            </Menu>
          </Grid>
          <Grid item xs={12}>
            <DataGrid
              rows={appointments}
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={newPageSize => setPageSize(newPageSize)}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              disableSelectionOnClick
              onSelectionModelChange={newSelectionModel => {
                setSelectedAppointments(newSelectionModel)
              }}
              autoHeight
            />
          </Grid>
        </Grid>
      </Container>
      <Footer />
      <Drawer anchor='left' open={isDrawerOpen} onClose={handleCloseDrawer}>
        <BookingComponent appointment={editingAppointment} onClose={handleCloseDrawer} />
      </Drawer>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionClose}>
        <MenuItem onClick={() => handleActionSelect('edit')}>Edit</MenuItem>
        <MenuItem onClick={() => handleActionSelect('deliver')}>Deliver</MenuItem>
        {/* Add more menu items for other actions as needed */}
      </Menu>
      {selectedAppointment && (
        <Dialog
          open={isDeliveryModalOpen}
          onClose={() => {
            setIsDeliveryModalOpen(false)
            // Optionally reset selectedAppointment here if needed
            // setSelectedAppointment(null)
          }}
          maxWidth='lg'
          fullWidth
        >
          <DialogContent sx={{ minWidth: '800px', minHeight: '600px' }}>
            <ServiceDeliveryComponent appointment={selectedAppointment} onClose={() => setIsDeliveryModalOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={openStatusDetails} onClose={handleCloseStatusDetails} aria-labelledby='status-details-dialog-title'>
        <DialogTitle id='status-details-dialog-title'>Status Details for</DialogTitle>
        <DialogContent>{statusDetails}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDetails}>Close</Button>
        </DialogActions>
      </Dialog>
      <BatchActionsModal
        open={isBatchActionsModalOpen}
        onClose={() => setIsBatchActionsModalOpen(false)}
        selectedAppointments={selectedAppointments}
        appointments={appointments}
        action={currentBatchAction} // Add this state to track the current batch action
      />
    </Box>
  )
}

export default withReducer({
  services: pharmacyServicesSlice
})(PharmacyServicesPage)
