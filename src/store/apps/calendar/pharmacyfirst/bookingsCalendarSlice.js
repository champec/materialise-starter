import { supabaseOrg } from 'src/configs/supabase'
// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appendMessageToThread } from './appointmentListSlice'
const supabase = supabaseOrg

// export const fetchEvents = createAsyncThunk('appCalendar/fetchEvents', async (orgId, { getState }) => {
//   // const { viewStart, viewEnd } = getState().calendar
//   // const { data, error } = await supabase.rpc('get_events', { org_id: orgId, start_time: viewStart, end_time: viewEnd })
//   // if (error) {
//   //   console.log(error)
//   // }
//   const { data, error } = await supabase
//     .from('calendar_events')
//     .select('*, consultations!calendar_events_booking_id_fkey(*), calendar_types(*)')
//     .eq('company_id', orgId)
//   if (error) {
//     console.log(error)
//     throw error
//   }
//   console.log(data, 'fetchEvents')
//   return data
// })

export const fetchEvents = createAsyncThunk('appCalendar/fetchEvents', async (orgId, { getState }) => {
  const { viewStart, viewEnd } = getState().bookingsCalendar
  // const { data, error } = await supabase.rpc('get_events', { org_id: orgId, start_time: viewStart, end_time: viewEnd })
  const { data, error } = await supabase
    .from('ps_appointments')
    .select('id, status_details, scheduled_time, ps_services(ps_pharmacy_services(id, color))')
    .eq('pharmacy_id', orgId)

  if (error) {
    console.log(error)
  }

  const appointments = data.map(event => {
    return {
      ...event,
      url: event?.details?.remote?.url,
      start: event.scheduled_time,
      color: event.ps_services?.ps_pharmacy_services?.[0].color,
      p_service_id: event.ps_services?.ps_pharmacy_services?.[0]?.id,
      title: event.patient_object?.full_name || 'Full Name'
    }
  })

  console.log('appointments', appointments, data, 'fetchEvents')
  return appointments || []
})

export const fetchCalendarTypes = createAsyncThunk('appCalendar/fetchCalendarTypes', async () => {
  //const { data, error } = await supabase.from('calendar_types').select('*').eq('type', 'booking') error, success, warning, info,
  const { data, error } = await supabase.from('ps_pharmacy_services').select(`*, ps_services (*)`)
  if (error) {
    console.log(error)
  }

  console.log('calender types from supabse', data)
  const types = data.map(cal => {
    return { id: cal.id, title: cal.ps_services.abbreviation, color: cal.color }
  })
  console.log('calender types from supabse', types)
  return types
})

// ** Add Event
export const addEvent = createAsyncThunk('appCalendar/addEvent', async (event, { dispatch, getState }) => {
  const orgId = getState().organisation.organisation.id

  const { data, error } = await supabase.from('calendar_events').insert(event).select('*').single()
  if (error) {
    console.log(error)
    throw error
  }
  await dispatch(fetchEvents(orgId))
  return data
})

// ** Update Event
export const updateEvent = createAsyncThunk(
  'appCalendar/updateEvent',
  async ({ event, orgId, bookingId }, { dispatch, getState }) => {
    console.log('updateEvent is being called', { event, orgId, bookingId })
    console.log({ event })
    if (!bookingId) {
      const { data, error } = await supabase.from('calendar_events').update(event).eq('id', event.id)
      if (error) {
        console.log(error)
      }
      console.log(data)
      dispatch(fetchEvents(orgId))
      return data
    } else {
      //find old event
      const oldEvent = getState().bookingsCalendar.events.find(calEvent => calEvent.id == event?._def?.publicId)
      console.log('OldEvent', oldEvent, 'bookingId', bookingId, 'EVENT', event)
      const oldEventStart = new Date(oldEvent.start)
      const newEventStart = new Date(event._instance.range.start)
      console.log(`Your event has been updated from ${oldEventStart} to ${newEventStart}`)

      //update event
      const { data, error } = await supabase.from('calendar_events').update(event).eq('id', event.id)
      if (error) {
        console.log(error)
      }

      //fetch thread id
      const { data: threadId, error: threadError } = await supabase
        .from('sms_threads')
        .select('id')
        .eq('consultation_id', bookingId)
        .single()

      if (threadError) {
        console.log(threadError)
      }

      if (threadId?.id) {
        const message = `Your appointment has been updated from ${oldEventStart} to ${newEventStart}`
        dispatch(appendMessageToThread({ threadId: threadId.id, message: message }))
      }
    }
  }
)

export const simpleEventUpdate = createAsyncThunk('appCalendar/simpleEventUpdate', async event => {
  console.log('simpleEventUpdate is being called', { event })
  try {
    const { data, error } = await supabase.from('calendar_events').update(event).eq('id', event.id)
    if (error) {
      console.log(error)
    }
    console.log(data)
    return data
  } catch (error) {
    console.log(error)
    return error
  }
})

