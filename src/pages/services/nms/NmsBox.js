import React from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material'
import IconifyIcon from 'src/@core/components/icon'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

function NmsBox({ nmsData }) {
  // const nmsData = nms?.service_nms?.[0]

  const ExpandMoreIcon = () => <IconifyIcon icon='mdi:chevron-down' />

  if (!nmsData) {
    return <div>No data available</div>
  }

  const style = {
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
    maxHeight: '200px', // Adjust as needed
    overflowY: 'auto'
  }

  return (
    <div>
      <Typography variant='h6'>NMS Data</Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Basic Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>ID: {nmsData.id}</Typography>
          <Typography>Created At: {nmsData.created_at}</Typography>
          <Typography>Consultation ID: {nmsData.consultation_id}</Typography>
          <Typography>Next Due: {nmsData.next_due}</Typography>
          <Typography>Next Due Type: {nmsData.next_due_type}</Typography>
          <Typography>Other Notes: {nmsData.other_notes}</Typography>
          <Typography>Booking Notes: {nmsData.booking_notes}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Intervention</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box style={style}>
            <Typography>During Survey: {JSON.stringify(nmsData.intervention.during_survey, null, 2)}</Typography>
            <Typography>Post Survey: {JSON.stringify(nmsData.intervention.post_survey, null, 2)}</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Follow Up</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box style={style}>
            <Typography>During Survey: {JSON.stringify(nmsData.follow_up.during_survey)}</Typography>
            <Typography>Post Survey: {JSON.stringify(nmsData.follow_up.post_survey)}</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Add similar Accordion blocks for other sections as needed */}
    </div>
  )
}

export default NmsBox
