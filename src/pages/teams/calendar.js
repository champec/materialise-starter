// ** React Imports
import { useEffect, useState } from 'react'
import { useOrgAuth } from 'src/hooks/useOrgAuth'

// ** MUI Imports
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** FullCalendar & App Components Imports
import Calendar from 'src/views/apps/Calendar/Calendar'
import SidebarLeft from 'src/views/apps/Calendar/SidebarLeft'
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'
import AddEventSidebar from 'src/views/apps/Calendar/AddEventSidebar'
import AddCalendarSidebar from 'src/views/apps/Calendar/AddCalendarSidebar'
import withReducer from 'src/@core/HOC/withReducer'
import appCalendarSlice from '../../store/apps/calendar/index'

// ** Actions
import {
  addEvent,
  fetchEvents,
  fetchCalendarTypes,
  deleteEvent,
  updateEvent,
  handleSelectEvent,
  handleAllCalendars,
  handleCalendarsUpdate,
  handleSelectCalendar,
  updateViewDates
} from 'src/store/apps/calendar'

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
  const [addCalendarSidebarOpen, setAddCalendarSidebarOpen] = useState(false)

  // ** Hooks
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const store = useSelector(state => state.calendar)
  const orgId = useOrgAuth()?.organisation?.id

  // ** Vars
  const leftSidebarWidth = 260
  const addEventSidebarWidth = 400
  const { skin, direction } = settings
  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))
  useEffect(() => {
    if (orgId) {
      dispatch(fetchEvents(orgId))
    }
  }, [dispatch, store.selectedCalendars, store.viewStart, store.viewEnd, orgId])

  useEffect(() => {
    dispatch(fetchCalendarTypes())
  }, [dispatch])
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)
  const handleAddCalendarSidebarToggle = () => setAddCalendarSidebarOpen(!addCalendarSidebarOpen)

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
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          handleAddCalendarSidebarToggle={handleAddCalendarSidebarToggle}
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
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
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
    </CalendarWrapper>
  )
}

// export default AppCalendar
export default withReducer('calendar', appCalendarSlice)(AppCalendar)
