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
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import Select from '@mui/material/Select'
import { DataGrid, GridToolbarContainer, GridExportOptions, GridToolbarExport } from '@mui/x-data-grid'
import { Dialog, DialogActions, DialogContent, Fade } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import AppointmentView from './AppointmentView'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchData, deleteInvoice } from 'src/store/apps/invoice'
import { appointmnetListSlice, fetchAppointments } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import withReducer from 'src/@core/HOC/withReducer'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import OptionsMenu from 'src/@core/components/option-menu'
import ConsultationHeader from 'src/views/apps/invoice/list/ConsultationHeader'
import BatchActionsModal from './BatchActionsModal'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import BookCalendarSidebar from 'src/views/apps/Calendar/BookCalendarSidebar'
import bookingsCalendarSlice from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import DeleteCancelModal from 'src/views/apps/services/DeleteCancelModal'

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
  1: { name: 'scheduled', color: 'secondary', icon: 'mdi:send' },
  2: { name: 'rescheduled', color: 'warning', icon: 'mdi:send' },
  5: { name: 'live', color: 'success', icon: 'mdi:check' },
  6: { name: 'completed', color: 'primary', icon: 'mdi:content-save-outline' },
  7: { name: 'gp_submitted', color: 'warning', icon: 'mdi:chart-pie' },
  8: { name: 'mys_submitted', color: 'error', icon: 'mdi:information-outline' },
  9: { name: 'Expired', color: 'error', icon: 'mdi:close-circle' },
  10: { name: 'cancelled', color: 'error', icon: 'mdi:close-circle' },
  11: { name: 'unattended', color: 'info', icon: 'mdi:arrow-down' }
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
    field: 'patient_object.full_name',
    minWidth: 300,
    headerName: 'Client',
    valueGetter: params => {
      const { patient_object: patient } = params.row
      return patient?.full_name
    },
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
    }
  },
  {
    flex: 0.1,
    minWidth: 80,
    field: 'invoiceStatus',
    renderHeader: () => (
      <Box sx={{ display: 'flex', color: 'action.active' }}>
        <Icon icon='mdi:trending-up' fontSize={20} />
        <Typography variant='body2' sx={{ ml: 1 }}>
          Service Type
        </Typography>
      </Box>
    ),
    renderCell: ({ row }) => {
      const { consultation_status: status, calendar_events } = row
      const title = status?.title
      const serviceTitle = calendar_events?.title

      const dueDate = 'destructured from row'
      const balance = 'destructured from row'
      const color = invoiceStatusObj[title] ? invoiceStatusObj[title]?.color : 'primary'

      return (
        <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Tooltip
            title={
              <Box>
                <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
                  {title}
                </Typography>
                <br />
                <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
                  Balance:
                </Typography>{' '}
                {balance}
                <br />
                <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
                  Due Date:
                </Typography>{' '}
                {dueDate}
              </Box>
            }
          >
            <Typography variant='body2' sx={{ color: 'common.white', fontWeight: 600 }}>
              {serviceTitle}
            </Typography>
            {/* <CustomAvatar skin='light' color={color} sx={{ width: 34, height: 34 }}>
              <Icon icon={invoiceStatusObj[title]?.icon || 'ri:question-line'} fontSize='1.25rem' />
            </CustomAvatar> */}
          </Tooltip>
          {/* <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
            {title}
          </Typography> */}
        </Box>
      )
    },
    valueGetter: params => {
      const { consultation_status: status, calendar_events } = params.row
      const title = status?.title
      const serviceTitle = calendar_events?.title
      return serviceTitle
    }
  },
  // {
  //   flex: 0.1,
  //   minWidth: 90,
  //   field: 'total',
  //   headerName: 'Total',
  //   renderCell: ({ row }) => <Typography variant='body2'>{`$${row.total || 0}`}</Typography>
  // },
  {
    flex: 0.15,
    minWidth: 125,
    field: 'calendar_events.start',
    headerName: 'Booking Date',
    valueGetter: params => {
      const { calendar_events: event } = params.row
      const eventDateTime = event?.start
      return eventDateTime
    },
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
    }
  },
  {
    flex: 0.1,
    minWidth: 90,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }) => {
      const status = invoiceStatusObj[row.status]
      if (status) {
        return (
          <CustomChip
            size='small'
            skin='light'
            color={status.color}
            label={status.name}
            icon={<Icon icon={status.icon} />} // Replace 'YourIconComponent' with your actual icon component
          />
        )
      } else {
        // Handle unknown status
        return <span>Unknown Status</span>
      }
    },
    valueGetter: params => {
      const status = invoiceStatusObj[params.row.status]
      return status?.name
    }
  }
]
/* eslint-disable */
const CustomInput = forwardRef((props, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : ''
  const endDate = props.end !== null ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`
  props.start === null && props.dates?.length && props.setDates ? props.setDates([]) : null
  const updatedProps = { ...props }
  delete updatedProps.setDates
  return <TextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />
})

/* eslint-enable */
const AppointmentList = () => {
  // ** State
  const dispatch = useDispatch()
  const [dates, setDates] = useState([])
  const [value, setValue] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [endDateRange, setEndDateRange] = useState(null)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [startDateRange, setStartDateRange] = useState(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const appointmentsSlice = useSelector(state => state.appointmentListSlice)
  const slice = useSelector(state => state.bookingsCalendar)
  const [appointmentView, setAppointmentView] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [bookingSideBarOpen, setBookingSideBarOpen] = useState(false)
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState('')
  const [refetching, setRefetching] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [sortModel, setSortModel] = useState([
    {
      field: 'calendar_events.start',
      sort: 'desc'
    }
  ])
  const appointments = appointmentsSlice?.appointments
  const totalCount = appointmentsSlice?.totalCount
  const loading = appointmentsSlice?.loading
  dayjs.extend(advancedFormat)

  const selectedRows = useMemo(() => {
    return appointments.filter(row => selectedRowIds.includes(row.id))
  }, [appointments, selectedRowIds])

  const fetchAppointmentsWithDateRange = async => {
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
          end: formattedEndDate,
          page: paginationModel.page,
          pageSize: paginationModel.pageSize
        }
      })
    )
  }

  useEffect(() => {
    fetchAppointmentsWithDateRange()
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

      dispatch(
        fetchAppointments({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          page: paginationModel.page,
          pageSize: paginationModel.pageSize
        })
      )
    }
  }, [startDateRange, endDateRange])

  const reFetchAppointments = async () => {
    fetchAppointmentsWithDateRange()
    // setFilteredAppointments([])
    // const response = await dispatch(fetchAppointments())
    // if (response.error) {
    //   console.log('ERROR', response.error)
    // }

    // setFilteredAppointments(response.payload)
  }

  // console.log('APPOINTMENTS', appointments)
  const toggleBookingSideBar = () => {
    console.log('PRESSED')
    setBookingSideBarOpen(!bookingSideBarOpen)
  }

  // ** Hooks

  const store = useSelector(state => state.invoice)

  const applyFilter = () => {
    if (statusValue === 'all') {
      setFilteredAppointments(appointments)
    } else {
      // Find the status value corresponding to the selected status name
      const selectedStatusValue = Object.keys(invoiceStatusObj).find(key => invoiceStatusObj[key].name === statusValue)

      setFilteredAppointments(
        appointments.filter(appointment => {
          // Assuming the appointment's status is stored in a field like `status`
          // and it's a number corresponding to the value in `invoiceStatusObj`
          return appointment.status === parseInt(selectedStatusValue, 10)
        })
      )
    }
  }

  // Function to handle sort model change
  const handleSortModelChange = model => {
    setSortModel(model)
  }

  // Sort the data based on the sort model
  const sortedAppointments = useMemo(() => {
    if (sortModel.length === 0) return filteredAppointments

    const sorter = (a, b) => {
      const field = sortModel[0].field
      const sort = sortModel[0].sort

      if (a[field] < b[field]) {
        return sort === 'asc' ? -1 : 1
      }
      if (a[field] > b[field]) {
        return sort === 'asc' ? 1 : -1
      }
      return 0
    }

    return [...filteredAppointments].sort(sorter)
  }, [filteredAppointments, sortModel])

  useEffect(() => {
    applyFilter()
  }, [dispatch, statusValue, value, dates])

  const handleFilter = val => {
    setValue(val)
  }

  const handleDeleteAppointment = row => {
    // the row as the selectedRow and then open the modal
    setSelectedRowIds([row.id])
    setOpenDeleteModal(true)
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
    setCurrentAction(action)
    setBatchModalOpen(true)
    // use MUI alert to confirm action and then perform action for each row if confirmed or cancel

    // if (action === 'delete') {
    //   selectedRows.forEach(row => {
    //     dispatch(deleteInvoice(row))
    //   })
    // }
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
    setAppointment(row)
    setAppointmentView(true)
  }

  const csvOption = {
    
  }
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>

        <GridToolbarExport options={csvOption} />
        {/* Include other custom buttons or menu items here */}
      </GridToolbarContainer>
    );
  };

  const handleOnChangeRange = dates => {
    const [start, end] = dates
    if (start !== null && end !== null) {
      setDates(dates)
    }
    setStartDateRange(start)
    setEndDateRange(end)
  }

  const columns = [
    ...defaultColumns,
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
                icon: <Icon icon='mdi:download' fontSize={20} />,
                disabled: true
              },
              {
                text: 'Edit',
                href: `/apps/invoice/edit/${row.id}`,
                icon: <Icon icon='mdi:pencil-outline' fontSize={20} />,
                disabled: false
              },
              {
                text: 'Duplicate',
                icon: <Icon icon='mdi:content-copy' fontSize={20} />,
                disabled: true
              }
            ]}
          />
        </Box>
      )
    }
  ]

  return (
    <DatePickerWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='All Appointments' />
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
                      {Object.entries(invoiceStatusObj).map(([key, value]) => (
                        <MenuItem key={key} value={value.name}>
                          {value.name.charAt(0).toUpperCase() + value.name.slice(1).replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
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
            <ConsultationHeader
              onBook={toggleBookingSideBar}
              value={value}
              selectedRows={selectedRows}
              handleFilter={handleFilter}
              handleBatchAction={handleBatchAction}
              reFetching={loading}
              reFetchAppointments={reFetchAppointments}
            />
            <DataGrid
              autoHeight
              pagination
              rows={filteredAppointments}
              columns={columns}
              checkboxSelection
              components={{Toolbar: CustomToolbar}}
              disableSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              rowCount={totalCount}
              onSortModelChange={handleSortModelChange}
              rowsPerPageOptions={[5, 10, 15, 20,30,50]}
              pageSize={paginationModel.pageSize}
              sortModel={sortModel}
              onPaginationModelChange={setPaginationModel}
              onPageSizeChange={(newPageSize) =>
                setPaginationModel((prev) => ({ ...prev, pageSize: newPageSize }))
              }
              onPageChange={(newPage) =>
                setPaginationModel((prev) => ({ ...prev, page: newPage }))
              }
              onSelectionModelChange={rows => setSelectedRowIds(rows)}
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
          onClose={() => setAppointmentView(false)}
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
              onClick={() => setAppointmentView(false)}
              sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
            >
              <Icon icon='mdi:close' />
            </IconButton>
            <AppointmentView appointment={appointment} />
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
})(AppointmentList)
