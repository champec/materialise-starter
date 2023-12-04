import { supabaseOrg } from 'src/configs/supabase'
// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
const supabase = supabaseOrg

export const fetchEvents = createAsyncThunk('appCalendar/fetchEvents', async (orgId, { getState }) => {
  const { viewStart, viewEnd } = getState().calendar
  const { data, error } = await supabase.rpc('get_events', { org_id: orgId, start_time: viewStart, end_time: viewEnd })
  if (error) {
    console.log(error)
  }
  console.log(data, 'fetchEvents')
  return data || []
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
export const updateEvent = createAsyncThunk('appCalendar/updateEvent', async ({ event, orgId }, { dispatch }) => {
  console.log('updateEvent is being called', { event, orgId })
  console.log({ event })
  const { data, error } = await supabase.from('calendar_events').update(event).eq('id', event.id)
  if (error) {
    console.log(error)
  }
  console.log(data)
  dispatch(fetchEvents(orgId))
  return data
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
  const { data, error } = await supabase.from('pp_bookings').insert(booking).select('*').single()
  if (error) {
    console.log(error)
    throw error
  }
  return data
})

// ** Update a booking
export const updateBooking = createAsyncThunk('appCalendar/updateBooking', async ({ booking, id }, { dispatch }) => {
  const { data, error } = await supabase.from('pp_bookings').update(booking).eq('id', id).select('*').single()
  if (error) {
    console.log(error)
    throw error
  }
  console.log('update booking success', data)
  dispatch(fetchEvents(orgId))
  return data
})

// ** Delete a booking
export const deleteBooking = createAsyncThunk('appCalendar/deleteBooking', async ({ id }, { dispatch }) => {
  const { data, error } = await supabase.from('pp_bookings').delete().eq('id', id).select('id').single()
  if (error) {
    console.log(error)
    throw error
  }
  console.log('delete booking success', data)
  dispatch(fetchEvents(orgId))
  return data
})

//** Fetch Calendar types
export const fetchCalendarTypes = createAsyncThunk('appCalendar/fetchCalendarTypes', async () => {
  const { data, error } = await supabase.from('calendar_types').select('*').eq('type', 'booking')
  if (error) {
    console.log(error)
  }
  const types = data.map(cal => {
    return { id: cal.id, title: cal.type, color: cal.color }
  })
  console.log('calender types from supabse', types)
  return data
})

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
    notifyApiKey: null
  },
  reducers: {
    handleSelectEvent: (state, action) => {
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
      if (state.selectedCalendars.length === 0) {
        state.events.length = 0
      }
    },
    handleAllCalendars: (state, action) => {
      const value = action.payload
      if (value === true) {
        state.selectedCalendars = state.calendarTypes.map(type => type.id)
      } else {
        state.selectedCalendars = []
      }
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
export const { handleSelectEvent, handleSelectCalendar, handleCalendarsUpdate, handleAllCalendars } =
  bookingsCalendarSlice.actions

export default bookingsCalendarSlice.reducer
