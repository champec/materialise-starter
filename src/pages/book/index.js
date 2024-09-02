import React, { useState, useEffect } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import BookingModal from './BookingModal'

const PatientBooking = () => {
  const [services, setServices] = useState([])
  const [pharmacies, setPharmacies] = useState([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedPharmacy, setSelectedPharmacy] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    fetchServices()
    fetchPharmacies()
  }, [])

  const fetchServices = async () => {
    const { data, error } = await supabase.from('ps_services').select('*')
    if (data) setServices(data)
  }

  const fetchPharmacies = async () => {
    const { data, error } = await supabase.from('profiles').select('id, organisation_name').eq('type', 'organisation')
    if (data) setPharmacies(data)
  }

  const fetchAvailableSlots = async () => {
    if (!selectedService || !selectedPharmacy || !selectedDate) return

    // Define the start and end of the selected date
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setHours(23, 59, 59, 999)

    // Format the range correctly for Supabase
    const formattedRange = `[${startOfDay.toISOString()},${endOfDay.toISOString()}]`

    // Fetch availabilities
    const { data: availabilities, error: availabilityError } = await supabase
      .from('ps_service_availability')
      .select('*')
      .eq('pharmacy_id', selectedPharmacy)
      .eq('service_id', selectedService)
      .overlaps('duration', formattedRange)

    console.log('Availabilities:', availabilities)

    // Fetch existing bookings
    const { data: bookings, error: bookingError } = await supabase
      .from('ps_appointments')
      .select('*')
      .eq('pharmacy_id', selectedPharmacy)
      .eq('service_id', selectedService)
      .gte('scheduled_time', startOfDay.toISOString())
      .lt('scheduled_time', endOfDay.toISOString())

    console.log('Bookings:', bookings)

    if (availabilityError || bookingError) {
      console.error('Error fetching data:', availabilityError || bookingError)
      return
    }

    // Generate all possible slots based on availabilities
    const allSlots = availabilities.flatMap(availability => {
      const duration = availability.duration.replace(/[\[\]()]/g, '')
      const [start, end] = duration.split(',').map(time => new Date(time.trim().replace(/"/g, '')))

      const slots = []
      const slotDuration = 30 * 60 * 1000 // 30 minutes in milliseconds

      for (let time = start; time < end; time = new Date(time.getTime() + slotDuration)) {
        // Only include slots that fall within the selected day
        if (time >= startOfDay && time < endOfDay) {
          slots.push({
            time: new Date(time),
            isBooked: false
          })
        }
      }

      return slots
    })

    // Create a Set of booked slot times for efficient lookup
    const bookedSlotTimes = new Set(bookings.map(booking => new Date(booking.scheduled_time).getTime()))

    // Mark booked slots
    allSlots.forEach(slot => {
      if (bookedSlotTimes.has(slot.time.getTime())) {
        slot.isBooked = true
      }
    })

    // Sort slots by time
    allSlots.sort((a, b) => a.time.getTime() - b.time.getTime())

    console.log('All slots:', allSlots)

    setAvailableSlots(allSlots)
  }

  const handleBookSlot = slot => {
    setSelectedSlot(slot)
    setOpenModal(true)
  }

  const handleBooking = async bookingDetails => {
    const { data, error } = await supabase.from('ps_appointments').insert(bookingDetails)

    if (error) {
      console.error('Booking failed:', error)
    } else {
      console.log('Booking successful:', data)
      setOpenModal(false)
      fetchAvailableSlots()
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant='h4' gutterBottom>
          Book an Appointment
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Service</InputLabel>
              <Select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                {services.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Pharmacy</InputLabel>
              <Select value={selectedPharmacy} onChange={e => setSelectedPharmacy(e.target.value)}>
                {pharmacies.map(pharmacy => (
                  <MenuItem key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.organisation_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <DatePicker
              label='Select Date'
              value={selectedDate}
              onChange={setSelectedDate}
              renderInput={params => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12}>
            <Button onClick={fetchAvailableSlots} variant='contained' color='primary'>
              Find Available Slots
            </Button>
          </Grid>
          <Grid item xs={12}>
            {/* {availableSlots.map((slot, index) => (
              <Button key={index} onClick={() => handleBookSlot(slot)} variant='outlined'>
                {slot.time.toLocaleTimeString()}
              </Button>
            ))} */}
            <SlotRendering availableSlots={availableSlots} handleSlotClick={handleBookSlot} />
          </Grid>
        </Grid>
      </Box>
      <BookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleBooking}
        slot={selectedSlot}
        serviceId={selectedService}
        pharmacyId={selectedPharmacy}
      />
    </LocalizationProvider>
  )
}

export default PatientBooking

const SlotRendering = ({ availableSlots, handleSlotClick }) => (
  <Grid item xs={12}>
    <Typography variant='h6'>Available Slots:</Typography>
    {availableSlots.map((slot, index) => (
      <Button
        key={index}
        onClick={() => handleSlotClick(slot)}
        variant='outlined'
        disabled={slot.isBooked}
        sx={{
          m: 1,
          opacity: slot.isBooked ? 0.5 : 1,
          '&.Mui-disabled': {
            color: 'text.secondary',
            borderColor: 'text.secondary'
          }
        }}
      >
        {slot.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </Button>
    ))}
  </Grid>
)
