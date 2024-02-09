import React from 'react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import InvoicePrint from '../../../views/apps/invoice/print/PrintPage'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { supabase } from 'src/configs/supabase'
import { Card, CardContent, Typography, Grid, Divider, Paper, List, ListItem, ListItemText } from '@mui/material';
import NodeSummary from 'src/views/apps/Calendar/services/commonformelements/AppointmentListComponents/NodeSummary'

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
            {/* {appointment.service_pfs.pathwayform && Object.entries(appointment.service_pfs.pathwayform).map(([key, formSection]) => (
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
            ))} */}
            {/* {appointment.service_pfs.pathwayform && Object.entries(appointment.service_pfs.pathwayform).map(([key, formSection]) => (
              <div key={key}>
                {renderNode(formSection)}
                <Divider sx={{ my: 1 }} />
              </div>
            ))} */}
            {appointment.service_pfs.pathwayform && Object.entries(appointment.service_pfs.pathwayform).map(([nodeId, nodeData]) => (
  <div key={nodeId}>
    {/* Assuming nodeData includes both node details and state information */}
    {renderNode(nodeData, nodeData)}  
    <Divider sx={{ my: 1 }} />
  </div>
))}

          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}


function renderNode(node, state) {
  return <NodeSummary node={node} state={state} />;
  // console.log('PRINT PAGE NODE', node)
  // switch (node.type) {
  //   case 'multiple_choice_question':
  //     return renderMultipleChoiceQuestion(node);
  //   case 'criteriaCheck':
  //     return renderCriteriaCheck(node);
  //   case 'countBased':
  //     return renderCountBased(node);
  //   case 'symptoms':
  //     return renderSymptoms(node);
  //   case 'emergency_referral':
  //     return renderEmergencyReferral(node);
  //   case 'treatment_decision':
  //     return renderTreatmentDecision(node);
  //   // Add more cases as needed
  //   default:
  //     return <div>Unsupported node type: {node.type}</div>;
  // }
}

function renderCountBased(node) {
  return (
    <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h6">{node.title}</Typography>
      <Typography variant="body1">{node.content}</Typography>
      <List>
        {node.questions.map((question, index) => (
          <ListItem key={index}>
            <ListItemText primary={`${question.text}: ${question.response}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

function renderSymptoms(node) {
  return (
    <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h6">{node.title}</Typography>
      <List>
        {node.symptoms.map((symptom, index) => (
          <ListItem key={index}>
            <ListItemText primary={`${symptom.text}: ${symptom.response}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

function renderEmergencyReferral(node) {
  return (
    <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h6">Emergency Referral Decision</Typography>
      <Typography variant="body1">{node.decision}</Typography>
    </Paper>
  );
}

function renderTreatmentDecision(node) {
  return (
    <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h6">Treatment Decision</Typography>
      <Typography variant="body1">Actions taken:</Typography>
      <List>
        {Object.entries(node.actionsTaken).map(([action, taken], index) => (
          <ListItem key={index}>
            <ListItemText primary={`${action}: ${taken ? 'Yes' : 'No'}`} />
          </ListItem>
        ))}
      </List>
      <Typography variant="body1">Additional Comments:</Typography>
      <Typography variant="body2">{node.additionalComments}</Typography>
      <Typography variant="body1">Selected Treatments:</Typography>
      <List>
        {node.selectedTreatments.map((treatment, index) => (
          <ListItem key={index}>
            <ListItemText primary={treatment} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

function renderMultipleChoiceQuestion(node) {
  return (
    <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h6">{node.title}</Typography>
      <Typography variant="body1">{node.content}</Typography>
      <List>
        {node.options && node.options.map((option, index) => (
          <ListItem key={index} style={{ backgroundColor: option === node.selectedOption ? '#f0f0f0' : 'transparent' }}>
            <ListItemText primary={option} />
          </ListItem>
        ))}
      </List>
      {node.selectedOption && (
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          Selected Option: {node.selectedOption}
        </Typography>
      )}
    </Paper>
  );
}

function renderCriteriaCheck(node) {
  return (
    <div>
      <Typography variant="subtitle1">{node.title}</Typography>
      {node.criteria.map((criterion, index) => (
        <Typography key={index} variant="body2">
          - {criterion.text}: {criterion.response}
        </Typography>
      ))}
    </div>
  );
}
