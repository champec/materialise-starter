// ** React Imports
import { useState, useEffect, forwardRef, useMemo } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import Select from '@mui/material/Select'
import { DataGrid, GridExportOptions, GridToolbarExport, GridToolbarContainer } from '@mui/x-data-grid'
import { Dialog, DialogActions, DialogContent, Fade, Button, Menu, MenuItem } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import AppointmentView from './AppointmentListComponents/AppointmentView'
import DeleteCancelModal from 'src/views/apps/services/DeleteCancelModal'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchData, deleteInvoice } from 'src/store/apps/invoice'
import { appointmnetListSlice, fetchAppointments } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { fetchSelectedBooking } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { setSelectedBooking } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import withReducer from 'src/@core/HOC/withReducer'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import OptionsMenu from 'src/@core/components/option-menu'
import ConsultationHeader from 'src/views/apps/invoice/list/ConsultationHeader'
import ServiceConsultationHeader from './AppointmentListComponents/ServiceConsultationHeader'
import BatchActionsModal from './AppointmentListComponents/BatchActionsModal'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import BookCalendarSidebar from 'src/views/apps/Calendar/BookCalendarSidebar'
import bookingsCalendarSlice from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import ServiceFormSidebar from '../../ServiceFormSidebar'
import { setSelectedService } from 'src/store/apps/services'
import { hide } from '@popperjs/core'

const now = new Date()
const currentMonth = now.toLocaleString('default', { month: 'short' })

// ** Styled component for the link in the dataTable
const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

// ** Vars
const invoiceStatusObj = {
  Booked: { color: 'secondary', icon: 'mdi:send' },
  Rescheduled: { color: 'warning', icon: 'mdi:send' },
  live: { color: 'success', icon: 'mdi:check' },
  completed: { color: 'primary', icon: 'mdi:content-save-outline' },
  gp_submitted: { color: 'warning', icon: 'mdi:chart-pie' },
  mys_submitted: { color: 'error', icon: 'mdi:information-outline' },
  unattended: { color: 'info', icon: 'mdi:arrow-down' },
  cancelled: { color: 'error', icon: 'mdi:close-circle' }
}

// ** renders client column
const renderClient = row => {
  if (row?.avatar) {
    return <CustomAvatar src={row?.avatar} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={row?.avatarColor || 'primary'}
        sx={{ mr: 3, fontSize: '1rem', width: 34, height: 34 }}
      >
        {getInitials(row.patient_object.full_name || 'John Doe')}
      </CustomAvatar>
    )
  }
}

