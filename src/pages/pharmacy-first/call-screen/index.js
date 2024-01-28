import React from 'react'
import CallScreen from './CallScreen'
import { Box, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import FullPageCall from './FullPageCall'
import { supabase } from 'src/configs/supabase'
import { useSelector } from 'react-redux'

function index() {
  const [callStarted, setCallStarted] = React.useState(false)
  const [nextCall, setNextCall] = React.useState([{ id: 1, patient: 'John Doe', appointmentDate: '2021-10-10' }])
  const orgId = useSelector(state => state.organisation.organisation.id)

  const startCall = () => {
    setCallStarted(true)
  }

  const fetchNextOrganisationCall = async () => {
    //fetch the most recent consultation where pharmacy_id is orgId and limit to 1 and status = 1
    const { data, error } = await supabase
      .from('consultations')
      .select('*, calendar_events(start)')
      .eq('pharmacy_id', orgId)
      .eq('status', 1)
      .limit(2)

    if (error) {
      console.log(error)
      return
    }

    console.log('next call', data, error, orgId)
    setNextCall(data)
    // const { data, error } = supabase.from('consultations').select('*').eq().limit(1)
  }

  React.useEffect(() => {
    fetchNextOrganisationCall()
  }, [])

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
      {nextCall.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Appointment Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nextCall.map((call, index) => (
                <TableRow key={call.id}>
                  <TableCell>{`${index + 1}. ${call.patient}`}</TableCell>
                  <TableCell>{call.appointmentDate}</TableCell>
                  <TableCell>{}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Button variant='contained' color='primary' onClick={startCall}>
        Start Call
      </Button>
    </Box>
  )
}

export default index
