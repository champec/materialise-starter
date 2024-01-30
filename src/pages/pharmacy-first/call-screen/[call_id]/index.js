import React from 'react'
import { useRouter } from 'next/router'
import { supabase } from 'src/configs/supabase'
import dayjs from 'dayjs'
import VideoCallComponent from '../CallScreen'
import { Box, Drawer, IconButton, Button } from '@mui/material'
import BookingInfor from './BookingInfor'
import Notes from './Notes'
import PrescriptionWrite from './PrescriptionWrite'
import Scr from './Scr'
import { EditorState } from 'draft-js'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'
import NmsForm from 'src/pages/services/nms/NmsSidebar'
import DmsForm from 'src/pages/services/dms/DmsSidebar'
import { initialState } from 'src/views/apps/Calendar/services/nms/initState'
import ServiceFormSidebar from 'src/views/apps/Calendar/ServiceFormSidebar'

const videoScreenStyles = {
  width: '100%',
  height: '100vh',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
function index() {
  const router = useRouter()
  const { call_id } = router.query
  const [consultation, setConsultation] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [openBookingSidebar, setOpenBookingSidebar] = React.useState(false)
  const [openPrescriptionSidebar, setOpenPrescriptionSidebar] = React.useState(false)
  const [openScrSidebar, setOpenScrSidebar] = React.useState(false)
  const [openNotesSidebar, setOpenNotesSidebar] = React.useState(false)
  const [notesValue, setNotesValue] = React.useState(EditorState.createEmpty())
  const [prescription, setPrescription] = React.useState([])
  const [consultationState, setConsultationState] = React.useState(null)
  const videoContainerRef = React.useRef(null)
  const [openSnack, setOpenSnack] = React.useState(false)
  const [snackMessage, setSnackMessage] = React.useState('')
  const [snackSeverity, setSnackSeverity] = React.useState('success')
  const [serviceForm, setServiceForm] = React.useState(false)
  const [pendingPatientAcess, setPendingPatientAcess] = React.useState(false)

  const showMessages = (message, severity) => {
    setSnackMessage(message)
    setSnackSeverity(severity)
    setOpenSnack(true)
  }

  const updateNMSData = async () => {
    console.log({ nmsData })
    const { error } = await supabase.from('service_nms').update(nmsData).eq('consultation_id', id)
    if (error) {
      console.log(error)
      alert('Error updating NMS data')
    }
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
          setConsultationState(payload?.new?.patient_status)
        }
      )
      .subscribe()

    console.log('RESPONSE', response)
  }

  const fetchConsultation = async () => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*, calendar_events!calendar_events_booking_id_fkey(*)')
      .eq('id', call_id)
      .maybeSingle()
    if (error) {
      setError(error)
      setLoading(false)
    }
    if (data) {
      console.log('data', data)
      setConsultationState(data.patient_status)
      setConsultation(data)
      updateStatus('clinicianInRoom')
      setLoading(false)
    }

    if (!data && !error) {
      setError(new Error('The consultation either doesnt exists or is expired'))
      setLoading(false)
    }
  }

  const updateStatus = async status => {
    const { data, error } = await supabase.from('consultations').update({ clinician_status: status }).eq('id', call_id)
    // .single()

    if (error) {
      setError(error)
      console.log(error)
      showMessages(error.message, 'error')

      return
    }
    // if (data) {
    //   setConsultation({...consultation, ...data})
    //   setLoading(false)
    //   return
    // }
  }

  React.useEffect(() => {
    fetchConsultation()
    setupConsultationListener(call_id)

    return () => {
      // supabase.removeChannel('consultation')
      updateStatus(null)
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  console.log({ consultation })

  const {
    patient_object: patient,
    calendar_events: { start },
    hcp_token
  } = consultation
  const formattedDate = dayjs(start).format('DD/MM/YYYY HH:mm')
  console.log('consultation start', start)

  let url = consultation.url
  if (hcp_token) {
    url = `${url}?token=${hcp_token}`
  }

  const handleBookingButton = () => {
    setOpenBookingSidebar(prev => !prev)
  }

  const handleScrButton = () => {
    setOpenScrSidebar(prev => !prev)
  }

  const handlePrescriptionButton = () => {
    setOpenPrescriptionSidebar(prev => !prev)
  }

  const handleNotesButton = () => {
    setOpenNotesSidebar(prev => !prev)
  }

  const handleServiceButton = () => {
    console.log('service button clicked')
    setServiceForm(prev => !prev)
  }

  console.log('call screen index.js', typeof handleServiceButton)

  let statusMessage
  let allowPatientButton

  if (consultationState === 'patientInRoom') {
    statusMessage = 'Patient is waiting in the room.'
    allowPatientButton = !pendingPatientAcess ? (
      <Button
        onClick={e => {
          e.preventDefault()
          setPendingPatientAcess(true)
          updateStatus('patientAllowedIn')
        }}
      >
        Allow Patient In
      </Button>
    ) : (
      <Button
        onClick={e => {
          e.preventDefault()
          setPendingPatientAcess(false)
          updateStatus('clinicianInRoom')
        }}
      >
        Waiting For Patient, Click To Cancel
      </Button>
    )
  } else if (consultationState === 'patientLeftMeeting') {
    statusMessage = 'Patient has left the meeting.'
  } else if (consultationState === 'patientJoined') {
    statusMessage = 'Patient has joined the meeting.'
    allowPatientButton = null
  } else {
    statusMessage = 'Patient is not in the meeting.'
  }

  return (
    <div>
      <h1>Call Screen</h1>
      <h3>Patient: {patient.full_name}</h3>
      <h3>Start Date: {formattedDate}</h3>
      <h3>Status: {statusMessage}</h3>
      {allowPatientButton}
      <div ref={videoContainerRef} style={videoScreenStyles}>
        <VideoCallComponent
          url={url}
          containerRef={videoContainerRef}
          handleBookingButton={handleBookingButton}
          handleScrButton={handleScrButton}
          handlePrescriptionButton={handlePrescriptionButton}
          handleNotesButton={handleNotesButton}
          handleServiceButton={() => console.log('service button clicked')}
          test={'test'}
        />
      </div>
      <Drawer anchor='right' open={openBookingSidebar} onClose={() => setOpenBookingSidebar(false)} hideBackdrop={true}>
        <Box sx={{ width: 300, paddingTop: 1, paddingRight: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Close Button */}
          <IconButton onClick={() => setOpenBookingSidebar(false)}>{/* <CloseIcon /> */}X</IconButton>
        </Box>
        <BookingInfor booking={consultation} />
      </Drawer>
      <Drawer anchor='right' open={openPrescriptionSidebar} onClose={() => setOpenPrescriptionSidebar(false)}>
        <Box sx={{ width: 300 }}>
          <PrescriptionWrite booking={consultation} prescription={prescription} setPrescription={setPrescription} />
        </Box>
      </Drawer>
      <Drawer anchor='right' open={openScrSidebar} onClose={() => setOpenScrSidebar(false)}>
        <Box sx={{ width: 300 }}>
          <Scr booking={consultation} />
        </Box>
      </Drawer>
      <Drawer anchor='right' open={openNotesSidebar} onClose={() => setOpenNotesSidebar(false)}>
        <Box sx={{ width: 400 }}>
          <Notes booking={consultation} value={notesValue} setValue={setNotesValue} EditorState={EditorState} />
        </Box>
      </Drawer>
      <CustomSnackbar
        message={snackMessage}
        open={openSnack}
        setOpen={setOpenSnack}
        severity={snackSeverity}
        horizontal={'center'}
        vertical={'top'}
        duration={3000}
      />
      <Drawer anchor='right' open={serviceForm} onClose={() => setServiceForm(false)}>
        <Box sx={{ width: 400 }}>
          {/* <NmsForm
            state={nmsData}
            setState={setNmsData}
            booking={consultation}
            value={notesValue}
            setValue={setNotesValue}
            EditorState={EditorState}
            onSubmit={updateNMSData}
          /> */}
          <ServiceFormSidebar />
        </Box>
      </Drawer>
    </div>
  )
}

export default index
