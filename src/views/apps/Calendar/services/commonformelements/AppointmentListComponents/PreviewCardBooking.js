import React from 'react'
import { Card, CardContent, Typography, Grid, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'

// service Views
import NmsBox from 'src/pages/services/nms/NmsBox'
import FluBox from '../../flu-vf/FluBox'
import HtnBox from '../../htn/HtnBox'
import DmsBox from '../../dms-vf/DmsBox'
import PfsBox from '../../pharmacy-first-vf/PfsBox'

const getServiceView = (serviceTable, serviceInfo) => {
  switch (serviceTable) {
    case 'service_nms':
      return <NmsBox nmsData={serviceInfo} />
    case 'service_flu':
      return <FluBox />
    case 'service_htn':
      return <HtnBox />
    case 'service_dms':
      return <DmsBox />
    case 'service_pfs':
      return <PfsBox />
    default:
      return <div>No service view available</div>
  }
}

const PreviewCardBooking = ({ booking, serviceTable }) => {
  const eventDateTime = booking.calendar_events?.start
  const formattedDate = eventDateTime ? dayjs(booking.calendar_events?.start).format('D MMM YYYY [at] HH:mm') : 'N/A'
  const patientDOB = dayjs(booking.patient_object.dob).format('D MMM YYYY')
  const selectedBooking = useSelector(state => state.appointmentListSlice.selectedBooking)
  const serviceInfo = selectedBooking ? selectedBooking[serviceTable] : null
  // const service_table = booking.service_table
  // const serviceInfo = booking.service_info

  console.log('service view', serviceTable, serviceInfo)

  return (
    <Box>
      <Card raised sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Booking Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant='body1'>
                <b>Patient Name:</b> {booking.patient_object.full_name}
              </Typography>
              <Typography variant='body1'>
                <b>Date of Birth:</b> {patientDOB}
              </Typography>
              <Typography variant='body1'>
                <b>Contact:</b> {booking.patient_object.email}
              </Typography>
              <Typography variant='body1'>
                <b>Address:</b> {`${booking.patient_object.house_number}, ${booking.patient_object.address}`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='body1'>
                <b>Appointment Time:</b> {formattedDate}
              </Typography>
              <Typography variant='body1'>
                <b>Pharmacist:</b> {booking.pharmacist_object.full_name}
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

      <Card raised sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Service Details
          </Typography>
          {getServiceView(serviceTable, serviceInfo)}
        </CardContent>
      </Card>
    </Box>
  )
}

export default PreviewCardBooking
