// ** React Import
import { useEffect, useRef } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Tooltip } from '@mui/material'
// ** Icon Imports
import Icon from 'src/@core/components/icon'

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
      dateClick(info) {
        const ev = { ...blankEvent }
        ev.start = info.date
        ev.end = info.date
        ev.allDay = info.allDay

        // @ts-ignore
        dispatch(handleSelectEvent(ev))
        console.log('DATE CLICKED ')
        appointment ? handleBookCalendarSidebar() : handleAddEventSidebarToggle()
      },

      /*
            Handle event drop (Also include dragged event)
            ? Docs: https://fullcalendar.io/docs/eventDrop
            ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
          */
      eventDrop({ event: droppedEvent }) {
        const bookingId = droppedEvent._def.extendedProps.booking_id
        dispatch(updateEvent({ event: droppedEvent, orgId: orgId, bookingId: bookingId }))
      },

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
      <FullCalendar
        {...calendarOptions}
        datesSet={({ start, end }) => {
          dispatch(updateViewDates({ viewStart: start, viewEnd: end }))
        }}
      />
    )
  } else {
    return null
  }
}

export default Calendar
