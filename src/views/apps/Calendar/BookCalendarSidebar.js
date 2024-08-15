// ** React Imports
import { useState, useEffect, forwardRef, useCallback, Fragment } from 'react'
import { useUserAuth } from 'src/hooks/useAuth'
import { useOrgAuth } from 'src/hooks/useOrgAuth'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { useForm, Controller } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useSelector } from 'react-redux'
import { handleSelectEvent } from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import withReducer from 'src/@core/HOC/withReducer'
import services from 'src/store/apps/services'
import appointmentListSlice from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { useDispatch } from 'react-redux'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** import forms
import BookDMSform from './services/dms/BookDMSform'
import BookNMSform from './services/nms/BookNMSform'
import BookFluform from './services/flu/BookFluform'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import NewBookingForm from './services/pharmacy-first/newBookingForm'
const capitalize = string => string && string[0].toUpperCase() + string.slice(1)

const defaultState = {
  url: '',
  title: '',
  guests: [],
  allDay: true,
  description: '',
  endDate: new Date(),
  calendar: '',
  startDate: new Date(),
  recurrenceFrequency: '', // Added recurrenceFrequency to state
  recurrenceEndDate: null // Added recurrenceEndDate to state
}

const BookCalendarSidebar = props => {
  // ** Props
  const {
    // store,
    addEvent,
    updateEvent,
    drawerWidth,
    calendarApi,
    deleteEvent,
    // handleSelectEvent,
    addBookingSidebarOpen,
    handleAddBookingSidebarToggle,
    // selectedService
    zIndex = 1300,
    resetToEmptyValues,
    setResetToEmptyValues,
    refetchAppointments
  } = props

  const dispatch = useDispatch()

  // ** States
  const [values, setValues] = useState(defaultState)
  const [isRecurring, setIsRecurring] = useState(false)
  const [editAllInstances, setEditAllInstances] = useState(false)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const selectedService = useSelector(state => state.services.selectedService)
  const store = useSelector(state => state.appointmentListSlice)
  const storeChecker = useSelector(state => state)
  const userId = useUserAuth()?.user?.id

  console.log('storeChecker', storeChecker, { store })
  // console.log('selectedService', selectedService)

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatch(handleSelectEvent(null))
    handleAddBookingSidebarToggle()
  }

  // const onSubmit = (data, isRecurring) => {
  //   const modifiedEvent = {
  //     url: values.url,
  //     display: 'block',
  //     title: data.title,
  //     end: isRecurring ? values.startDate : values.endDate,
  //     allDay: values.allDay,
  //     start: values.startDate,
  //     created_by: userId,
  //     company_id: orgId,
  //     calendarType: values.calendar,
  //     recurrenceFrequency: isRecurring ? values.recurrenceFrequency : null,
  //     recurrenceEndDate: isRecurring ? values.endDate : values.startDate,
  //     extendedProps: {
  //       calendar: values.calendar,
  //       guests: values.guests && values.guests.length ? values.guests : undefined,
  //       description: values.description.length ? values.description : undefined
  //     }
  //   }

  //   if (store.selectedbooking === null || (store.selectedbooking !== null && !store.selectedbooking.title.length)) {
  //     dispatch(addEvent({ modifiedEvent, orgId }, 'ADD EVENT!!!'))
  //   } else {
  //     dispatch(updateEvent({ event: { id: store.selectedbooking.id, ...modifiedEvent }, orgId: orgId }))
  //   }
  //   calendarApi.refetchEvents()
  //   handleSidebarClose()
  // }

  console.log('type of refetchAppointments in booking side bar', refetchAppointments)

  const handleDeleteEvent = () => {
    if (store.selectedbooking) {
      dispatch(deleteEvent({ id: store.selectedbooking.id, orgId }))
    }

    // calendarApi.getEventById(store.selectedEvent.id).remove()
    handleSidebarClose()
  }

  // const handleStartDate = date => {
  //   if (date > values.endDate) {
  //     setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
  //   }
  // }

  // const resetToStoredValues = useCallback(() => {
  //   if (store.selectedbooking !== null) {
  //     const event = store.selectedbooking
  //     console.log(event, 'EVENTTT')
  //     // setValue('title', event.title || '')
  //     // setValues({
  //     //   url: event.url || '',
  //     //   title: event.title || '',
  //     //   allDay: event.allDay,
  //     //   guests: event.extendedProps.guests || [],
  //     //   description: event.extendedProps.description || '',
  //     //   calendar: event.extendedProps.calendarType || '',
  //     //   endDate: event.end !== null ? event.end : event.start,
  //     //   startDate: event.start !== null ? event.start : new Date(),
  //     //   recurrenceFrequency: event.recurrenceFrequency || '', // Added recurrenceFrequency to state
  //     //   recurrenceEndDate: event.end !== null ? event.end : event.start // Added recurrenceEndDate to state
  //     // })
  //   }
  // }, [setValue, store.selectedbooking])

  // console.log(store.selectedEvent?.extendedProps?.recurrencefrequency, 'check is true or false')

  // const resetToEmptyValues = useCallback(() => {
  //   setValue('title', '')
  //   setValues(defaultState)
  // }, [setValue])

  // useEffect(() => {
  //   console.log('store.selectedEvent', store)
  //   if (store?.selectedEvent !== null) {
  //     resetToStoredValues()
  //   } else {
  //     resetToEmptyValues()
  //   }
  // }, [addBookingSidebarOpen, resetToStoredValues, resetToEmptyValues, store?.selectedEvent])

  // const PickersComponent = forwardRef(({ ...props }, ref) => {
  //   return (
  //     <TextField
  //       inputRef={ref}
  //       fullWidth
  //       {...props}
  //       label={props.label || ''}
  //       sx={{ width: '100%' }}
  //       error={props.error}
  //     />
  //   )
  // })

  // const formToUse = () => {
  //   // console.log('selectedService', selectedService)
  //   switch (selectedService) {
  //     case 'DMS S3':
  //       return <BookDMSform onClose={handleSidebarClose} />
  //     case 'NMS':
  //       return <BookNMSform onClose={handleSidebarClose} />
  //     case 'Flu':
  //       return <BookFluform onClose={handleSidebarClose} />
  //     case 'Pharmacy First':
  //       return <NewBookingForm onClose={handleSidebarClose} />
  //     default:
  //       return <NewBookingForm onClose={handleSidebarClose} />
  //   }
  // }

  const RenderSidebarFooter = () => {
    if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent?.title?.length)) {
      return (
        <Fragment>
          <Button size='large' type='submit' variant='contained' sx={{ mr: 4 }}>
            Add
          </Button>
          <Button size='large' variant='outlined' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <Button size='large' type='submit' variant='contained' sx={{ mr: 4 }}>
            Update
          </Button>
          <Button
            size='large'
            variant='outlined'
            color='secondary'
            onClick={
              //resetToStoredValues
              console.log('resetToStoredValues')
            }
          >
            Reset
          </Button>
        </Fragment>
      )
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer
        anchor='right'
        open={addBookingSidebarOpen}
        onClose={handleSidebarClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] }, zIndex: zIndex }}
      >
        <Box
          className='sidebar-header'
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: 'background.default',
            p: theme => theme.spacing(3, 3.255, 3, 5.255)
          }}
        >
          <Typography variant='h6'>
            {store.selectedbooking !== null && store.selectedbooking?.title?.length ? 'Update Booking' : 'New Booking'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {store.selectedbooking !== null && store.selectedbooking?.title?.length ? (
              <IconButton
                size='small'
                onClick={handleDeleteEvent}
                sx={{ color: 'text.primary', mr: store.selectedbooking !== null ? 1 : 0 }}
              >
                <Icon icon='mdi:delete-outline' fontSize={20} />
              </IconButton>
            ) : null}
            <IconButton size='small' onClick={handleSidebarClose} sx={{ color: 'text.primary' }}>
              <Icon icon='mdi:close' fontSize={20} />
            </IconButton>
          </Box>
        </Box>
        <Box className='sidebar-body' sx={{ p: theme => theme.spacing(5, 6) }}>
          <DatePickerWrapper>
            {/* <NewBookingForm
              resetToEmptyValues={resetToEmptyValues}
              onClose={handleSidebarClose}
              selectedService={selectedService}
              setResetToEmptyValues={setResetToEmptyValues}
              refetchAppointments={refetchAppointments}
              addBookingSidebarOpen={addBookingSidebarOpen}
            /> */}
          </DatePickerWrapper>
        </Box>
      </Drawer>
    </LocalizationProvider>
  )
}

// export default BookCalendarSidebar
export default withReducer({ services: services, appointmentListSlice: appointmentListSlice })(BookCalendarSidebar)
