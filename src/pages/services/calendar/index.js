// ** React Imports
import { useEffect, useState } from 'react'
import { useOrgAuth } from 'src/hooks/useOrgAuth'

// ** MUI Imports
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCalendarTypes,
  handleSelectCalendar,
  handleCalendarsUpdate,
  addEvent,
  fetchEvents,
  deleteEvent,
  updateEvent,
  handleSelectEvent,
  handleAllCalendars,
  updateViewDates
} from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import { fetchSelectedBooking } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import withReducer from 'src/@core/HOC/withReducer'
import bookingsCalendarSlice from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import calendar from 'src/store/apps/calendar'
import appointmentListSlice from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import services from 'src/store/apps/services'

// ** FullCalendar & App Components Imports
import Calendar from 'src/views/apps/Calendar/Calendar'
import SidebarLeft from 'src/views/apps/Calendar/SidebarLeft'
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'
import AddEventSidebar from 'src/views/apps/Calendar/AddEventSidebar'
import AddCalendarSidebar from 'src/views/apps/Calendar/AddCalendarSidebar'
import BookCalendarSidebar from 'src/views/apps/Calendar/BookCalendarSidebar'
import ServiceSelectorModal from 'src/views/apps/services/ServiceSelectorModal'

// ** Actions
// import {

//   // handleCalendarsUpdate,

//   // handleSelectCalendar,

// } from 'src/store/apps/calendar'

// ** CalendarColors
const calendarsColor = {
  Personal: 'error',
  Business: 'primary',
  Family: 'warning',
  Holiday: 'success',
  ETC: 'info'
}

const AppCalendar = ({ addCalendarType, updateCalendarType, deleteCalendarType }) => {
  // ** States
  const [calendarApi, setCalendarApi] = useState(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false)
  const [addBookingSidebarOpen, setAddBookingSidebarOpen] = useState(false)
  const [addCalendarSidebarOpen, setAddCalendarSidebarOpen] = useState(false)
  const [bookCalendarSidebarOpen, setBookCalendarSidebarOpen] = useState(false)
  const [openServiceSelectorModal, setOpenServiceSelectorModal] = useState(false)

  // ** Hooks
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const store = useSelector(state => state.bookingsCalendar)
  const orgId = useSelector(state => state.organisation.organisation.id)

  console.log('store', store)

  // ** Vars
  const leftSidebarWidth = 260
  const addEventSidebarWidth = 400
  const { skin, direction } = settings
  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))
  useEffect(() => {
    if (orgId) {
      console.log('USE EFFECT EVENT FETCH ON LOAD', orgId)
      dispatch(fetchEvents(orgId))
    }
    // removed the following dependencies  store.selectedCalendars, store.viewStart, store.viewEnd,
    // felt like all calendar events are fetched for the view anyway not point refetch when calendar changed
    //also view state should trigger fetch event not just autotomatically by useEffect
  }, [dispatch, orgId])

  useEffect(() => {
    dispatch(fetchCalendarTypes())
  }, [dispatch])
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)
  const handleAddBookingSidebarToggle = () => setAddBookingSidebarOpen(!addBookingSidebarOpen)
  const handleAddCalendarSidebarToggle = () => setAddCalendarSidebarOpen(!addCalendarSidebarOpen)
  const selectedService = useSelector(state => state.services.selectedService)

  console.log('selectedService', selectedService)

  const handleBookCalendarSidebar = event => {
    setOpenServiceSelectorModal(true)
    // handleAddBookingSidebarToggle()
    // dispatch(handleSelectEvent(null))
  }

  return (
    <CalendarWrapper
      className='app-calendar'
      sx={{
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: theme => `1px solid ${theme.palette.divider}` })
      }}
    >
      <SidebarLeft
        store={store}
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarsColor={calendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        handleAllCalendars={handleAllCalendars}
        handleSelectCalendar={handleSelectCalendar}
        handleCalendarsUpdate={handleCalendarsUpdate}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        handleAddCalendarSidebarToggle={handleAddCalendarSidebarToggle}
        handleAddBookingSidebarToggle={handleAddBookingSidebarToggle}
        appointment
        handleBookCalendarSidebar={handleBookCalendarSidebar}
        openServiceSelectorModal={openServiceSelectorModal}
      />
      <Box
        sx={{
          px: 5,
          pt: 3.75,
          flexGrow: 1,
          borderRadius: 1,
          boxShadow: 'none',
          backgroundColor: 'background.paper',
          ...(mdAbove ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {})
        }}
      >
        <Calendar
          orgId={orgId}
          store={store}
          dispatch={dispatch}
          direction={direction}
          updateEvent={updateEvent}
          calendarApi={calendarApi}
          calendarsColor={calendarsColor}
          setCalendarApi={setCalendarApi}
          updateViewDates={updateViewDates}
          handleSelectEvent={handleSelectEvent}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleBookCalendarSidebar}
          handleAddCalendarSidebarToggle={handleAddCalendarSidebarToggle}
          handleAddBookingSidebarToggle={handleAddBookingSidebarToggle}
          fetchSelectedBooking={fetchSelectedBooking}
          appointment
        />
      </Box>
      <AddEventSidebar
        store={store}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
        calendarApi={calendarApi}
        drawerWidth={addEventSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        // addEventSidebarOpen={addEventSidebarOpen}
        addEventSidebarOpen={false}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        appointment
      />
      <AddCalendarSidebar
        store={store}
        dispatch={dispatch}
        calendarApi={calendarApi}
        updateCalendarType={updateCalendarType}
        addCalendarType={addCalendarType}
        deleteCalendarType={deleteCalendarType}
        handleSelectCalendar={handleSelectCalendar}
        drawerWidth={addEventSidebarWidth}
        addCalendarSidebarOpen={addCalendarSidebarOpen}
        handleAddCalendarSidebarToggle={handleAddCalendarSidebarToggle}
      />
      <BookCalendarSidebar
        store={store}
        dispatch={dispatch}
        calendarApi={calendarApi}
        updateCalendarType={updateCalendarType}
        addCalendarType={addCalendarType}
        deleteCalendarType={deleteCalendarType}
        handleSelectCalendar={handleSelectCalendar}
        drawerWidth={addEventSidebarWidth}
        addCalendarSidebarOpen={addCalendarSidebarOpen}
        handleAddCalendarSidebarToggle={handleAddCalendarSidebarToggle}
        bookCalendarSidebarOpen={bookCalendarSidebarOpen}
        handleAddBookingSidebarToggle={handleAddBookingSidebarToggle}
        addBookingSidebarOpen={addBookingSidebarOpen}
        handleSelectEvent={handleSelectEvent}
        selectedService={selectedService}
      />
    </CalendarWrapper>
  )
}

// export default AppCalendar

export default withReducer({
  bookingsCalendar: bookingsCalendarSlice,
  calendar: calendar,
  appointmentListSlice: appointmentListSlice,
  services: services
})(AppCalendar)
