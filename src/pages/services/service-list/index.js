import React, { useEffect, useState, forwardRef } from 'react'
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
// import addDays from 'date-fns/addDays'
import { addDays, subDays, parse } from 'date-fns'
import {
  fetchAppointments,
  fetchServicesWithStages
} from '../../../store/apps/pharmacy-services/pharmacyServicesThunks'
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
  DialogActions,
  TextField,
  InputAdornment,
  Collapse
} from '@mui/material'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import BatchActionsModal from './components/BatchActionsModal'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import Icon from 'src/@core/components/icon'
import BookingComponent from './BookingComponent'
import ServiceDeliveryComponent from './components/ServiceDeliveryComponent'
import DatePicker from 'react-datepicker'
import { useTheme } from '@mui/material/styles'

// ** Styled Component
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
// import pharmExLogo from '/images/pharmEx-logo-light.png'
// import nhs111logo from '/images/nhs/NHS.svg'

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

const CustomInput = forwardRef((props, ref) => {
  const { label, start, end, onChange, ...rest } = props
  const [inputValue, setInputValue] = useState(
    `${format(start, 'dd/MM/yyyy')}${end ? ` - ${format(end, 'dd/MM/yyyy')}` : ''}`
  )
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handleInputChange = event => {
    setInputValue(event.target.value)
  }

  const handleInputBlur = () => {
    const [startStr, endStr] = inputValue.split(' - ')
    try {
      const startDate = parse(startStr, 'dd/MM/yyyy', new Date())
      const endDate = endStr ? parse(endStr, 'dd/MM/yyyy', new Date()) : null
      if (!isNaN(startDate.getTime()) && (endDate === null || !isNaN(endDate.getTime()))) {
        onChange([startDate, endDate])
      } else {
        // If parsing fails, revert to the original dates
        setInputValue(`${format(start, 'dd/MM/yyyy')}${end ? ` - ${format(end, 'dd/MM/yyyy')}` : ''}`)
      }
    } catch (error) {
      // If parsing fails, revert to the original dates
      setInputValue(`${format(start, 'dd/MM/yyyy')}${end ? ` - ${format(end, 'dd/MM/yyyy')}` : ''}`)
    }
  }

  const handleDateChange = dates => {
    const [newStart, newEnd] = dates
    setInputValue(`${format(newStart, 'dd/MM/yyyy')}${newEnd ? ` - ${format(newEnd, 'dd/MM/yyyy')}` : ''}`)
    onChange(dates)
  }

  return (
    <FormControl>
      <TextField
        {...rest}
        ref={ref}
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton onClick={() => setIsPickerOpen(true)}>
                <Icon icon='mdi:calendar' />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <DatePicker
        selectsRange
        monthsShown={2}
        startDate={start}
        endDate={end}
        // selected={endDate}
        selectedDates={[start, end]}
        onChange={handleDateChange}
        onClickOutside={() => setIsPickerOpen(false)}
        open={isPickerOpen}
        customInput={<div style={{ display: 'none' }} />} // Hidden input
      />
    </FormControl>
  )
})