// ** Delete Event
export const deleteEvent = createAsyncThunk('appCalendar/deleteEvent', async ({ id, orgId }, { dispatch }) => {
  const { data, error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) {
    console.log(error)
  }
  await dispatch(fetchEvents(orgId))
  return data
})

// ** Create a booking
export const createBooking = createAsyncThunk('appCalendar/createBooking', async (booking, { dispatch }) => {
  const { data, error } = await supabase.from('consultations').insert(booking).select('*').single()
  if (error) {
    console.log(error)
    throw error
  }
  return data
})

export const createNMSServiceBooking = createAsyncThunk(
  'appCalendar/createNMSServiceBooking',
  async (nms, { dispatch }) => {
    const { error } = await supabase.from('service_nms').insert(nms)
    if (error) {
      console.log(error)
      throw error
    }

    return supabase
  }
)

// ** Update a booking
export const updateBooking = createAsyncThunk(
  'appCalendar/updateBooking',
  async ({ booking, id }, { dispatch, getState }) => {
    const orgId = getState().organisation.organisation.id
    const { data, error } = await supabase.from('consultations').update(booking).eq('id', id).select('*').single()
    if (error) {
      console.log(error)
      throw error
    }
    console.log('update booking success', data)
    dispatch(fetchEvents(orgId))
    return data
  }
)

// ** Delete a booking
export const deleteBooking = createAsyncThunk('appCalendar/deleteBooking', async (id, { dispatch }) => {
  const { data, error } = await supabase.from('consultations').delete().eq('id', id).select('id').single()
  if (error) {
    console.log(error)
    throw error
  }
  console.log('delete booking success', data)
  // dispatch(fetchEvents(orgId))
  return data
})

//** Fetch Calendar types
// export const fetchCalendarTypes = createAsyncThunk('appCalendar/fetchCalendarTypes', async () => {
//   //const { data, error } = await supabase.from('calendar_types').select('*').eq('type', 'booking') error, success, warning, info,
//   const { data, error } = await supabase.from('ps_pharmacy_services').select('*, ps_service(*)')
//   if (error) {
//     console.log(error)
//   }
//   const types = data.map(cal => {
//     return { id: cal.id, title: cal.ps_service.abbreviation, color: cal.color }
//   })
//   console.log('calender types from supabse', types)
//   return data
// })

//* update v
export const updateViewDates = createAsyncThunk('appCalendar/updateViewDates', async ({ viewStart, viewEnd }) => {
  return { viewStart, viewEnd }
})

export const bookingsCalendarSlice = createSlice({
  name: 'bookingsCalendar',
  initialState: {
    events: [],
    selectedEvent: null,
    selectedCalendar: null, // new state
    selectedCalendars: [],
    calendarTypes: [],
    viewStart: null,
    viewEnd: null,
    notifyApiKey: null,
    selectedAppointment: null
  },
  reducers: {
    handleSelectEvent: (state, action) => {
      console.log('handleSelectEvent from THUNK', action.payload)
      state.selectedEvent = action.payload
    },
    handleSelectCalendar: (state, action) => {
      state.selectedCalendar = action.payload
    },
    handleCalendarsUpdate: (state, action) => {
      const filterIndex = state.selectedCalendars.findIndex(i => i === action.payload)
      if (state.selectedCalendars.includes(action.payload)) {
        state.selectedCalendars.splice(filterIndex, 1)
      } else {
        state.selectedCalendars.push(action.payload)
      }
      // if (state.selectedCalendars.length === 0) {
      //   state.events.length = 0
      // }
    },
    handleAllCalendars: (state, action) => {
      const value = action.payload
      if (value === true) {
        state.selectedCalendars = state.calendarTypes.map(type => type.id)
      } else {
        state.selectedCalendars = []
      }
    },
    setSelectedAppointmentById: (state, action) => {
      state.selectedAppointment = state.events.find(event => event.id === action.payload)
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.events = action.payload
    })
    builder.addCase(fetchCalendarTypes.fulfilled, (state, action) => {
      state.calendarTypes = action.payload
    })
    builder.addCase(updateViewDates.fulfilled, (state, action) => {
      state.viewStart = action.payload.viewStart
      state.viewEnd = action.payload.viewEnd
    })
  }
})

// export const { handleSelectEvent, handleCalendarsUpdate, handleAllCalendars } = bookingsCalendarSlice.actions
export const {
  handleSelectEvent,
  handleSelectCalendar,
  handleCalendarsUpdate,
  handleAllCalendars,
  setSelectedAppointmentById,
  setSelectedAppointment
} = bookingsCalendarSlice.actions

export default bookingsCalendarSlice.reducer
