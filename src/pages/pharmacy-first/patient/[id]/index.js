import React, { useRef, useState } from 'react'
import { useRouter } from 'next/router'
import PatientCallScreen from '../../call-screen/PatientCallScreen'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { supabase } from 'src/configs/supabase'
import { TextField, Button, CircularProgress, Box, Typography } from '@mui/material'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'

function PatientCall() {
  const router = useRouter()
  const { id } = router.query || {}
  const containerRef = useRef()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [consultation, setConsultation] = useState(null)
  const [consultationState, setConsultationState] = useState(null)
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

  const setupConsultationListener = async consultationId => {
    // filter: `or.organisation_id=eq${orgId}, user_id=eq${userId} `
    const response = await supabase
      .channel('consultation')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations',
          filter: `id=eq.${consultationId}`
        },
        payload => {
          console.log('New status update:', payload)
          setConsultationState(payload.clinician_status)
        }
      )
      .subscribe()

    console.log('RESPONSE', response)
  }

  const fetchConsultation = async () => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*, calendar_events!calendar_events_booking_id_fkey(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      setError(error)
      console.log(error)
      showMessages(error.message, 'error')
      setLoading(false)
    }
    if (data) {
      console.log(data?.calendar_events)
      setConsultation(data)
      setConsultationState(data.clinician_status)
      setLoading(false)
    }
    if (!data && !error) {
      setLoading(false)
      setError(new Error('No consultation found with provided link'))
    }
  }

  React.useEffect(() => {
    if (!id) {
      console.log('No id', id)
      return
    }
    fetchConsultation()
    setupConsultationListener(id)
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>An error has occured {error.message}</div>
  }

  const updateStatus = async status => {
    setLoading(true)
    const { data, error } = await supabase
      .from('consultations')
      .update({ patient_status: status })
      .eq('id', id)
      .single()

    if (error) {
      setError(error)
      console.log(error)
      showMessages(error.message, 'error')
      setLoading(false)
      return
    }
    if (data) {
      setConsultation(...consultation, data)
      setLoading(false)
      return
    }
    setLoading(false)
  }

  const handleNameSubmit = () => {
    // Retrieve and format the patient's first name from the data
    const expectedName = consultation?.patient_object?.first_name?.toLowerCase().replace(/\s/g, '')

    // Format the entered patient name
    const enteredName = patientName.toLowerCase().replace(/\s/g, '')

    if (enteredName === expectedName) {
      // update the consultation patient status to 'ready'
      updateStatus('patientInRoom')
      setNameVerified(true)
    } else {
      showMessages("That's not the name we are expecting here in this meeting.", 'error')
    }
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
  let url = consultation?.url
  if (consultation?.patient_token) {
    url = `${url}?token=${consultation?.patient_token}`
  }

  console.log({ url })
  let content
  if (consultationState !== 'clinicianInRoom') {
    content = (
      <Typography>Your meeting is at {consultation?.calendar_events?.start} - No clinician in the room yet.</Typography>
    )
  } else if (consultationState === 'clinicianInRoom') {
    content = <Typography>Your clinician knows you are here and will let you in soon.</Typography>
  } else if (consultationState === 'ready') {
    let url = consultation?.url
    if (consultation?.patient_token) {
      url = `${url}?token=${consultation?.patient_token}`
    }
    content = (
      <Box sx={{ height: '100vh' }}>
        <Typography variant='h4'>Video Call</Typography>
        <PatientCallScreen url={url} containerRef={containerRef} />
      </Box>
    )
  }

  console.log('CONTENT', content)

  return (
    <Box ref={containerRef} sx={{ height: '100vh' }}>
      {content}
    </Box>
  )
}

PatientCall.getLayout = page => <BlankLayout>{page}</BlankLayout>
PatientCall.authGuard = false
PatientCall.orgGuard = false

export default PatientCall
