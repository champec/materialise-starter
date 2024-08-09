import React from 'react'
import { Box, Typography } from '@mui/material'
import { Icon } from '@iconify/react'
// import stopIcon from '@iconify/icons-mdi/stop'

const GateWayNotMet = ({ id, value, onChange, error }) => {
  return (
    <Box textAlign='center'>
      <Icon icon='openmoji:stop-sign' style={{ fontSize: 100 }} />
      <Typography variant='h5' color='error' gutterBottom>
        Patient is not eligible for this service. Please refer to appropriate care.
      </Typography>
      <Typography variant='body1'>
        Please submit and exit by pressing the submit button, or if there is a mistake, go back and change your answer.
      </Typography>
    </Box>
  )
}

export default GateWayNotMet
