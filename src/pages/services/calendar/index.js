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
} from '../../../store/apps/calendar/pharmacyfirst/bookingsCalendarSlice' //'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'

import {
  fetchAppointments,
  fetchServicesWithStages
} from '../../../store/apps/pharmacy-services/pharmacyServicesThunks'

//MUI
import { Dialog, DialogContent, Drawer } from '@mui/material'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import withReducer from 'src/@core/HOC/withReducer'
import bookingsCalendarSlice from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import pharmacyServicesSlice, {
  setSelectedAppointment,
  setSelectedAppointmentById
} from '../../../store/apps/pharmacy-services/pharmacyServicesSlice'

// ** FullCalendar & App Components Imports
import Calendar from '../../../views/apps/Calendar/Calendar'
import SidebarLeft from 'src/views/apps/Calendar/SidebarLeft'
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'
import ServiceDeliveryComponent from '../service-list/components/ServiceDeliveryComponent'
import BookingComponent from '../service-list/BookingComponent'

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
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const selectedAppointment = useSelector(state => state.services.selectedAppointment)

  // ** Hooks
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const store = useSelector(state => state.bookingsCalendar)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const events = useSelector(state => state.services.appointments)

  console.log('store', store)

  // ** Vars
  const leftSidebarWidth = 260
  const addEventSidebarWidth = 400
  const { skin, direction } = settings
  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))
  useEffect(() => {
    if (orgId) {
      console.log('USE EFFECT EVENT FETCH ON LOAD', orgId)
      // dispatch(fetchEvents(orgId))
      dispatch(fetchAppointments(orgId))
      dispatch(fetchServicesWithStages())
    }
  }, [dispatch, orgId])

  useEffect(() => {
    dispatch(fetchCalendarTypes())
  }, [dispatch])
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)
  const handleAddBookingSidebarToggle = () => setAddBookingSidebarOpen(!addBookingSidebarOpen)
  const handleAddCalendarSidebarToggle = () => setAddCalendarSidebarOpen(!addCalendarSidebarOpen)
  const selectedService = null // useSelector(state => state.services.selectedService) null

  console.log('selectedService', selectedService)

  const handleBookCalendarSidebar = event => {
    // setOpenServiceSelectorModal(true)
    console.log('NEW BOOKING TO BE MADE')
    setIsDrawerOpen(true)
  }

  const openDelivery = eventId => {
    console.log('OPEN DELIVER FOR APPOINTMENT', eventId)
    dispatch(setSelectedAppointmentById(eventId))
    setIsDeliveryModalOpen(true)
  }

  const handleEditBooking = appointment => {
    setSelectedAppointment(appointment)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedAppointment(null)
  }

  const handleCloseDeliveryModal = () => {
    dispatch(setSelectedAppointment(null))
    setIsDeliveryModalOpen(false)
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
        // handleLeftSidebarToggle={handleLeftSidebarToggle}
        // handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        // handleAddCalendarSidebarToggle={handleAddCalendarSidebarToggle}
        // handleAddBookingSidebarToggle={handleAddBookingSidebarToggle}
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
          events={events}
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
          // handleLeftSidebarToggle={handleLeftSidebarToggle}
          // handleAddEventSidebarToggle={handleBookCalendarSidebar}
          // handleAddCalendarSidebarToggle={handleAddCalendarSidebarToggle}
          // handleAddBookingSidebarToggle={handleAddBookingSidebarToggle}
          handleBookCalendarSidebar={handleBookCalendarSidebar}
          openDelivery={openDelivery}
          // fetchSelectedBooking={fetchSelectedBooking}
          appointment
        />
      </Box>

      {selectedAppointment && (
        <Dialog
          open={isDeliveryModalOpen}
          onClose={handleCloseDeliveryModal}
          maxWidth='lg'
          fullWidth
          sx={{ zIndex: 1200 }}
        >
          <DialogContent sx={{ minWidth: '800px', minHeight: '600px' }}>
            <ServiceDeliveryComponent
              appointment={selectedAppointment}
              onClose={handleCloseDeliveryModal}
              onEdit={handleEditBooking}
            />
          </DialogContent>
        </Dialog>
      )}
      <Drawer anchor='left' open={isDrawerOpen} onClose={handleCloseDrawer} sx={{ zIndex: 1201 }}>
        <BookingComponent appointment={selectedAppointment} onClose={handleCloseDrawer} />
      </Drawer>
    </CalendarWrapper>
  )
}

// export default AppCalendar

export default withReducer({
  bookingsCalendar: bookingsCalendarSlice,
  // calendar: calendar,
  // appointmentListSlice: appointmentListSlice,
  services: pharmacyServicesSlice
})(AppCalendar)
