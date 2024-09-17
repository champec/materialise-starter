import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import PatientCallScreen from '../../call-screen/PatientCallScreen'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { supabase } from 'src/configs/supabase'
import { TextField, Button, CircularProgress, Box, Typography } from '@mui/material'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'
import dayjs from 'dayjs'

const advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)

function PatientCall() {
  const router = useRouter()
  const { id } = router.query || {}
  const containerRef = useRef()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [consultation, setConsultation] = useState(null)

  const [patientName, setPatientName] = useState('')
  const [nameVerified, setNameVerified] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('success')

  const showMessages = (message, severity) => {
    setSnackMessage(message)
    setSnackSeverity(severity)
    setOpenSnack(true)
  }

  const fetchConsultation = async () => {
    const { data, error } = await supabase.from('ps_appointments').select('*').eq('id', id).maybeSingle()

    if (error) {
      setError({
        message: `'The link provided doesn't matched with any consultation, please contact the booking pharmacy in your text alert',
        'error'`
      })
      console.log(error)
      showMessages(
        'The link provided isnt matched with any consultation, please contact the booking pharmacy in your text alert',
        'error'
      )
      setLoading(false)
    }
    if (data) {
      // console.log('patient call initial fetch data', data)
      console.log('patient call initial fetch data', data.clinician_status)
      setConsultation(data)
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (!id) {
      console.log('No id', id)
    } else {
      fetchConsultation()
    }
  }, [id])

  const handleNameSubmit = () => {
    // Retrieve and format the patient's first name from the data
    const expectedName = consultation?.patient_object?.first_name?.toLowerCase().replace(/\s/g, '')

    // Format the entered patient name
    const enteredName = patientName.toLowerCase().replace(/\s/g, '')

    if (enteredName === expectedName) {
      // update the consultation patient status to 'ready'

      setNameVerified(true)

      console.log('Consultation State', consultation?.status)
      // check if the current consultation state is 3 update to 5 else update to 4
    } else {
      showMessages("That's not the name we are expecting here in this meeting.", 'error')
    }
  }

  const joinedMeeting = () => {
    console.log('Patient joined meeting')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>An error has occured {error.message}</div>
  }

  if (!nameVerified) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant='h5'>Enter your name to join the meeting</Typography>
        <TextField
          autoComplete='off'
          type='search'
          label='Name'
          variant='outlined'
          value={patientName}
          onChange={e => setPatientName(e.target.value)}
        />
        <Button variant='contained' color='primary' onClick={handleNameSubmit}>
          Submit
        </Button>
        <CustomSnackbar
          message={snackMessage}
          open={openSnack}
          setOpen={setOpenSnack}
          severity={snackSeverity}
          horizontal={'center'}
          vertical={'top'}
          duration={10000}
        />
      </Box>
    )
  }

  console.log({ consultation })
  let url = consultation?.remote_details?.url
  if (consultation?.remote_details?.patient_token) {
    url = `${url}?token=${consultation?.patient_token}`
  }

  console.log({ url })
  //! appointment is toda
  const appointmentIsToday = true
  let content

  if (!consultation) {
    content = <Typography>No consultation found with given link please contact booking pharmacy.</Typography>
  } else if (appointmentIsToday) {
    // Directly render PatientCallScreen when conditions are met
    content = (
      <div ref={containerRef} sx={{ height: '600px' }}>
        {/* <Typography variant='h4'>Video Call O</Typography> */}
        <PatientCallScreen joinedMeeting={joinedMeeting} url={url} containerRef={containerRef} />
      </div>
    )
  } else if (!appointmentIsToday) {
    content = (
      <Typography>
        Your meeting is on {dayjs(consultation?.calendar_events?.start).format('Do MMM YYYY hh:mm A')} - No clinician in
        the room yet.
      </Typography>
    )
  }

  console.log('CONTENT', content)

  return <Box>{content}</Box>
}

PatientCall.getLayout = page => <BlankLayout>{page}</BlankLayout>
PatientCall.authGuard = false
PatientCall.orgGuard = false

export default PatientCall
