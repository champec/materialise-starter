// ** React Import
import { useEffect, useRef } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

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
    timeSlotType,
    appointment
  } = props

  // ** Refs
  const calendarRef = useRef()
  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current.getApi())
    }
  }, [calendarApi, setCalendarApi])
  if (store) {
    // ** calendarOptions(Props)
    const selectedCalendars = store.selectedCalendars

    const calendarOptions = {
      events: store.events.length ? store.events.filter(event => selectedCalendars.includes(event.calendarType)) : [],

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
      eventClassNames({ event: calendarEvent }) {
        // @ts-ignore
        // const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar]

        const colorName = calendarEvent._def.extendedProps.color

        return [
          // Background Color
          `bg-${colorName}`
        ]
      },
      eventClick({ event: clickedEvent }) {
        dispatch(handleSelectEvent(clickedEvent))
        handleAddEventSidebarToggle()

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
        ev.allDay = true

        // @ts-ignore
        dispatch(handleSelectEvent(ev))
        handleAddEventSidebarToggle()
      },

      /*
            Handle event drop (Also include dragged event)
            ? Docs: https://fullcalendar.io/docs/eventDrop
            ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
          */
      eventDrop({ event: droppedEvent }) {
        dispatch(updateEvent({ event: droppedEvent, orgId: orgId }))
      },

      /*
            Handle event resize
            ? Docs: https://fullcalendar.io/docs/eventResize
          */
      eventResize({ event: resizedEvent }) {
        dispatch(updateEvent({ event: resizedEvent, orgId: orgId }))
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