const defaultColumns = [
  // {
  //   flex: 0.1,
  //   field: 'id',
  //   minWidth: 80,
  //   headerName: '#',
  //   renderCell: ({ row }) => <LinkStyled href={`/apps/invoice/preview/${row.id}`}>{`#${row.id}`}</LinkStyled>
  // },
  {
    flex: 0.25,
    field: 'name',
    minWidth: 300,
    headerName: 'Client',
    renderCell: ({ row }) => {
      const { patient_object: patient } = row
      const formatedDob = dayjs(patient?.dob).format('D MMM YYYY')
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderClient(row)}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='body2'>
              {patient?.full_name} - (<span style={{ fontSize: 'small', fontStyle: 'italic' }}>{formatedDob}</span>)
            </Typography>
            <Typography noWrap variant='caption'>
              {patient?.address}
            </Typography>
          </Box>
        </Box>
      )
    },
    valueGetter: ({ row }) => row.patient_object.full_name
  },

  {
    flex: 0.15,
    minWidth: 125,
    field: 'issuedDate',
    headerName: 'Booking Date',
    renderCell: ({ row }) => {
      const { calendar_events: event } = row
      //if an event doesnt have a calendar event.created_at then log it to the console
      if (!event?.created_at) {
        console.log('event doesnt have a created at', event)
      }
      const eventDateTime = event?.start
      const formattedTime = eventDateTime ? dayjs(event?.start).format('HH:mm') : 'None' // 24hr format time
      const formattedDate = eventDateTime ? dayjs(event?.created_at).format('D MMM YYYY') : 'None' // Date in "12th Jan 2023" format

      return (
        <Typography variant='body2'>
          {formattedTime}
          <br />
          {formattedDate}
        </Typography>
      )
    },
    valueGetter: ({ row }) => row.calendar_events.start
  },
]
/* eslint-disable */
const CustomInput = forwardRef((props, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : ''
  const endDate = props.end !== null ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`
  props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null
  const updatedProps = { ...props }
  delete updatedProps.setDates
  return <TextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />
})

/* eslint-enable */
const ServiceAppointmentList = ({ locallySelectedService, customColumns, setLocallySelectedService }) => {
  // ** State
  const dispatch = useDispatch()
  const [dates, setDates] = useState([])
  const [value, setValue] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [endDateRange, setEndDateRange] = useState(null)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [startDateRange, setStartDateRange] = useState(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [anchorEl, setAnchorEl] = useState(null)
  const anchorOpen = Boolean(anchorEl)
  const appointmentsSlice = useSelector(state => state.appointmentListSlice)
  const slice = useSelector(state => state.bookingsCalendar)
  const [appointmentView, setAppointmentView] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [bookingSideBarOpen, setBookingSideBarOpen] = useState(false)
  const [serviceFormSideBarOpen, setServiceFormSideBarOpen] = useState(false)
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState('')
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [refetching, setRefetching] = useState(false)
  const [resetToEmptyValues, setResetToEmptyValues] = useState(false)
  const totalCount = appointmentsSlice?.totalCount
  const appointments = appointmentsSlice?.appointments
  const loading = appointmentsSlice?.loading
  dayjs.extend(advancedFormat)

  const selectedRows = useMemo(() => {
    return appointments.filter(row => selectedRowIds.includes(row.id))
  }, [appointments, selectedRowIds])

  const handleDeleteAppointment = row => {
    // the row as the selectedRow and then open the modal
    setSelectedRowIds([row.id])
    setOpenDeleteModal(true)
  }

  const handleDeleteAppointments = () => {
    // dispatch the delete action
    setOpenDeleteModal(true)
  }


  useEffect(() => {
    const serviceId = locallySelectedService?.id
    const serviceTable = locallySelectedService?.table
    // make the defualt start and end range 2 weeks before and 2 weeks after the current date
    const startDate = new Date()
    const endDate = new Date()
    startDate.setDate(startDate.getDate() - 14)
    endDate.setDate(endDate.getDate() + 14)
    const formattedStartDate = startDate.toISOString()
    const formattedEndDate = endDate.toISOString()

    setStartDateRange(startDate)
    setEndDateRange(endDate)
    dispatch(
      fetchAppointments({
        dateRange: {
          start: formattedStartDate,
          end: formattedEndDate
        },
        service_id: serviceId,
        service_table: serviceTable,
        page: 0,
        pageSize: 10
      })
    )
  }, [])

  useEffect(() => {
    if (appointments !== null) {
      setFilteredAppointments(appointments)
    }
  }, [appointments])

  useEffect(() => {
    if (startDateRange !== null && endDateRange !== null) {
      // Convert to ISO 8601 format
      const formattedStartDate = new Date(startDateRange).toISOString()
      const formattedEndDate = new Date(endDateRange).toISOString()
      const serviceId = locallySelectedService?.id
      const serviceTable = locallySelectedService?.table

      dispatch(
        fetchAppointments({
          dateRange: { start: formattedStartDate, end: formattedEndDate },
          service_id: serviceId,
          service_table: serviceTable,
          page: paginationModel.page,
          pageSize: paginationModel.pageSize
        })
      )
    }
  }, [startDateRange, endDateRange, paginationModel.page, paginationModel.pageSize])

  const reFetchAppointments = async () => {
    setFilteredAppointments([])
    console.log('REFETCHING APPOINTMENTS')
    const serviceId = locallySelectedService?.id
    const serviceTable = locallySelectedService?.table
    const formattedStartDate = new Date(startDateRange).toISOString()
    const formattedEndDate = new Date(endDateRange).toISOString()

    const response = await dispatch(
      fetchAppointments({
        dateRange: { start: formattedStartDate, end: formattedEndDate },
        service_id: serviceId,
        service_table: serviceTable,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize
      })
    )
    if (response.error) {
      console.log('ERROR', response.error)
    }

    // console.log('RESPONSE', response.payload.data)

    // setFilteredAppointments(response.payload.data)
  }

  // console.log('APPOINTMENTS', appointments)
  const toggleBookingSideBar = () => {
    console.log('PRESSED')
    setBookingSideBarOpen(!bookingSideBarOpen)
  }

  const toggleServiceFormSideBar = () => {
    console.log('PRESSED')
    setServiceFormSideBarOpen(!serviceFormSideBarOpen)
  }

  const toggleNewBookingSideBar = () => {
    console.log('PRESSED')
    setResetToEmptyValues(true)
    setBookingSideBarOpen(!bookingSideBarOpen)
  }

  // ** Hooks

  const store = useSelector(state => state.invoice)

  const applyFilter = () => {
    if (statusValue == 'all') {
      setFilteredAppointments(appointments)
    } else {
      setFilteredAppointments(
        appointments.filter(appointment => appointment.consultation_status?.title === statusValue)
      )
    }
  }

  useEffect(() => {
    applyFilter()
  }, [dispatch, statusValue, value, dates])

  const handleFilter = val => {
    setValue(val)
  }

  useEffect(() => {
    // Perform filtering whenever the input value changes
    if (!value.trim()) {
      setFilteredAppointments(appointments)
    } else {
      searchFilter(value)
    }
  }, [value])

  const handleBatchAction = action => {
    console.log('ACTION', action)
    // setCurrentAction(action)
    // setBatchModalOpen(true)
    // use MUI alert to confirm action and then perform action for each row if confirmed or cancel

    // if (action === 'delete') {
    //   selectedRows.forEach(row => {
    //     dispatch(deleteInvoice(row))
    //   })
    // }
    switch (action) {
      case 'Cancel':
        handleDeleteAppointments()
        break
      case 'Message':
        break
      case 'MYS':
        break
      case 'GP':
        break
      default:
        break
    }
  }

  const searchFilter = inputValue => {
    const lowercasedInput = inputValue.toLowerCase().split(' ').filter(Boolean)

    setFilteredAppointments(
      appointments.filter(appointment => {
        const firstName = appointment.patient_object.first_name
        const lastName = appointment.patient_object.last_name
        const fullName = appointment.patient_object.full_nam
        const middleName = appointment.patient_object.middle_name
        return lowercasedInput.every(
          input =>
            (firstName && firstName.toLowerCase().includes(input)) ||
            (lastName && lastName.toLowerCase().includes(input)) ||
            (fullName && fullName.toLowerCase().includes(input)) ||
            (middleName && middleName.toLowerCase().includes(input))
        )
      })
    )
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const handleViewClick = row => {
    console.log('handleViewClick', row)
    dispatch(setSelectedBooking(row))
    setAppointment(row)
    setAppointmentView(true)
    // dispatch(fetchSelectedBooking(row.id))
  }

  const handleViewClose = () => {
    dispatch(setSelectedBooking(null))
    // dispatch(setSelectedService(null))
    setAppointmentView(false)
  }

  const handleOnChangeRange = dates => {
    const [start, end] = dates
    if (start !== null && end !== null) {
      setDates(dates)
    }
    setStartDateRange(start)
    setEndDateRange(end)
  }

  const hiddenColumns = [
    {
      flex: 0.1,
      minWidth: 130,
      sortable: true,
      field: 'created_at',
      headerName: 'Created At',
      renderCell: ({ row }) => {
        const formattedDate = dayjs(row.created_at).format('D MMM YYYY')
        return <Typography variant='body2'>{formattedDate}</Typography>
      },
      valueGetter: ({ row }) => row.created_at,
      hide: true
    }
  ]

  const columns = [
    ...defaultColumns,
    ...customColumns,
    ...hiddenColumns,
    {
      flex: 0.1,
      minWidth: 130,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Delete Invoice'>
            <IconButton size='small' sx={{ mr: 0.5 }} onClick={() => handleDeleteAppointment(row)}>
              <Icon icon='mdi:delete-outline' />
            </IconButton>
          </Tooltip>
          <Tooltip title='View'>
            <IconButton size='small' sx={{ mr: 0.5 }} onClick={() => handleViewClick(row)}>
              <Icon icon='mdi:eye-outline' />
            </IconButton>
          </Tooltip>
          <OptionsMenu
            iconProps={{ fontSize: 20 }}
            iconButtonProps={{ size: 'small' }}
            menuProps={{ sx: { '& .MuiMenuItem-root svg': { mr: 2 } } }}
            options={[
              {
                text: 'Submit To GP',
                icon: <Icon icon='mdi:download' fontSize={20} />
              },
              {
                text: 'Edit',
                href: `/apps/invoice/edit/${row.id}`,
                icon: <Icon icon='mdi:pencil-outline' fontSize={20} />
              },
              {
                text: 'Duplicate',
                icon: <Icon icon='mdi:content-copy' fontSize={20} />
              }
            ]}
          />
        </Box>
      )
    }
  ]

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const csvOption = {
    // fields: [
    //   { label: 'ID', value: 'id' },
    //   { label: 'Client', value: 'patient_object.full_name' },
    //   { label: 'Booking Date', value: 'calendar_events.start' },
    //   { label: 'Status', value: 'consultation_status.title' }
    // ],
    fileName:"Pharmex Appointments",
    allColumns: true,
  }
const CustomToolbar = () => {
  return (
    <GridToolbarContainer>

      <GridToolbarExport options={csvOption} />
      {/* Include other custom buttons or menu items here */}
    </GridToolbarContainer>
  );
};

  return (
    <DatePickerWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Filters'
            action={
              <>
                {/* <Button
                  variant='contained'
                  aria-haspopup='true'
                  onClick={handleClick}
                  aria-expanded={anchorOpen ? 'true' : undefined}
                  endIcon={<Icon icon='mdi:chevron-down' />}
                  aria-controls={anchorOpen ? 'user-view-overview-export' : undefined}
                >
                  Export
                </Button>
                <Menu open={anchorOpen} anchorEl={anchorEl} onClose={handleClose} id='user-view-overview-export'>
                  <MenuItem onClick={handleClose}>PDF</MenuItem>
                  <MenuItem onClick={handleClose}>XLSX</MenuItem>
                  <MenuItem onClick={handleClose}>CSV</MenuItem>
                </Menu> */}
              </>
            }
            />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='invoice-status-select'>Status</InputLabel>

                    <Select
                      fullWidth
                      value={statusValue}
                      sx={{ mr: 4, mb: 2 }}
                      label='Invoice Status'
                      onChange={handleStatusValue}
                      labelId='invoice-status-select'
                    >
                      <MenuItem value='all'>All</MenuItem>
                      <MenuItem value='Booked'>Booked</MenuItem>
                      <MenuItem value='Rescheduled'>Reschedules</MenuItem>
                      {/* <MenuItem value='draft'>Draft</MenuItem>
                      <MenuItem value='paid'>Paid</MenuItem>
                      <MenuItem value='partial payment'>Partial Payment</MenuItem>
                      <MenuItem value='past due'>Past Due</MenuItem>
                      <MenuItem value='sent'>Sent</MenuItem> */}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    isClearable
                    selectsRange
                    monthsShown={2}
                    endDate={endDateRange}
                    selected={startDateRange}
                    startDate={startDateRange}
                    shouldCloseOnSelect={false}
                    id='date-range-picker-months'
                    onChange={handleOnChangeRange}
                    customInput={
                      <CustomInput
                        dates={dates}
                        setDates={setDates}
                        label='Date Range'
                        end={endDateRange}
                        start={startDateRange}
                      />
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <ServiceConsultationHeader
              onBook={toggleNewBookingSideBar}
              value={value}
              selectedRows={selectedRows}
              handleFilter={handleFilter}
              handleBatchAction={handleBatchAction}
              dele
              reFetching={loading}
              reFetchAppointments={reFetchAppointments}
            />
            <DataGrid
              autoHeight
              pagination
              rows={filteredAppointments}
              rowCount={totalCount}
              components={{Toolbar: CustomToolbar}}
              columns={columns}
              checkboxSelection
              disableSelectionOnClick
              paginationMode='server'
              rowsPerPageOptions={[5, 10, 15, 20,30,50]}
              pageSize={paginationModel.pageSize}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onSelectionModelChange={rows => setSelectedRowIds(rows)}
              onPageSizeChange={(newPageSize) =>
                setPaginationModel((prev) => ({ ...prev, pageSize: newPageSize }))
              }
              onPageChange={(newPage) =>
                setPaginationModel((prev) => ({ ...prev, page: newPage }))
              }
              onRowDoubleClick={appointment => window.open(`/pharmacy-first/appointment-list/${appointment.id}`)}
            />
          </Card>
        </Grid>
        <Dialog
          fullWidth
          maxWidth='md'
          scroll='body'
          TransitionComponent={Transition}
          open={appointmentView}
          onClose={() => handleViewClose()}
          sx={{ zIndex: 1200 }}
        >
          <DialogContent
            sx={{
              position: 'relative',
              pr: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pl: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(11)} !important`],
              py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <IconButton
              size='small'
              onClick={() => handleViewClose()}
              sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
            >
              <Icon icon='mdi:close' />
            </IconButton>
            <AppointmentView
              toggleBookingSideBar={toggleBookingSideBar}
              toggleServiceFormSideBar={toggleServiceFormSideBar}
              appointment={appointment}
              serviceTable={locallySelectedService?.table}
              serviceInfo={locallySelectedService}
            />
          </DialogContent>
        </Dialog>
        <BatchActionsModal
          open={batchModalOpen}
          onClose={() => setBatchModalOpen(false)}
          selectedRows={selectedRows}
          currentAction={currentAction}
          setCurrentAction={setCurrentAction}
        />
      </Grid>
      <BookCalendarSidebar
        store={slice}
        drawerWidth={400}
        dispatch={dispatch}
        // addCalendarSidebarOpen={() => {}}
        // handleAddCalendarSidebarToggle={() => {}}
        // bookCalendarSidebarOpen={bookingSideBarOpen}
        handleAddBookingSidebarToggle={toggleBookingSideBar}
        addBookingSidebarOpen={bookingSideBarOpen}
        handleSelectEvent={() => {}}
        zIndex={1300}
        resetToEmptyValues={resetToEmptyValues}
        setResetToEmptyValues={setResetToEmptyValues}
        refetchAppointments={reFetchAppointments}
      />
      <ServiceFormSidebar
        drawerWidth={400}
        dispatch={dispatch}
        service={locallySelectedService}
        serviceFormSidebarOpen={serviceFormSideBarOpen}
        handleServiceFormSidebarToggle={toggleServiceFormSideBar}
        zIndex={1300}
        resetToEmptyValues={resetToEmptyValues}
        setResetToEmptyValues={setResetToEmptyValues}
        serviceTable={locallySelectedService?.table}
        setLocallySelectedService={setLocallySelectedService}
      />
      <DeleteCancelModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        consultations={selectedRows}
        refetchAppointments={reFetchAppointments}
      />
    </DatePickerWrapper>
  )
}

export default withReducer({
  appointmentListSlice: appointmnetListSlice.reducer,
  bookingsCalendar: bookingsCalendarSlice
})(ServiceAppointmentList)
