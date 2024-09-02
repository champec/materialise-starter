import React, { useState, useEffect } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import Icon from 'src/@core/components/icon'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import rrulePlugin from '@fullcalendar/rrule'
import { format, parseISO } from 'date-fns'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  FormControl,
  InputLabel
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useSelector } from 'react-redux'
import RecurringEventDialog from './RecurringEventDialog'

function Availability() {
  const [events, setEvents] = useState([])
  const [services, setServices] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const pharmacyId = useSelector(state => state.organisation.organisation.id)
  const [filteredServiceId, setFilteredServiceId] = useState('all')

  // Function to filter events by selected service
  const filteredEvents =
    filteredServiceId === 'all' ? events : events.filter(event => event.extendedProps.serviceId === filteredServiceId)

  // Handle filter change
  const handleServiceFilterChange = event => {
    setFilteredServiceId(event.target.value)
  }

  const [newEvent, setNewEvent] = useState({
    id: null,
    serviceId: '',
    start: null,
    end: null,
    isRecurring: false,
    recurrenceRule: ''
  })

  useEffect(() => {
    if (pharmacyId) {
      fetchServices().then(() => fetchEvents())
    }
  }, [pharmacyId])

  // use effect to console log the services and events
  useEffect(() => {
    console.log('SERVICES', services)
    console.log('EVENTS', events)
  }, [services, events])

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('ps_pharmacy_services')
      .select('service_id, ps_services(id, name, color)') // Include color column
      .eq('pharmacy_id', pharmacyId)

    if (data) {
      setServices(data.map(item => item.ps_services))
    }
  }

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('ps_service_availability')
      .select('*, ps_services(id, name, color)')
      .eq('pharmacy_id', pharmacyId)

    if (data) {
      setEvents(
        data.map(event => {
          const [start, end] = event.duration
            .slice(1, -1)
            .split(',')
            .map(d => new Date(d.replace(/"/g, '')))

          // Use the color from the service
          const color = event?.ps_services?.color || '#000' // Default to black if color not found
          console.log('COLOR', color)
          return {
            id: event.id,
            title: event?.ps_services?.name || 'Unnamed Service',
            start: event.is_recurring ? null : start,
            end: event.is_recurring ? null : end,
            rrule: event.is_recurring ? event.recurrence_rule : null,
            duration: event.is_recurring
              ? {
                  hours: (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                }
              : null,
            extendedProps: {
              serviceId: event.service_id,
              isRecurring: event.is_recurring,
              recurrenceRule: event.recurrence_rule
            },
            backgroundColor: color, // Set the color for the event
            borderColor: color // Optionally, set the border color too
          }
        })
      )
    }
  }

  const handleEventClick = clickInfo => {
    const event = clickInfo.event
    setNewEvent({
      id: event.id,
      serviceId: event.extendedProps.serviceId,
      start: event.start,
      end: event.end,
      isRecurring: event.extendedProps.isRecurring,
      recurrenceRule: event.extendedProps.recurrenceRule
    })
    setOpenDialog(true)
  }

  const handleDateSelect = selectInfo => {
    setNewEvent({
      ...newEvent,
      start: selectInfo.start,
      end: selectInfo.end
    })
    setOpenDialog(true)
  }

  const handleEventDrop = async dropInfo => {
    const { event } = dropInfo
    const updatedEvent = {
      id: event.id,
      pharmacy_id: pharmacyId,
      service_id: event.extendedProps.serviceId,
      is_recurring: event.extendedProps.isRecurring,
      duration: `[${event.start.toISOString()},${event.end.toISOString()})`,
      recurrence_rule: event.extendedProps.recurrenceRule
    }

    const { data, error } = await supabase.from('ps_service_availability').update(updatedEvent).eq('id', event.id)

    if (error) {
      setSnackbar({ open: true, message: 'Failed to update event', severity: 'error' })
      dropInfo.revert()
    } else {
      setSnackbar({ open: true, message: 'Event updated successfully', severity: 'success' })
      fetchEvents()
    }
  }

  const handleEventResize = async resizeInfo => {
    const { event } = resizeInfo
    const updatedEvent = {
      id: event.id,
      pharmacy_id: pharmacyId,
      service_id: event.extendedProps.serviceId,
      is_recurring: event.extendedProps.isRecurring,
      duration: `[${event.start.toISOString()},${event.end.toISOString()})`,
      recurrence_rule: event.extendedProps.recurrenceRule
    }

    const { data, error } = await supabase.from('ps_service_availability').update(updatedEvent).eq('id', event.id)

    if (error) {
      setSnackbar({ open: true, message: 'Failed to update event', severity: 'error' })
      resizeInfo.revert()
    } else {
      setSnackbar({ open: true, message: 'Event updated successfully', severity: 'success' })
      fetchEvents()
    }
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
    setSelectedEvent(null)
    setNewEvent({
      id: null,
      serviceId: '',
      start: null,
      end: null,
      isRecurring: false,
      recurrenceRule: ''
    })
  }

  const handleSaveEvent = async updatedEventData => {
    // Construct the event data directly from the passed updatedEventData
    let eventData = {
      pharmacy_id: pharmacyId, // Pharmacy ID remains the same
      service_id: updatedEventData.serviceId, // Use updated service ID
      is_recurring: updatedEventData.isRecurring,
      duration: `[${updatedEventData.start.toISOString()},${updatedEventData.end.toISOString()})`,
      recurrence_rule: updatedEventData.rrule // Use updated recurrence rule if any
    }

    let result

    if (updatedEventData.id) {
      // Update the existing event
      result = await supabase.from('ps_service_availability').update(eventData).eq('id', updatedEventData.id)
    } else {
      // Insert a new event
      result = await supabase.from('ps_service_availability').insert(eventData)
    }

    const { data, error } = result

    if (error) {
      setSnackbar({ open: true, message: 'Failed to save availability', severity: 'error' })
    } else {
      setSnackbar({ open: true, message: 'Availability saved successfully', severity: 'success' })
      fetchEvents() // Refresh the event list to reflect changes
    }
    handleDialogClose() // Close the dialog after saving
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant='h4' gutterBottom>
          Service Availability
        </Typography>
        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel>Filter by Service</InputLabel>
            <Select value={filteredServiceId} onChange={handleServiceFilterChange} label='Filter by Service'>
              <MenuItem value='all'>All</MenuItem>
              {services.map(service => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin, rrulePlugin]}
          initialView='timeGridWeek'
          events={filteredEvents}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          editable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
        />
        <RecurringEventDialog
          open={openDialog}
          onClose={handleDialogClose}
          onSave={handleSaveEvent}
          services={services}
          eventData={newEvent}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  )
}

export default Availability