//! fix the assymetrical filters for date range picker
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
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState([])
  const [currentBatchAction, setCurrentBatchAction] = useState('')
  const [openSourceDetails, setOpenSourceDetails] = useState(false)
  const [sourceDetails, setSourceDetails] = useState(null)
  const [startDate, setStartDate] = useState(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState(addDays(new Date(), 30))
  const [fetchOption, setFetchOption] = useState('dateRange')
  const [showFilters, setShowFilters] = useState(false)

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const statuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled']

  console.log('APPOINTMENTS', { appointments })

  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  const handleDateRangeChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
    // Dispatch fetchAppointments with the new date range
    dispatch(fetchAppointments({ startDate: start, endDate: end }))
  }

  useEffect(() => {
    let fetchParams = {}
    switch (fetchOption) {
      case 'dateRange':
        fetchParams = { startDate, endDate }
        break
      case 'recent50':
        fetchParams = { fetchType: 'recent', limit: 50 }
        break
      case 'recentUpdates':
        fetchParams = { fetchType: 'recentUpdates', limit: 50 }
        break
    }
    dispatch(fetchAppointments(fetchParams))
  }, [dispatch, fetchOption, startDate, endDate])

  const handleFetchOptionChange = event => {
    setFetchOption(event.target.value)
  }

  const handleViewClick = appointment => {
    setSelectedAppointment(appointment)
    setIsDeliveryModalOpen(true)
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

  // const handleActionSelect = action => {
  //   handleActionClose()
  //   switch (action) {
  //     case 'edit':
  //       setEditingAppointment(selectedAppointment)
  //       setIsDrawerOpen(true)
  //       break
  //     case 'deliver':
  //       setIsDeliveryModalOpen(true)
  //       break
  //     // Add more cases for other actions as needed
  //   }
  // }

  const handleBatchActionsClick = event => {
    setBatchActionAnchorEl(event.currentTarget)
  }

  useEffect(() => {
    dispatch(fetchAppointments({ startDate, endDate }))
    dispatch(fetchServicesWithStages())
  }, [dispatch, startDate, endDate])

  useEffect(() => {
    dispatch(setServiceFilter(selectedServices))
  }, [selectedServices, dispatch])

  useEffect(() => {
    dispatch(setStatusFilter(selectedStatuses))
  }, [selectedStatuses, dispatch])

  useEffect(() => {
    if (selectedAppointmentIds.length > 0 && !showFilters) {
      setShowFilters(true)
    }
  }, [selectedAppointmentIds])

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

  const renderSourceDetails = source => {
    return JSON.stringify(source)
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

  const handleSourceDetailsClick = appointment => {
    const sourceDetailsContent = renderSourceDetails(appointment.source_details)
    setSourceDetails(sourceDetailsContent)
    setOpenSourceDetails(true)
  }

  const handleCloseStatusDetails = () => {
    setOpenStatusDetails(false)
  }

  const handleCloseSourceDetails = () => {
    setOpenSourceDetails(false)
  }

  const renderSourceTextIcon = source => {
    switch (source) {
      case 'pharmex':
        return <img src={'/images/pharmEx-logo-light.png'} alt='NHS 111 logo' width={20} height={20} />
      case 'booked':
        return (
          <>
            <Icon icon='healthicons:i-schedule-school-date-time-outline' style={{ fontSize: '1.5rem' }} />
            <span>Booked</span>
          </>
        )
      case '111Referral':
        return <img src={'/images/nhs/NHS.svg'} alt='NHS 111 logo' width={20} height={20} />
      case 'quickService':
        return (
          <>
            <img src={'/images/pharmEx-logo-light.png'} alt='NHS 111 logo' width={20} height={20} />
            <Icon icon='emojione-v1:lightning-mood' style={{ fontSize: '1.5rem' }} />
          </>
        )
      default:
        // return an iconify icon that best represent quick booking
        return null
    }
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

  const sourceInfo = {
    appointment_source: 'pharmex',
    source_details: 'Booked with Service List'
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
      field: 'source',
      headerName: 'Source',
      width: 180,
      renderCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {renderSourceTextIcon(params.row.appointment_source)}
          {params.row.source_details ? (
            <Tooltip title={params.row.source_details}>
              <IconButton size='small' onClick={() => handleSourceDetailsClick(params.row)}>
                <Icon icon='icon-park:info' fontSize='small' />
              </IconButton>
            </Tooltip>
          ) : (
            <Icon icon='mdi:information-outline' fontSize='small' />
          )}
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: params => (
        <Button variant='contained' size='small' onClick={() => handleViewClick(params.row)}>
          View
        </Button>
      )
    }
  ]

  return (
    <DatePickerWrapper>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header onNewBooking={handleNewBooking} />
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h4'>Appointments</Typography>
              <Button
                variant='outlined'
                startIcon={<Icon icon={showFilters ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
                onClick={toggleFilters}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Collapse in={showFilters}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel id='service-multiple-checkbox-label'>Services</InputLabel>
                      <Select
                        labelId='service-multiple-checkbox-label'
                        id='service-multiple-checkbox'
                        multiple
                        value={selectedServices}
                        onChange={handleServiceChange}
                        input={<OutlinedInput label='Services' />}
                        renderValue={renderServiceValue}
                        MenuProps={MenuProps}
                      >
                        <MenuItem value='all'>
                          <Checkbox checked={selectedServices.length === services.length + 1} />
                          <ListItemText
                            primary={selectedServices.length === services.length + 1 ? 'Deselect All' : 'Select All'}
                          />
                        </MenuItem>
                        {services.map(service => (
                          <MenuItem key={service.id} value={service.id} style={{ whiteSpace: 'normal' }}>
                            <Checkbox
                              checked={selectedServices.includes(service.id) || selectedServices.includes('all')}
                            />
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
                    <FormControl fullWidth>
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
                      disabled={selectedAppointmentIds.length === 0}
                      endIcon={<Icon icon='mdi:chevron-down' />}
                      fullWidth
                    >
                      Batch Actions
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={4}>
                        <FormControl fullWidth>
                          <InputLabel id='fetch-option-label'>Fetch Option</InputLabel>
                          <Select
                            labelId='fetch-option-label'
                            id='fetch-option-select'
                            value={fetchOption}
                            onChange={handleFetchOptionChange}
                            input={<OutlinedInput label='Fetch Option' />}
                            MenuProps={MenuProps}
                          >
                            <MenuItem value='dateRange'>Date Range</MenuItem>
                            <MenuItem value='recent50'>Recent 50</MenuItem>
                            <MenuItem value='recentUpdates'>Recent Updates</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        {fetchOption === 'dateRange' && (
                          <CustomInput
                            label='Date Range'
                            start={startDate}
                            end={endDate}
                            onChange={handleDateRangeChange}
                          />
                        )}
                      </Grid>
                      <Grid item xs={4}>
                        <Button variant='outlined' fullWidth>
                          Save Settings
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Collapse>
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
                  setSelectedAppointmentIds(newSelectionModel)
                }}
                components={{
                  Toolbar: GridToolbar
                }}
                autoHeight
              />
            </Grid>
          </Grid>
        </Container>
        <Footer />
        <Drawer anchor='left' open={isDrawerOpen} onClose={handleCloseDrawer} sx={{ zIndex: 1201 }}>
          <BookingComponent appointment={editingAppointment} source={sourceInfo} onClose={handleCloseDrawer} />
        </Drawer>
        {selectedAppointment && (
          <Dialog
            open={isDeliveryModalOpen}
            onClose={() => {
              setIsDeliveryModalOpen(false)
            }}
            maxWidth='lg'
            fullWidth
            sx={{ zIndex: 1200 }}
          >
            <DialogContent sx={{ minWidth: '800px', minHeight: '600px' }}>
              <ServiceDeliveryComponent
                appointment={selectedAppointment}
                onClose={() => setIsDeliveryModalOpen(false)}
                onEdit={handleEditBooking}
              />
            </DialogContent>
          </Dialog>
        )}
        <Dialog
          open={openStatusDetails}
          onClose={handleCloseStatusDetails}
          aria-labelledby='status-details-dialog-title'
        >
          <DialogTitle id='status-details-dialog-title'>Status Details for</DialogTitle>
          <DialogContent>{statusDetails}</DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatusDetails}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openSourceDetails}
          onClose={handleCloseSourceDetails}
          aria-labelledby='source-details-dialog-title'
        >
          <DialogTitle id='source-details-dialog-title'>Source Details for</DialogTitle>
          <DialogContent>{sourceDetails}</DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSourceDetails}>Close</Button>
          </DialogActions>
        </Dialog>
        <BatchActionsModal
          open={isBatchActionsModalOpen}
          onClose={() => setIsBatchActionsModalOpen(false)}
          selectedAppointmentIds={selectedAppointmentIds}
          appointments={appointments}
          action={currentBatchAction}
        />
        <Menu anchorEl={batchActionAnchorEl} open={Boolean(batchActionAnchorEl)} onClose={handleBatchActionClose}>
          <MenuItem onClick={() => handleBatchActionSelect('submitClaim')}>Submit Claim</MenuItem>
          <MenuItem onClick={() => handleBatchActionSelect('cancelAppointments')}>Cancel Appointments</MenuItem>
        </Menu>
      </Box>
    </DatePickerWrapper>
  )
}

export default withReducer({
  services: pharmacyServicesSlice
})(PharmacyServicesPage)
