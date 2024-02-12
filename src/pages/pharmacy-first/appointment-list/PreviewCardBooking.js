import React from 'react'
import { Card, CardContent, Typography, Grid } from '@mui/material'
import dayjs from 'dayjs'

const PreviewCardBooking = ({ booking }) => {
  const eventDateTime = booking.calendar_events?.start
  const formattedDate = eventDateTime ? dayjs(booking.calendar_events?.start).format('D MMM YYYY [at] HH:mm') : 'N/A'
  const patientDOB = dayjs(booking.patient_object.dob).format('D MMM YYYY')

  return (
    <Card raised sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Booking Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1'>
              <b>Patient Name:</b> {booking.patient_object?.full_name}
            </Typography>
            <Typography variant='body1'>
              <b>Date of Birth:</b> {patientDOB}
            </Typography>
            <Typography variant='body1'>
              <b>Contact:</b> {booking.patient_object?.email}
            </Typography>
            <Typography variant='body1'>
              <b>Address:</b> {`${booking.patient_object?.house_number}, ${booking.patient_object.address}`}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1'>
              <b>Appointment Time:</b> {formattedDate}
            </Typography>
            <Typography variant='body1'>
              <b>Pharmacist:</b> {booking.pharmacist_object?.full_name}
            </Typography>
            <Typography variant='body1'>
              <b>Clinical Pathway:</b> {booking.clinical_pathway}
            </Typography>
            <Typography variant='body1'>
              <b>Presenting Complaint:</b> {booking.presenting_complaint}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PreviewCardBooking
