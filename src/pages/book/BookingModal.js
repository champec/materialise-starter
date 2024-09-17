import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material'

const BookingModal = ({ open, onClose, onSave, slot, serviceId, pharmacyId, presentingComplaint }) => {
  const [bookingDetails, setBookingDetails] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointment_type: 'in-person',
    gpName: '',
    gpSurgery: ''
  })

  const handleChange = e => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value })
  }

  console.log('SELECTED SERVICE ID', serviceId)
  const handleSave = () => {
    onSave({
      scheduled_time: slot.time,
      service_id: serviceId?.ps_services?.id,
      pharmacy_id: pharmacyId,
      appointment_end_time: new Date(new Date(slot.time).getTime() + 30 * 60000), // Assuming 30-minute appointments
      overall_status: 'Pending Config',
      patient_object: {
        full_name: bookingDetails.patientName,
        email: bookingDetails.patientEmail,
        mobile_number: bookingDetails.patientPhone
      },
      status_details: {
        info: 'Self booked using manual booking'
      },
      gp_object: {
        name: bookingDetails.gpName,
        surgery: bookingDetails.gpSurgery
      },
      appointment_source: 'booked',
      current_stage_id: serviceId?.id,
      presenting_complaint: presentingComplaint
    })
  }

  // Function to format the date in UK style
  const formatUKDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Book Appointment</DialogTitle>
      <DialogContent>
        <Typography variant='subtitle1' gutterBottom>
          Booking for: {slot && slot.time ? formatUKDate(slot.time) : 'No time selected'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Patient Name'
              name='patientName'
              value={bookingDetails.patientName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Patient Email'
              name='patientEmail'
              value={bookingDetails.patientEmail}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Patient Phone'
              name='patientPhone'
              value={bookingDetails.patientPhone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Appointment Type</InputLabel>
              <Select name='appointment_type' value={bookingDetails.appointment_type} onChange={handleChange}>
                <MenuItem value='in-person'>In Person</MenuItem>
                <MenuItem value='remote-video'>Remote Video</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label='GP Name' name='gpName' value={bookingDetails.gpName} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='GP Surgery'
              name='gpSurgery'
              value={bookingDetails.gpSurgery}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color='primary'>
          Book Appointment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BookingModal
