// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import axios from 'axios'

// ** Demo Components Imports
import PreviewCard from 'src/views/apps/invoice/preview/PreviewCard'
import PreviewActions from 'src/views/apps/invoice/preview/PreviewActions'
import AddPaymentDrawer from 'src/views/apps/invoice/shared-drawer/AddPaymentDrawer'
import SendInvoiceDrawer from 'src/views/apps/invoice/shared-drawer/SendInvoiceDrawer'
import PreviewCardBooking from './PreviewCardBooking'
import AppointMentChat from './AppointmentChat'
const AppointmentView = ({
  appointment,
  toggleBookingSideBar,
  zIndex,
  toggleServiceFormSideBar,
  serviceTable,
  serviceInfo
}) => {
  // ** State
  const [error, setError] = useState(false)
  const [data, setData] = useState(null)
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)
  const [sendInvoiceOpen, setSendInvoiceOpen] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const toggleSendInvoiceDrawer = () => setSendInvoiceOpen(!sendInvoiceOpen)
  const toggleAddPaymentDrawer = () => setAddPaymentOpen(!addPaymentOpen)
  const toggleShowChat = () => setShowChat(!showChat)

  if (appointment) {
    return (
      <>
        <Grid container spacing={6}>
          <Grid item xl={9} md={8} xs={12}>
            {showChat ? (
              <AppointMentChat appointment={appointment} />
            ) : (
              <PreviewCardBooking serviceTable={serviceTable} serviceInfo={serviceInfo} booking={appointment} />
            )}
          </Grid>
          <Grid item xl={3} md={4} xs={12}>
            <Card>
              <CardContent>
                <Button
                  fullWidth
                  sx={{ mb: 3.5 }}
                  variant='contained'
                  onClick={toggleShowChat}
                  startIcon={<Icon icon={showChat ? 'akar-icons:schedule' : 'mdi:send-outline'} />}
                >
                  {showChat ? 'SHOW BOOKING' : 'SEND MESSAGE'}
                </Button>
                <Button fullWidth sx={{ mb: 3.5 }} color='secondary' variant='outlined'>
                  Starting in
                </Button>
                <Button
                  fullWidth
                  target='_blank'
                  sx={{ mb: 3.5 }}
                  // component={Link}
                  color='secondary'
                  variant='outlined'
                  onClick={toggleBookingSideBar}
                >
                  Edit Appointment
                </Button>
                <Button
                  fullWidth
                  sx={{ mb: 3.5 }}
                  color='secondary'
                  variant='outlined'
                  onClick={toggleServiceFormSideBar}
                >
                  Edit Service
                </Button>
                <Link href={`call-screen/${appointment.id}`}>
                  <Button
                    fullWidth
                    color='success'
                    variant='contained'
                    onClick={toggleAddPaymentDrawer}
                    startIcon={<Icon icon='mdi:video' />}
                  >
                    Go To Call
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <SendInvoiceDrawer open={sendInvoiceOpen} toggle={toggleSendInvoiceDrawer} />
        <AddPaymentDrawer open={addPaymentOpen} toggle={toggleAddPaymentDrawer} />
      </>
    )
  } else if (error) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert severity='error'>
            Booking with the id: {appointment?.id} does not exist. Please check the list of bookings:{' '}
            <Link href='/apps/invoice/list'>Invoice List</Link>
          </Alert>
        </Grid>
      </Grid>
    )
  } else {
    return null
  }
}

export default AppointmentView
