import React from 'react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import InvoicePrint from '../../../views/apps/invoice/print/PrintPage'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { supabase } from 'src/configs/supabase'
import { Card, CardContent, Typography, Grid, Divider } from '@mui/material';


function Printpage() {
  const router = useRouter()
  const { id, table } = router.query
  console.log(id, table)

  const [error, setError] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`*, calendar_events!calendar_events_booking_id_fkey(*), ${table}(*)`)
        .eq('id', id) // make sure this matches the variable you intend to use
        .maybeSingle()

      if (error) {
        setError(error)
        console.error('error', error)
      } else if (data) {
        console.log('data', data)
        setData(data) // assuming you want to store the fetched data
        // Your additional state updates and logic here
      } else {
        setError(new Error('The consultation either doesn\'t exist or is expired'))
      }
    } catch (error) {
      setError(true)
      console.error('error', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && table) { // Ensure id and table are not undefined
      fetchData()
    }
  }, [id, table])

  useEffect(() => {
    if (!loading && !error) {
      window.print()
    }
  }, [loading, error])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <AppointmentDetails appointment={data} />
    </div>
  )
}

Printpage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default Printpage



function AppointmentDetails({ appointment }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              Appointment Information
            </Typography>
            <Typography color="text.secondary">
              {appointment.patient_object.full_name} - {appointment.clinical_pathway}
            </Typography>
            <Typography variant="body2">
              Date: {new Date(appointment.created_at).toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              Time: {new Date(appointment.created_at).toLocaleTimeString()}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="h6">
              Service Details
            </Typography>
            {appointment.service_pfs.pathwayform && Object.entries(appointment.service_pfs.pathwayform).map(([key, formSection]) => (
              <div key={key}>
                <Typography variant="subtitle1">{formSection.title || key.replace(/_/g, ' ')}</Typography>
                {formSection.content && <Typography variant="body2">{formSection.content}</Typography>}
                {formSection.questions && formSection.questions.map((question, index) => (
                  <Typography key={index} variant="body2">
                    - {question.text}: {question.response}
                  </Typography>
                ))}
                <Divider sx={{ my: 1 }} />
              </div>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

