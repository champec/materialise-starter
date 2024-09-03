// ** React Import
import { useEffect, useRef, useState } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Tooltip } from '@mui/material'
// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import {
  setSelectedAppointmentStartDate,
  tempUpdateAppointment,
  revertAppointmentUpdate,
  clearTempOriginalAppointment
} from '../../../store/apps/pharmacy-services/pharmacyServicesSlice'
import { updateAppointment } from '../../../store/apps/pharmacy-services/pharmacyServicesThunks'
import { useSelector } from 'react-redux'
import { format } from 'date-fns'
const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: ''
  }
}

const Calendar = props => {
  // ** Props
  const {
    store,
    events,
    orgId,
    dispatch,
    direction,
    updateEvent,
    calendarApi,
    updateViewDates,
    calendarsColor,
    setCalendarApi,
    handleSelectEvent,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle,
    handleAddBookingSidebarToggle,
    timeSlotType,
    appointment,
    fetchSelectedBooking,
    setSelectedService,
    handleBookCalendarSidebar,
    openDelivery
  } = props

  // ** Refs
  const calendarRef = useRef()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [draggedEventId, setDraggedEventId] = useState(null)
  const tempUpdatedAppointment = useSelector(state =>
    state.services.appointments.find(app => app.id === state.services.tempOriginalAppointment?.id)
  )

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current.getApi())
    }
  }, [calendarApi, setCalendarApi])

  const renderEventContent = eventInfo => {
    return (
      <Tooltip title={eventInfo.event.extendedProps.description || ''}>
        <div
          style={{
            backgroundColor: eventInfo.event.backgroundColor || '#3788d8',
            color: eventInfo.event.textColor || 'white',
            padding: '2px 5px',
            borderRadius: '3px',
            fontSize: '0.85em',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span>{eventInfo.event.title}</span>
          {eventInfo.event.extendedProps.isCompleted && (
            // <CheckCircleIcon style={{ marginLeft: '5px', fontSize: '1em' }} />
            <div>CheckMARK</div>
          )}
        </div>
      </Tooltip>
    )
  }

  const handleEventDrop = info => {
    const { event, oldEvent } = info
    const updatedAppointment = {
      ...event.extendedProps,
      id: event.id,
      start: event.start,
      end: event.end,
      title: event.title,
      scheduled_time: event.start // Make sure to update the scheduled_time
    }

    dispatch(
      tempUpdateAppointment({
        id: event.id,
        updatedAppointment
      })
    )
    setDraggedEventId(event.id)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmMove = sendText => {
    if (tempUpdatedAppointment) {
      dispatch(updateAppointment({ appointmentData: tempUpdatedAppointment, sendText }))
      dispatch(clearTempOriginalAppointment())
      setIsConfirmDialogOpen(false)
    }
  }

  const handleCancelMove = () => {
    dispatch(revertAppointmentUpdate())
    setIsConfirmDialogOpen(false)
  }

  const handleDateClick = info => {
    console.log('selected start date INFO', info)
    dispatch(setSelectedAppointmentStartDate(info.date))
    handleBookCalendarSidebar()
  }

  if (store) {
    // ** calendarOptions(Props)
    const selectedCalendars = store.selectedCalendars
    console.log('CALENDAR', selectedCalendars, events, events[0]?.ps_services?.ps_pharmacy_services?.[0]?.id)
    const calendarOptions = {
      events: events.length
        ? events.filter(event => selectedCalendars.includes(event?.ps_services?.ps_pharmacy_services?.[0]?.id))
        : [],
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        start: 'sidebarToggle, prev, next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      editable: true,
      eventDrop: handleEventDrop,
      dateClick: handleDateClick,
      views: {
        week: {
          titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      },
      slotDuration: appointment ? '00:10:00' : '00:30:00',

      /*
            Enable dragging and resizing event
            ? Docs: https://fullcalendar.io/docs/editable
          */
      editable: true,
      /*
            Enable resizing event from start
            ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
          */
      eventResizableFromStart: true,

      /*
            Automatically scroll the scroll-containers during event drag-and-drop and date selecting
            ? Docs: https://fullcalendar.io/docs/dragScroll
          */
      dragScroll: true,

      /*
            Max number of events within a given day
            ? Docs: https://fullcalendar.io/docs/dayMaxEvents
          */
      dayMaxEvents: 2,

      /*
            Determines if day names and week names are clickable
            ? Docs: https://fullcalendar.io/docs/navLinks
          */
      navLinks: true,
      eventClassNames({ event }) {
        // @ts-ignore
        // const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar]

        // const colorName = event._def.extendedProps.calendar_types.color
        const colorName = event.color

        console.log('colorName', colorName, event)

        return [
          // Background Color
          `bg-${colorName}`
        ]
      },
      eventClick({ event: clickedEvent, jsEvent }) {
        jsEvent.preventDefault() // Prevents going to the URL
        // const eventId = clickedEvent?._def.extendedProps?.booking_id
        const eventId = clickedEvent?._def?.publicId
        const selectedService = clickedEvent?._def.extendedProps.calendar_types

        console.log('clickedEvent', clickedEvent)
        // if (eventId) {
        //   window.open(`/apps/appointment-scheduler/${eventId}`, '_blank')
        // }
        // if (eventId) {
        //   dispatch(fetchSelectedBooking(eventId))
        //   dispatch(setSelectedService(selectedService))
        //   handleAddBookingSidebarToggle(eventId)
        // } else {
        //   dispatch(handleSelectEvent(clickedEvent))
        //   handleAddEventSidebarToggle(eventId)
        // }
        openDelivery(eventId)
        // * Only grab required field otherwise it goes in infinity loop
        // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
        // event.value = grabEventDataFromEventApi(clickedEvent)
        // isAddNewEventSidebarActive.value = true
      },
      customButtons: {
        sidebarToggle: {
          text: <Icon icon='mdi:menu' />,
          click() {
            handleLeftSidebarToggle()
          }
        }
      },
      // dateClick(info) {
      //   const ev = { ...blankEvent }
      //   ev.start = info.date
      //   ev.end = info.date
      //   ev.allDay = info.allDay

      //   // @ts-ignore
      //   dispatch(handleSelectEvent(ev))
      //   console.log('DATE CLICKED ')
      //   appointment ? handleBookCalendarSidebar() : handleAddEventSidebarToggle()
      // },

      /*
            Handle event drop (Also include dragged event)
            ? Docs: https://fullcalendar.io/docs/eventDrop
            ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
          */
      // eventDrop({ event: droppedEvent }) {
      //   const bookingId = droppedEvent._def.extendedProps.booking_id
      //   dispatch(updateEvent({ event: droppedEvent, orgId: orgId, bookingId: bookingId }))
      // },

      /*
            Handle event resize
            ? Docs: https://fullcalendar.io/docs/eventResize
          */
      eventResize({ event: resizedEvent }) {
        const bookingId = resizedEvent._def.extendedProps.booking_id
        dispatch(updateEvent({ event: resizedEvent, orgId: orgId, bookingId: bookingId }))
      },
      ref: calendarRef,

      // Get direction from app state (store)
      direction
    }

    let slotDuration
    switch (timeSlotType) {
      case 'appointment':
        slotDuration = '00:10:00' // 10-minute slots for appointments
        break
      case 'workSchedule':
        slotDuration = '01:00:00' // 1-hour slots for work schedules
        break
      default:
        slotDuration = '00:30:00' // Default slot duration
    }

    // @ts-ignore
    return (
      <>
        <FullCalendar
          {...calendarOptions}
          datesSet={({ start, end }) => {
            dispatch(updateViewDates({ viewStart: start, viewEnd: end }))
          }}
        />
        <Dialog open={isConfirmDialogOpen} onClose={handleCancelMove}>
          <DialogTitle>Confirm Appointment Change</DialogTitle>
          <DialogContent>
            {tempUpdatedAppointment && (
              <>
                You are about to change the appointment for {tempUpdatedAppointment.title}.<br />
                {/* Old time: {format(new Date(tempUpdatedAppointment.scheduled_time), 'PPpp')}
                <br /> */}
                New time: {format(new Date(tempUpdatedAppointment.start), 'PPpp')}
                <br />
                Do you want to send a text message to the patient about this appointment change?
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelMove}>Cancel</Button>
            <Button onClick={() => handleConfirmMove(false)}>Don't Send Text</Button>
            <Button onClick={() => handleConfirmMove(true)} color='primary'>
              Send Text
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  } else {
    return null
  }
}

export default Calendar
