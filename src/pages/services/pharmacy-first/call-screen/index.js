import React from 'react'
import CallScreen from './CallScreen'
import { Box, Button } from '@mui/material'
import FullPageCall from './FullPageCall'

function index() {
  const [callStarted, setCallStarted] = React.useState(false)

  const startCall = () => {
    setCallStarted(true)
  }

  const endCall = () => {
    setCallStarted(false)
  }

  if (callStarted) {
    return (
      <div>
        <FullPageCall endCall={endCall} />
      </div>
    )
  }

  return (
    <Box sx={{ height: '100vh' }}>
      <Button variant='contained' color='primary' onClick={startCall}>
        Start Call
      </Button>
    </Box>
  )
}

export default index
