import React from 'react'
import { useRouter } from 'next/router'
import { supabase } from 'src/configs/supabase'
import dayjs from 'dayjs'
import VideoCallComponent from 'src/pages/pharmacy-first/call-screen/CallScreen'
import { Box, Drawer, IconButton } from '@mui/material'
import BookingInfor from 'src/pages/pharmacy-first/call-screen/[call_id]/BookingInfor'
import Notes from 'src/pages/pharmacy-first/call-screen/[call_id]/Notes'
import PrescriptionWrite from 'src/pages/pharmacy-first/call-screen/[call_id]/PrescriptionWrite'
import Scr from 'src/pages/pharmacy-first/call-screen/[call_id]/Scr'
import { EditorState } from 'draft-js'
import NmsSidebar from '../../nms/NmsSidebar'
import DmsForm from '../../dms/DmsSidebar'
import { initialState } from '../../nms/initState'

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
  const { id } = router.query
  const [consultation, setConsultation] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [openBookingSidebar, setOpenBookingSidebar] = React.useState(false)
  const [openPrescriptionSidebar, setOpenPrescriptionSidebar] = React.useState(false)
  const [openScrSidebar, setOpenScrSidebar] = React.useState(false)
  const [openNotesSidebar, setOpenNotesSidebar] = React.useState(false)
  const [notesValue, setNotesValue] = React.useState(EditorState.createEmpty())
  const [prescription, setPrescription] = React.useState([])
  const [nms, setNms] = React.useState(false)
  const [dms, setDms] = React.useState(false)
  const [nmsData, setNmsData] = React.useState(initialState)
  const [dmsData, setDmsData] = React.useState(initialState)
  const videoContainerRef = React.useRef(null)

  const updateNMSData = async () => {
    console.log({ nmsData })
    const { error } = await supabase.from('service_nms').update(nmsData).eq('consultation_id', id)
    if (error) {
      console.log(error)
      alert('Error updating NMS data')
    }
  }
  const fetchConsultation = async () => {
    const { data, error } = await supabase.from('consultations').select('*').eq('id', id).single()
    console.log({ data, error })
    if (error) {
      setError(error)
      setLoading(false)
    }
    if (data) {
      setConsultation(data)
      setLoading(false)
    }

    if (!data && !error) {
      setError({ message: 'No data found' })
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (id) {
      fetchConsultation()
    }
    console.log({ id })
  }, [id])

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

  const handleNmsButton = () => {
    setNms(prev => !prev)
  }

  const handleDmsButton = () => {
    setDms(prev => !prev)
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
          handleNmsButton={handleNmsButton}
          handleDmsButton={handleDmsButton}
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
      <Drawer anchor='right' open={nms} onClose={() => setNms(false)}>
        <Box sx={{ width: 400 }}>
          <NmsSidebar
            state={nmsData}
            setState={setNmsData}
            booking={consultation}
            value={notesValue}
            setValue={setNotesValue}
            EditorState={EditorState}
            onSubmit={updateNMSData}
          />
        </Box>
      </Drawer>
      <Drawer anchor='right' open={dms} onClose={() => setDms(false)}>
        <Box sx={{ width: 400 }}>
          <DmsForm
            state={dmsData}
            setState={setDmsData}
            booking={consultation}
            value={notesValue}
            setValue={setNotesValue}
            EditorState={EditorState}
            onSubmit={updateNMSData}
          />
        </Box>
      </Drawer>
    </div>
  )
}

export default index
