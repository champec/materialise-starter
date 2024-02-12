import React from 'react'
import { useRouter } from 'next/router'
import { supabase } from 'src/configs/supabase'
import dayjs from 'dayjs'
import VideoCallComponent from '../CallScreen'
import { Box, Drawer, IconButton } from '@mui/material'
import BookingInfor from './BookingInfor'
import Notes from './Notes'
import PrescriptionWrite from './PrescriptionWrite'
import Scr from './Scr'
import { EditorState } from 'draft-js'

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
  const videoContainerRef = React.useRef(null)

  const fetchConsultation = async () => {
    const { data, error } = await supabase.from('consultations').select('*').eq('id', call_id).single()
    if (error) {
      setError(error)
      setLoading(false)
    }
    if (data) {
      setConsultation(data)
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchConsultation()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  console.log({ consultation })

  const { patient_object: patient, start_date, hcp_token } = consultation
  const formattedDate = dayjs(start_date).format('DD/MM/YYYY HH:mm')

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

  return (
    <div>
      <h1>Call Screen</h1>
      <h3>Patient: {patient.full_name}</h3>
      <h3>Start Date: {formattedDate}</h3>
      <div ref={videoContainerRef} style={videoScreenStyles}>
        <VideoCallComponent
          url={url}
          containerRef={videoContainerRef}
          handleBookingButton={handleBookingButton}
          handleScrButton={handleScrButton}
          handlePrescriptionButton={handlePrescriptionButton}
          handleNotesButton={handleNotesButton}
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
      <Drawer   anchor='right' open={openScrSidebar} onClose={() => setOpenScrSidebar(false)}>
        <Box sx={{ width: 600 }}>
          <Scr booking={consultation} />
        </Box>
      </Drawer>
      <Drawer anchor='right' open={openNotesSidebar} onClose={() => setOpenNotesSidebar(false)}>
        <Box sx={{ width: 400 }}>
          <Notes booking={consultation} value={notesValue} setValue={setNotesValue} EditorState={EditorState} />
        </Box>
      </Drawer>
    </div>
  )
}

export default index
