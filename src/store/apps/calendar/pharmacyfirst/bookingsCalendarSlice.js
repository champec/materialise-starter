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
export const addEvent = createAsyncThunk('appCalendar/addEvent', async ({ modifiedEvent, orgId }, { dispatch }) => {
  console.log({ orgId, modifiedEvent }, 'add event')
  const { data, error } = await supabase.from('calendar_events').insert(modifiedEvent)
  if (error) {
    console.log(error)
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

//** Fetch Calendar types
export const fetchCalendarTypes = createAsyncThunk('appCalendar/fetchCalendarTypes', async () => {
  const { data, error } = await supabase.from('calendar_types').select('*').eq('type', 'appointment')
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
    selectedCalendars: ['Busines'],
    calendarTypes: [],
    viewStart: null,
    viewEnd: null
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
