import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'

// decision trees
import { DecisionTrees } from '../../pharmacy-first-vf/pathway-forms/DecisionTrees'

// service Views
import NmsBox from 'src/pages/services/nms/NmsBox'
import FluBox from '../../flu-vf/FluBox'
import HtnBox from '../../htn/HtnBox'
import DmsBox from '../../dms-vf/DmsBox'
import PfsBox from '../../pharmacy-first-vf/PfsBox'
import NodeSummary from './NodeSummary'

const getServiceView = (serviceTable, serviceInfo) => {
  switch (serviceTable) {
    case 'service_nms':
      return <NmsBox nmsData={serviceInfo} />
    case 'service_flu':
      return <FluBox />
    case 'service_htn':
      return <HtnBox />
    case 'service_dms':
      return <DmsBox />
    case 'service_pfs':
      return <PfsBox />
    default:
      return <div>No service view available</div>
  }
}

const PreviewCardBooking = ({ booking, serviceTable }) => {
  const eventDateTime = booking.calendar_events?.start
  const formattedDate = eventDateTime ? dayjs(booking.calendar_events?.start).format('D MMM YYYY [at] HH:mm') : 'N/A'
  const patientDOB = dayjs(booking.patient_object.dob).format('D MMM YYYY')
  const selectedBooking = useSelector(state => state.appointmentListSlice.selectedBooking)
  const serviceInfo = selectedBooking ? selectedBooking[serviceTable] : null
  // const service_table = booking.service_table
  // const serviceInfo = booking.service_info
  console.log('selectedBooking', selectedBooking)

  const nodeStates = serviceInfo?.pathwayform || {}
  const pathway = serviceInfo?.clinical_pathway

  console.log('service view', serviceTable, serviceInfo, nodeStates)

  const renderSummaryNode = node => (
    <Box>
      <Typography variant='h6'>Summary of Decisions and Actions</Typography>
      <List>
        {Object.keys(nodeStates).map(nodeId => {
          const node = DecisionTrees[pathway]?.nodes[nodeId];
          const state = nodeStates[nodeId];
          if (!node) {
            return (
              <ListItem key={nodeId}>
                <ListItemText primary='No Summary Available' />
              </ListItem>
            );
          }
          if (node.type === 'stop' && state.treatAnyway) {
            return (
              <ListItem key={nodeId}>
                <ListItemText primary='Decision: Treat Anyway despite recommendations' />
              </ListItem>
            );
          }
          return (
            <ListItem key={nodeId}>
              {/* Use NodeSummary component instead of generateSummaryText function */}
              <ListItemText primary={node.content} secondary={<NodeSummary node={node} state={state} />} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const generateSummaryText = (node, state) => {
    let summaryText = ''
    if (node.type === 'component' && node.componentType === 'criteriaChecklist') {
      const decisions = Object.keys(state.checkedCriteria || {})
        .map(criterion => criterion)
        .join(', ')
      summaryText += decisions ? `Selected Criteria: ${decisions}` : 'No Criteria Selected'
    }

    if (node.type === 'symptoms') {
      const symptomsSummary = nodeStates[node.id]?.selectedSymptoms?.length
        ? `Symptoms Reported: ${nodeStates[node.id].selectedSymptoms.join(', ')}`
        : 'No Symptoms Reported'
      // Use the node's content or a generic term for the decision summary
      const decisionSummary = nodeStates[node.id]?.decision
        ? `Decision: '${nodeStates[node.id].decision}' for '${node.content}'`
        : `Decision for '${node.content}': Not Made`
      summaryText += `${symptomsSummary}; ${decisionSummary}`
    } else if (node.type === 'gateway' && state.acknowledged) {
      summaryText += `Acknowledged Gateway: ${node.content}`
    } else if (node.type === 'advice') {
      summaryText += `Advice Decision: ${state.decision}`
    } else if (node.type === 'stop') {
      summaryText += `Stop Decision: ${state.decision}`
    } else if (node.type === 'question') {
      summaryText += `Question: ${node.content}, Answer: ${state.answer}`
    } else if (node.type === 'plan') {
      summaryText += `Plan for Patient: ${state.planText || 'No plan specified'}`
    } else if (node.type === 'treatment') {
      const treatmentNames =
        state.selectedTreatments?.map(id => node.treatments.find(t => t.id === id)?.name).filter(name => name) || []
      const treatmentsText =
        treatmentNames.length > 0 ? `Selected Treatments: ${treatmentNames.join(', ')}` : 'No Treatments Selected'

      const actionsText = state.actionsTaken
        ? Object.keys(state.actionsTaken)
            .filter(actionId => state.actionsTaken[actionId])
            .map(actionId => node.actions.find(a => a.id === actionId)?.label)
            .join(', ')
        : 'No Additional Actions Taken'

      const commentsText = state.additionalComments
        ? `Additional Comments: ${state.additionalComments}`
        : 'No Additional Comments'

      summaryText += `${treatmentsText}; ${actionsText}; ${commentsText}`
    } else if (node.type === 'referral') {
      summaryText += `Referral Decision: ${state.decision || 'No decision made'}`
    }
    if (node.type === 'multiple_choice_question') {
      const selectedOption = nodeStates[node.id]?.selectedOption || 'No option selected'
      summaryText += `${node.content}: ${selectedOption}`
    }

    return summaryText
  }

  return (
    <Box>
      <Card raised sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Booking Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant='body1'>
                <b>Patient Name:</b> {booking.patient_object.full_name}
              </Typography>
              <Typography variant='body1'>
                <b>Date of Birth:</b> {patientDOB}
              </Typography>
              <Typography variant='body1'>
                <b>Contact:</b> {booking.patient_object.email}
              </Typography>
              <Typography variant='body1'>
                <b>Address:</b> {`${booking.patient_object.house_number}, ${booking.patient_object.address}`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='body1'>
                <b>Appointment Time:</b> {formattedDate}
              </Typography>
              <Typography variant='body1'>
                <b>Pharmacist:</b> {booking.pharmacist_object.full_name}
              </Typography>
              <Typography variant='body1'>
                <b>Clinical Pathway:</b> {booking.clinical_pathway}
              </Typography>
              <Typography variant='body1'>
                <b>Presenting Complaint:</b> {booking.presenting_complaint}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card raised sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Service Details
          </Typography>
          {/* {getServiceView(serviceTable, serviceInfo)} */}
          {serviceInfo && renderSummaryNode(serviceInfo)}
        </CardContent>
      </Card>
    </Box>
  )
}

export default PreviewCardBooking
