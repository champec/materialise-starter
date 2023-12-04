// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

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
import { DataGrid } from '@mui/x-data-grid'
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
import TableHeader from 'src/views/apps/invoice/list/TableHeader'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

const now = new Date()
const currentMonth = now.toLocaleString('default', { month: 'short' })

const data = [
  {
    id: 4987,
    issuedDate: `13 ${currentMonth} ${now.getFullYear()}`,
    address: '7777 Mendez Plains',
    company: 'Hall-Robbins PLC',
    companyEmail: 'don85@johnson.com',
    country: 'USA',
    contact: '(616) 865-4180',
    name: 'Jordan Stevenson',
    service: 'Software Development',
    total: 3428,
    avatar: '',
    avatarColor: 'primary',
    invoiceStatus: 'Paid',
    balance: 'PFS',
    dueDate: `23 ${currentMonth} ${now.getFullYear()}`
  },
  {
    id: 4988,
    issuedDate: `17 ${currentMonth} ${now.getFullYear()}`,
    address: '04033 Wesley Wall Apt. 961',
    company: 'Mccann LLC and Sons',
    companyEmail: 'brenda49@taylor.info',
    country: 'Haiti',
    contact: '(226) 204-8287',
    name: 'Stephanie Burns',
    service: 'UI/UX Design & Development',
    total: 5219,
    avatar: '/images/avatars/1.png',
    invoiceStatus: 'Downloaded',
    balance: 'Flu',
    dueDate: `15 ${currentMonth} ${now.getFullYear()}`
  }
]

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
  pending: { color: 'secondary', icon: 'mdi:send' },
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
          Status
        </Typography>
      </Box>
    ),
    renderCell: ({ row }) => {
      const { pp_booking_status } = row
      const status = pp_booking_status?.status
      const dueDate = 'destructured from row'
      const balance = 'destructured from row'
      const color = invoiceStatusObj[status] ? invoiceStatusObj[status].color : 'primary'

      return (
        <Tooltip
          title={
            <div>
              <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
                {status}
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
            </div>
          }
        >
          <CustomAvatar skin='light' color={color} sx={{ width: 34, height: 34 }}>
            <Icon icon={invoiceStatusObj[status]?.icon || 'ri:question-line'} fontSize='1.25rem' />
          </CustomAvatar>
        </Tooltip>
      )
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
    field: 'issuedDate',
    headerName: 'Booking Date',
    renderCell: ({ row }) => {
      const formattedTime = dayjs(row.start_date).format('HH:mm') // 24hr format time
      const formattedDate = dayjs(row.start_date).format('D MMM YYYY') // Date in "12th Jan 2023" format

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
    field: 'balance',
    headerName: 'Type',
    renderCell: ({ row }) => {
      return row.balance !== 'PFS' ? (
        <CustomChip size='small' skin='light' color='warning' label={row.type} />
      ) : (
        <CustomChip size='small' skin='light' color='success' label={row.type} />
      )
    }
  }
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
const AppointmentList = () => {
  // ** State
  const dispatch = useDispatch()
  const [dates, setDates] = useState([])
  const [value, setValue] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [endDateRange, setEndDateRange] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [startDateRange, setStartDateRange] = useState(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const appointmentsSlice = useSelector(state => state.appointmentList)
  const [appointmentView, setAppointmentView] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const appointments = appointmentsSlice?.appointments
  const loading = appointmentsSlice?.loading
  dayjs.extend(advancedFormat)

  useEffect(() => {
    dispatch(fetchAppointments())
  }, [])

  console.log('APPOINTMENTS', appointments)

  // ** Hooks

  const store = useSelector(state => state.invoice)
  useEffect(() => {
    dispatch(
      fetchData({
        dates,
        q: value,
        status: statusValue
      })
    )
  }, [dispatch, statusValue, value, dates])

  const handleFilter = val => {
    setValue(val)
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const handleViewClick = row => {
    setAppointment(row)
    setAppointmentView(true)
  }

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
            <IconButton size='small' sx={{ mr: 0.5 }} onClick={() => dispatch(deleteInvoice(row.id))}>
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

  return (
    <DatePickerWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Filters' />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='invoice-status-select'>Invoice Status</InputLabel>

                    <Select
                      fullWidth
                      value={statusValue}
                      sx={{ mr: 4, mb: 2 }}
                      label='Invoice Status'
                      onChange={handleStatusValue}
                      labelId='invoice-status-select'
                    >
                      <MenuItem value=''>none</MenuItem>
                      <MenuItem value='downloaded'>Downloaded</MenuItem>
                      <MenuItem value='draft'>Draft</MenuItem>
                      <MenuItem value='paid'>Paid</MenuItem>
                      <MenuItem value='partial payment'>Partial Payment</MenuItem>
                      <MenuItem value='past due'>Past Due</MenuItem>
                      <MenuItem value='sent'>Sent</MenuItem>
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
                        label='Invoice Date'
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
            <TableHeader value={value} selectedRows={selectedRows} handleFilter={handleFilter} />
            <DataGrid
              autoHeight
              pagination
              rows={appointments}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onRowSelectionModelChange={rows => setSelectedRows(rows)}
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
      </Grid>
    </DatePickerWrapper>
  )
}

export default withReducer('appointmentList', appointmnetListSlice.reducer)(AppointmentList)
