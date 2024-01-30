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
import { initialState } from '../../../../views/apps/Calendar/services/nms/initState'
import ServiceFormSidebar from 'src/views/apps/Calendar/ServiceFormSidebar'
import withReducer from 'src/@core/HOC/withReducer'
import appointmentListSlice from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import bookingsCalendarSlice from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import services from 'src/store/apps/services'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'

// Redux
import { setSelectedBooking } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { setSelectedService } from 'src/store/apps/services'
import { useDispatch } from 'react-redux'

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
  const [serviceForm, setServiceForm] = React.useState(false)
  const [serviceInfo, setServiceInfo] = React.useState({})
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState('')
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success')
  // const [serviceType, setServiceType] = React.useState(null)
  const [serviceTable, setServiceTable] = React.useState(null)
  const videoContainerRef = React.useRef(null)
  const dispatch = useDispatch()

  const showMessage = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  // const updateNMSData = async () => {
  //   console.log({ nmsData })
  //   const { error } = await supabase.from('service_nms').update(nmsData).eq('consultation_id', id)
  //   if (error) {
  //     console.log(error)
  //     alert('Error updating NMS data')
  //   }
  // }
  const fetchConsultation = async () => {
    const { data, error } = await supabase.from('consultations').select('*, service_id(table)').eq('id', id).single()
    console.log({ data, error })
    if (error) {
      setError(error)
      showMessage(error.message, 'error')
      setLoading(false)
    }
    if (data) {
      setConsultation(data)
      dispatch(setSelectedBooking(data))
      console.log('Call screen consultaiton data', data)
      if (data.service_id?.table) {
        console.log('service table', data.service_id?.table)
        setServiceTable(data.service_id?.table)
        // fetch the data from the service table matching the consultation id
        dispatch(setSelectedService(data.service_id?.table))
        const { data: serviceData, error: serviceError } = await supabase
          .from(data.service_id?.table)
          .select('*')
          .eq('consultation_id', id)
          .single()

        if (serviceError) {
          console.log(serviceError)
          setError(serviceError)
          setLoading(false)
          showMessage(serviceError.message, 'error')
          return
        }

        if (serviceData) {
          console.log('service data', serviceData)
          setConsultation(prev => ({ ...prev, [data.service_id?.table]: serviceData }))
          dispatch(setSelectedBooking({ ...data, [data.service_id?.table]: serviceData }))
          setLoading(false)
          return
        }
      }
      setLoading(false)
    }

    if (!data && !error) {
      setError({ message: 'No data found' })
      setLoading(false)
    }
  }

  console.log('FINAL CONSULTATION', consultation)

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

  const toggleServiceForm = () => {
    setServiceForm(prev => !prev)
  }

  const handlePrescriptionButton = () => {
    setOpenPrescriptionSidebar(prev => !prev)
  }

  const handleNotesButton = () => {
    setOpenNotesSidebar(prev => !prev)
  }

  const handleServiceButton = () => {
    setServiceForm(prev => !prev)
  }

  const hideBackdrop = {
    slotProps: {
      backdrop: {
        style: {
          backgroundColor: 'transparent'
        }
      }
    }
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
          handleServiceButton={handleServiceButton}
        />
      </div>
      <Drawer
        anchor='right'
        open={openBookingSidebar}
        onClose={() => setOpenBookingSidebar(false)}
        ModalProps={hideBackdrop}
      >
        <Box sx={{ width: 300, paddingTop: 1, paddingRight: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Close Button */}
          <IconButton onClick={() => setOpenBookingSidebar(false)}>{/* <CloseIcon /> */}X</IconButton>
        </Box>
        <BookingInfor booking={consultation} />
      </Drawer>
      <Drawer
        anchor='right'
        open={openPrescriptionSidebar}
        onClose={() => setOpenPrescriptionSidebar(false)}
        ModalProps={hideBackdrop}
      >
        <Box sx={{ width: 300 }}>
          <PrescriptionWrite booking={consultation} prescription={prescription} setPrescription={setPrescription} />
        </Box>
      </Drawer>
      <Drawer anchor='right' open={openScrSidebar} onClose={() => setOpenScrSidebar(false)} ModalProps={hideBackdrop}>
        <Box sx={{ width: 300 }}>
          <Scr booking={consultation} />
        </Box>
      </Drawer>
      <Drawer
        anchor='right'
        open={openNotesSidebar}
        onClose={() => setOpenNotesSidebar(false)}
        ModalProps={hideBackdrop}
      >
        <Box sx={{ width: 400 }}>
          <Notes booking={consultation} value={notesValue} setValue={setNotesValue} EditorState={EditorState} />
        </Box>
      </Drawer>

      <ServiceFormSidebar
        serviceFormSidebarOpen={serviceForm}
        handleServiceFormSidebarToggle={toggleServiceForm}
        serviceTable={serviceTable}
        dispatch={dispatch}
        drawerWidth={400}
        hideBackdrop={hideBackdrop}
      />

      <CustomSnackbar
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        vertical={'top'}
        horizontal={'center'}
      />
    </div>
  )
}

export default withReducer({
  appointmentListSlice: appointmentListSlice,
  bookingsCalendar: bookingsCalendarSlice,
  services: services
})(index)
