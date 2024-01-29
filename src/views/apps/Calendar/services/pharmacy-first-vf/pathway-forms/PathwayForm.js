import React, { useState, useEffect } from 'react'
import { DecisionTrees, acuteOtitisMediaDecisionTree } from './DecisionTrees'
import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  CardHeader,
  Card,
  CardContent,
  CardActions
} from '@mui/material'
import IconifyIcon from 'src/@core/components/icon'

function PathwayForm({ onServiceUpdate, state, ServiceTree }) {
  const decisionData = state?.pathwayform
  console.log('PathwayForm', decisionData, ServiceTree)
  const [currentNode, setCurrentNode] = useState(ServiceTree.nodes?.root)
  // Initialize an object to keep track of checkbox states for each node
  const [nodeStates, setNodeStates] = useState({})

  console.log('PathwayForm node', nodeStates, currentNode, ServiceTree)

  useEffect(() => {
    // Check if ServiceTree.nodes?.root is valid before trying to update currentNode
    if (ServiceTree && ServiceTree.nodes && ServiceTree.nodes.root) {
      setCurrentNode(ServiceTree.nodes.root)
    }
  }, [ServiceTree]) // Depend on ServiceTree so this runs whenever ServiceTree changes

  useEffect(() => {
    if (decisionData) {
      setNodeStates(decisionData)
    }
  }, [decisionData]) // Dependency array ensures effect runs when decisionData changes

  const handleNextNode = nextNodeId => {
    setCurrentNode(ServiceTree.nodes[nextNodeId])
  }

  const handlePreviousNode = previousNodeId => {
    setCurrentNode(ServiceTree.nodes[previousNodeId])
  }

  const handleSymptomChange = (nodeId, symptom, isChecked) => {
    const updatedState = { ...nodeStates }
    const nodeState = updatedState[nodeId] || {}
    const selectedSymptoms = nodeState.selectedSymptoms || []

    if (isChecked) {
      selectedSymptoms.push(symptom)
    } else {
      const index = selectedSymptoms.indexOf(symptom)
      if (index > -1) {
        selectedSymptoms.splice(index, 1)
      }
    }

    updatedState[nodeId] = {
      ...nodeState,
      selectedSymptoms
    }

    setNodeStates(updatedState)
  }

  const handleSymptomDecision = (nodeId, decision) => {
    const updatedState = { ...nodeStates }
    const nodeState = updatedState[nodeId] || {}

    updatedState[nodeId] = {
      ...nodeState,
      decision // This captures the decision generically, without assuming it's about deterioration
    }

    setNodeStates(updatedState)
  }

  const handleCommentsChange = (nodeId, value) => {
    const updatedState = { ...nodeStates }
    const currentNodeState = updatedState[nodeId] || {}

    updatedState[nodeId] = {
      ...currentNodeState,
      additionalComments: value
    }

    setNodeStates(updatedState)
  }

  const generateSummaryText = (node, state) => {
    let summaryText = ''
    if (node.type === 'component' && node.componentType === 'criteriaChecklist') {
      const decisions = Object.keys(state.checkedCriteria || {})
        .map(criterion => criterion)
        .join(', ')
      summaryText += decisions ? `Selected Criteria: ${decisions}` : 'No Criteria Selected'
    }

    if (node.type === 'criteriaCheck') {
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
    } else if (node.type === 'multiple_choice_question') {
      const selectedOption = nodeStates[node.id]?.selectedOption || 'No option selected'
      summaryText += `${node.content}: ${selectedOption}`
    }

    return summaryText
  }

  const handleActionChange = (nodeId, actionId, isChecked) => {
    const updatedState = { ...nodeStates }
    const currentNodeState = updatedState[nodeId] || {}
    const actionsTaken = currentNodeState.actionsTaken || {}

    actionsTaken[actionId] = isChecked

    updatedState[nodeId] = {
      ...currentNodeState,
      actionsTaken
    }

    setNodeStates(updatedState)
  }

  const handleTreatmentChange = (nodeId, treatmentId, isChecked) => {
    const updatedState = { ...nodeStates }
    const currentNodeState = updatedState[nodeId] || {}
    const selectedTreatments = currentNodeState.selectedTreatments || []

    if (isChecked) {
      selectedTreatments.push(treatmentId)
    } else {
      const index = selectedTreatments.indexOf(treatmentId)
      if (index > -1) {
        selectedTreatments.splice(index, 1)
      }
    }

    updatedState[nodeId] = {
      ...currentNodeState,
      selectedTreatments
    }

    setNodeStates(updatedState)
  }

  const handleCheckboxChange = (nodeId, index, criterionText) => {
    const updatedState = { ...nodeStates }
    const nodeState = updatedState[nodeId] || {}
    // Use an object to store checkbox states with criterion text as keys
    const checkedCriteria = nodeState.checkedCriteria || {}

    // Toggle the checkbox state
    if (checkedCriteria[criterionText]) {
      delete checkedCriteria[criterionText] // Remove if unchecked
    } else {
      checkedCriteria[criterionText] = true // Add if checked
    }

    updatedState[nodeId] = {
      ...nodeState,
      checkedCriteria, // Update the state with the new checked criteria
      noneChecked: false // Reset 'None' option if any checkbox is changed
    }

    setNodeStates(updatedState)
  }

  const handleNoneChange = nodeId => {
    const updatedState = { ...nodeStates }
    const nodeState = updatedState[nodeId] || {}
    const noneChecked = !nodeState.noneChecked

    updatedState[nodeId] = {
      ...nodeState,
      checkedCriteria: noneChecked ? {} : nodeState.checkedCriteria, // Clear checkedCriteria if "None" is checked
      noneChecked
    }

    setNodeStates(updatedState)
  }

  const handleInformationAcknowledged = nodeId => {
    const updatedState = { ...nodeStates }
    const nodeState = updatedState[nodeId] || {}

    updatedState[nodeId] = {
      ...nodeState,
      acknowledged: true // Mark as acknowledged
    }

    setNodeStates(updatedState)
  }

  const renderNode = node => {
    switch (node.type) {
      case 'criteria':
        return renderCriteriaNode(node)

      case 'component':
        if (node.componentType === 'criteriaChecklist') {
          return renderCriteriaChecklistNode(node)
        }
        break

      case 'information':
        return renderInformationNode(node)

      case 'criteriaCheck':
        return renderCriteriaCheckNode(node)

      case 'symptoms':
        return renderSymptomsNode(node)

      case 'stop':
        return renderStopNode(node)

      case 'gateway':
        return renderGatewayNode(node)

      case 'advice':
        return renderAdviceNode(node)

      case 'referral':
        return renderReferralNode(node)

      case 'question':
        return renderQuestionNode(node)

      case 'plan':
        return renderPlanNode(node)
      case 'summary':
        return renderSummaryNode(node)
      case 'treatment':
        return renderTreatmentNode(node)
      case 'multiple_choice_question':
        return renderMultipleChoiceQuestionNode(node)
      case 'opening':
        return renderOpeningNode(node)
    }
  }

  const renderOpeningNode = node => {
    return (
      <Card>
        <CardContent>
          <Typography variant='h5' style={{ fontWeight: 'bold', marginBottom: '15px' }}>
            {node.title}
          </Typography>

          <IconifyIcon
            icon={node.icon || 'noto-v1:hospital'}
            alt='Icon'
            style={{ width: '50px', height: '50px', marginBottom: '15px' }}
          />

          {node.clinical_situations && (
            <Typography variant='body1' style={{ marginBottom: '15px' }}>
              {node.clinical_situations}
            </Typography>
          )}
          {node.notices &&
            node.notices.map((notice, index) => (
              <Typography key={index} variant='body2' style={{ marginTop: '10px', color: '#666' }}>
                {notice.text}
              </Typography>
            ))}
          {node.useful_links && node.useful_links.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <Typography variant='h6' style={{ marginBottom: '10px' }}>
                Useful Links:
              </Typography>
              {node.useful_links.map((link, index) => (
                <Typography key={index} variant='body2'>
                  <a
                    href={link.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ textDecoration: 'none', color: '#3f51b5' }}
                  >
                    {link.text}
                  </a>
                </Typography>
              ))}
            </div>
          )}
          {node.dates_of_validity && (
            <Typography variant='body2' style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
              Valid from: {node.dates_of_validity.split(' to ')[0]} to {node.dates_of_validity.split(' to ')[1]}
            </Typography>
          )}
        </CardContent>
        {node.nextNodeId && (
          <CardActions style={{ justifyContent: 'center', padding: '20px' }}>
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleNextNode(node.nextNodeId)}
              style={{ width: '200px' }}
            >
              Begin Assessment
            </Button>
          </CardActions>
        )}
      </Card>
    )
  }

  const renderMultipleChoiceQuestionNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={
            <IconifyIcon icon={node.icon || 'fluent:task-list-square-ltr-20-filled'} style={{ fontSize: '40px' }} />
          }
          title={<Typography variant='h6'>{node.title || 'Multiple Choice Question'}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', mb: 4 }}
        />
        <CardContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {node.content}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3, alignItems: 'flex-start' }}>
            {node.answers.map((answer, index) => (
              <Button
                key={index}
                variant='contained'
                sx={{ mb: 1, padding: 2, fontSize: 14, width: 'auto', alignSelf: 'center' }} // Adjust the width and alignment for better visual structure
                onClick={() => handleMultipleChoiceSelection(node.id, answer.text, answer.action)}
              >
                {answer.text}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>
    )
  }

  const handleMultipleChoiceSelection = (nodeId, selectedOption, action) => {
    // Update the nodeStates with the selected option and the corresponding action
    const updatedState = {
      ...nodeStates,
      [nodeId]: {
        ...nodeStates[nodeId],
        selectedOption: selectedOption,
        action: action // Store the next action which directly maps to the next node ID
      }
    }
    setNodeStates(updatedState)

    // Use nextAction as the next node ID since it directly maps to node IDs

    setCurrentNode(ServiceTree.nodes[action])
  }

  const renderInformationNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<IconifyIcon icon={node.icon || 'icon-park:info'} style={{ fontSize: '40px' }} />}
          title={
            <Typography variant='h6' style={{ fontWeight: 'bold' }}>
              {node.title || 'Information'}
            </Typography>
          }
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'info.main', color: 'info.contrastText' }}
        />
        <CardContent sx={{ mt: 4 }}>
          <Typography variant='body1' style={{ marginBottom: '20px' }}>
            {node.content}
          </Typography>
        </CardContent>
        {node.nextNodeId && (
          <CardActions style={{ justifyContent: 'flex-end' }}>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                handleInformationAcknowledged(node.id) // Mark the information as acknowledged
                handleNextNode(node.nextNodeId) // Navigate to the next node
              }}
              style={{ fontWeight: 'bold' }}
            >
              Continue
            </Button>
          </CardActions>
        )}
      </Card>
    )
  }

  const renderSymptomsNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<IconifyIcon icon={node.icon || 'healthicons:symptom'} style={{ fontSize: '40px' }} />}
          title={<Typography variant='h6'>{node.content}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', '& .MuiCardHeader-avatar': { mr: 2 } }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3 }}>
            {node.symptoms.map((symptom, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    onChange={e => handleSymptomChange(node.id, symptom, e.target.checked)}
                    checked={nodeStates[node.id]?.selectedSymptoms?.includes(symptom) ?? false}
                    color='primary'
                  />
                }
                label={symptom}
                sx={{ alignItems: 'center' }} // Ensures text is aligned with the checkbox
              />
            ))}
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              handleSymptomDecision(node.id, 'Yes') // 'Yes' decision
              handleNextNode(node.nextNodeIdIfYes)
            }}
            sx={{ mr: 1 }}
          >
            Yes
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              handleSymptomDecision(node.id, 'No') // 'No' decision
              handleNextNode(node.nextNodeIdIfNo)
            }}
          >
            No
          </Button>
        </CardActions>
      </Card>
    )
  }

  const handleStopDecision = (nodeId, decision) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      decision
    }

    setNodeStates(updatedState)
  }

  const renderStopNode = node => {
    console.log('nodeifyes', node.nextNodeIdIfYes)
    return (
      <Card sx={{ m: 2, boxShadow: 3, borderColor: 'error.main' }}>
        <CardHeader
          avatar={<IconifyIcon icon={node?.icon || 'openmoji:stop-sign'} style={{ fontSize: '40px' }} />}
          title={<Typography variant='h6'>{node.title || 'Warning'}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'warning.main', color: 'secondary.contrastText', mb: 3 }}
        />
        <CardContent>
          <Typography variant='h6' sx={{ fontWeight: 'bold', color: 'error.main', mb: 2 }}>
            Attention Needed
          </Typography>
          <Typography variant='body1' sx={{ mb: 3 }}>
            {node.content}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-around' }}>
          <Button
            variant='contained'
            color='error'
            onClick={() => {
              handleStopDecision(node.id, 'End Consultation')
              handleNextNode(node.nextNodeIdIfYes) // Assuming this leads to the end or a summary
            }}
            sx={{ fontWeight: 'bold' }}
          >
            End Consultation
          </Button>
          <Button
            variant='outlined'
            color='warning'
            onClick={() => {
              handleStopDecision(node.id, 'Treat Anyway')
              handlePreviousNode(node.nextNodeIdIfNo) // Assuming this takes the user back to a previous step
            }}
            sx={{ fontWeight: 'bold', color: 'warning.dark' }}
          >
            Treat Anyway
          </Button>
        </CardActions>
      </Card>
    )
  }

  const renderGatewayNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={node.icon ? <IconifyIcon icon={node.icon} style={{ fontSize: '40px' }} /> : null}
          title={<Typography variant='h6'>{node.title || 'Gateway Point'}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'secondary.main', color: 'secondary.contrastText', mb: 3 }}
        />
        <CardContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {node.content}
          </Typography>
        </CardContent>
        {node.nextNodeId && (
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                handleGatewayAcknowledged(node.id)
                handleNextNode(node.nextNodeId)
              }}
              sx={{ fontWeight: 'bold' }}
            >
              Enter
            </Button>
          </CardActions>
        )}
      </Card>
    )
  }

  const handleGatewayAcknowledged = nodeId => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      acknowledged: true
    }

    setNodeStates(updatedState)
  }

  const renderAdviceNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<IconifyIcon icon={node.icon || 'healthicons:ui-consultation'} style={{ fontSize: '40px' }} />}
          title={<Typography variant='h6'>{node.title || 'Important Advice'}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'secondary.main', color: 'secondary.contrastText' }}
        />
        <CardContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {node.content}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button
            variant='contained'
            color='error' // Emphasize the significance of ending the consultation
            onClick={() => handleAdviceDecision(node.id, 'End Consultation', node.nextNodeIdIfYes)}
          >
            End Consultation
          </Button>
          <Button
            variant='outlined'
            onClick={() => handleAdviceDecision(node.id, 'Proceed Anyway', node.nextNodeIdIfNo)}
          >
            Proceed Anyway
          </Button>
        </CardActions>
      </Card>
    )
  }

  const handleAdviceDecision = (nodeId, decision, nextNode) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      decision
    }

    setNodeStates(updatedState)
    if (decision === 'End Consultation') {
      handleNextNode(nextNode) // Proceed to end the consultation
    } else {
      handlePreviousNode(nextNode) // Go back for treatment despite advice
    }
  }

  const renderReferralNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<IconifyIcon icon={node.icon || 'openmoji:female-doctor'} style={{ fontSize: '40px' }} />}
          title={<Typography variant='h6'>{node.title || 'Referral Needed'}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'warning.main', color: 'warning.contrastText', mb: 4 }}
        />
        <CardContent sx={{ pt: 3 }}>
          {' '}
          {/* Increased padding-top for more space between header and content */}
          <Typography variant='body1' sx={{ mb: 2 }}>
            {node.content}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button
            sx={{ mr: 1 }}
            variant='contained'
            color='error' // Use error color to emphasize ending the consultation
            onClick={() => handleReferralDecision(node.id, 'End Consultation', node.nextNodeIdIfYes)}
          >
            End Consultation
          </Button>
          <Button
            variant='outlined'
            color='primary' // Use primary color to encourage proceeding with treatment
            onClick={() => handleReferralDecision(node.id, 'Proceed with Treatment', node.nextNodeIdIfNo)}
          >
            Proceed with Treatment
          </Button>
        </CardActions>
      </Card>
    )
  }

  const handleReferralDecision = (nodeId, decision, nextNode) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      decision // This captures the decision made at the referral node
    }

    setNodeStates(updatedState)
    if (decision === 'End Consultation') {
      handleNextNode(nextNode) // Proceed to end the consultation
    } else {
      handlePreviousNode(nextNode) // Go back for treatment despite referral
    }
  }

  const renderPlanNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<IconifyIcon icon={node.icon || 'mdi:clipboard-text-outline'} style={{ fontSize: '40px' }} />}
          title={<Typography variant='h6'>{node.title || 'Patient Plan'}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}
        />
        <CardContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {node.content}
          </Typography>
          <TextField
            id={`plan-${node.id}`}
            label='Decision made for patient'
            multiline
            rows={4}
            defaultValue=''
            variant='outlined'
            fullWidth
            margin='normal'
            onBlur={e => handlePlanInput(node.id, e.target.value)} // Capture the input when the user navigates away from the TextField
            sx={{ mb: 2 }} // Adjust bottom margin for spacing
          />
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button sx={{ mr: 1 }} variant='contained' color='primary' onClick={() => handleNextNode(node.nextNodeId)}>
            Treatment options
          </Button>
          <Button variant='outlined' color='secondary' onClick={() => handleNextNode(node.nextNodeIdIfYes)}>
            End consultation
          </Button>
        </CardActions>
      </Card>
    )
  }

  const handlePlanInput = (nodeId, planText) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      planText // Store the plan text input by the user
    }

    setNodeStates(updatedState)
  }

  const renderQuestionNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<IconifyIcon icon={node.icon || 'mdi:chat-question'} style={{ fontSize: '40px' }} />}
          title={<Typography variant='h6'>{node.title || node.content}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'info.main', color: 'info.contrastText', mb: 3 }}
        />

        <CardContent>
          {node.context_list &&
            node.context_list.map((context, index) => (
              <Typography key={index} variant='body1' sx={{ mt: 1 }}>
                {`${index + 1}) ${context}`}
              </Typography>
            ))}
          {node.context && (
            <Typography variant='body1' sx={{ mt: 1 }}>
              {node.context}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button
            sx={{ mr: 1 }}
            variant='contained'
            color='primary'
            onClick={() => handleQuestionAnswer(node.id, 'Yes', node.nextNodeIdIfYes)}
          >
            Yes
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => handleQuestionAnswer(node.id, 'No', node.nextNodeIdIfNo)}
          >
            No
          </Button>
        </CardActions>
      </Card>
    )
  }

  const handleQuestionAnswer = (nodeId, answer, nextNodeId) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      answer // Capture the user's answer to the question
    }

    setNodeStates(updatedState)
    handleNextNode(nextNodeId) // Proceed based on the answer
  }

  // Render summary node with enhanced details
  const renderSummaryNode = node => (
    <Box>
      <Typography variant='h6'>Summary of Decisions and Actions</Typography>
      <List>
        {console.log('NodeId state', nodeStates)}
        {Object.keys(nodeStates).map(nodeId => {
          const node = ServiceTree.nodes[nodeId]
          console.log('NodeId', nodeId)
          const state = nodeStates[nodeId]
          if (node.type === 'stop' && state.treatAnyway) {
            return (
              <ListItem key={nodeId}>
                <ListItemText primary='Decision: Treat Anyway despite recommendations' />
              </ListItem>
            )
          }
          //   console.log('PathwayForm', node, state)
          return (
            <ListItem key={nodeId}>
              <ListItemText primary={node.content} secondary={generateSummaryText(node, state)} />
            </ListItem>
          )
        })}
      </List>
      <Button variant='contained' onClick={() => onServiceUpdate(nodeStates)}>
        Save
      </Button>
    </Box>
  )

  const renderTreatmentNode = node => {
    const nodeState = nodeStates[node.id] || {}
    const selectedTreatments = nodeState.selectedTreatments || []
    const actionsTaken = nodeState.actionsTaken || {}
    const additionalComments = nodeState.additionalComments || ''

    // Assuming patient's criteria are stored in nodeState for simplicity
    const patientCriteria = nodeState.patientCriteria || {}

    return (
      <Box>
        <Typography variant='h6'>{node.content}</Typography>

        {/* Treatment Selection with Numbers and Subtext for Contraindications */}
        {node.treatments.map((treatment, index) => (
          <Box key={treatment.id} sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ width: '30px' }}>{index + 1}.</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedTreatments.includes(treatment.id)}
                    onChange={e => handleTreatmentChange(node.id, treatment.id, e.target.checked)}
                    disabled={treatment.contraindications?.some(cond => patientCriteria[cond])}
                  />
                }
                label={
                  <Box>
                    <Typography component='span'>{treatment.name}</Typography>
                    {treatment.info && (
                      <Typography component='span' variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
                        {treatment.info}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </Box>
            {treatment.contraindications?.some(cond => patientCriteria[cond]) && (
              <Typography variant='caption' sx={{ ml: '30px', color: 'text.secondary' }}>
                Contraindicated
              </Typography>
            )}
          </Box>
        ))}

        {/* Actions Checklist */}
        {node?.actions &&
          node.actions.map(action => (
            <FormControlLabel
              key={action.id}
              control={
                <Checkbox
                  checked={!!actionsTaken[action.id]}
                  onChange={e => handleActionChange(node.id, action.id, e.target.checked)}
                />
              }
              label={action.label}
            />
          ))}

        {/* Additional Comments */}
        <TextField
          label='Additional Comments'
          multiline
          rows={4}
          value={additionalComments}
          onChange={e => handleCommentsChange(node.id, e.target.value)}
          fullWidth
          margin='normal'
        />

        {/* Navigation Buttons */}
        <Button variant='contained' onClick={() => handleNextNode(node.nextNodeId)}>
          Next
        </Button>
      </Box>
    )
  }

  const renderCriteriaNode = node => {
    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<IconifyIcon icon={node.icon || 'mdi:format-list-checks'} style={{ fontSize: '40px' }} />}
          title={<Typography variant='h6'>{node.title || 'Criteria Check'}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'info.main', color: 'info.contrastText' }}
        />
        <CardContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {node.content}
          </Typography>
          {node.criteria &&
            node.criteria.map((criterion, index) => (
              <Typography key={index} sx={{ mb: 1 }}>
                {criterion}
              </Typography>
            ))}
          {node.inclusion && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='subtitle1' sx={{ color: 'success.main' }}>
                Inclusion Criteria:
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {node.inclusion.map((criterion, index) => (
                <Typography key={index} sx={{ color: 'success.dark', ml: 2 }}>
                  {`${index + 1}) ${criterion}`}
                </Typography>
              ))}
            </Box>
          )}
          {node.exclusion && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='subtitle1' sx={{ color: 'error.main' }}>
                Exclusion Criteria:
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {node.exclusion.map((criterion, index) => (
                <Typography key={index} sx={{ color: 'error.dark', ml: 2 }}>
                  {`${index + 1}) ${criterion}`}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button
            variant='outlined'
            color='primary'
            sx={{ mr: 1 }}
            onClick={() => handleNextNode(node.nextNodeIdIfTrue)}
          >
            Yes
          </Button>
          <Button variant='contained' color='secondary' onClick={() => handleNextNode(node.nextNodeIdIfFalse)}>
            No
          </Button>
        </CardActions>
      </Card>
    )
  }

  const renderCriteriaChecklistNode = node => {
    const nodeState = nodeStates[node.id] || {}
    const checkedCriteria = nodeState.checkedCriteria || {}
    const noneChecked = nodeState.noneChecked || false

    // Function to determine the next node based on the criteria met
    const handleNext = () => {
      // Check if the "None" option is selected or if the minimum required checkboxes are checked
      const isRequirementMet = Object.keys(checkedCriteria).length >= node.minRequired

      // Determine the next node based on whether the requirement is met
      const nextNodeId = isRequirementMet ? node.nextNodeIdIfPassed : node.nextNodeIdIfFailed

      // Update the current node to the next node based on the decision
      handleNextNode(nextNodeId)
    }

    return (
      <Box>
        <Typography variant='h6'>{node.content}</Typography>
        {node.criteria.map((criterion, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={!!checkedCriteria[criterion.text]}
                onChange={() => handleCheckboxChange(node.id, index, criterion.text)}
                disabled={noneChecked && index !== node.criteria.length} // Disable if "None" is checked, except the "None" checkbox itself
              />
            }
            label={criterion.text}
          />
        ))}
        {node.noneOption && (
          <FormControlLabel
            control={<Checkbox checked={noneChecked} onChange={() => handleNoneChange(node.id)} />}
            label={node.noneOption.text}
          />
        )}
        <Button variant='contained' onClick={handleNext}>
          Next
        </Button>
      </Box>
    )
  }

  const renderCriteriaCheckNode = node => {
    const nodeState = nodeStates[node.id] || {}
    const checkedCriteria = nodeState.checkedCriteria || {}
    const noneChecked = nodeState.noneChecked || false

    const handleAllChange = nodeId => {
      const updatedState = { ...nodeStates }
      const nodeState = updatedState[nodeId] || {}
      const allChecked = !Object.keys(nodeState.checkedCriteria || {}).length // If no criteria are checked, checking "All"

      // If "All" is being checked, select all criteria, otherwise clear selection
      const checkedCriteria = allChecked
        ? node.criteria.reduce((acc, criterion) => {
            acc[criterion.text] = true
            return acc
          }, {})
        : {}

      updatedState[nodeId] = {
        ...nodeState,
        checkedCriteria,
        noneChecked: false // Deselect "None" when "All" is selected
      }

      setNodeStates(updatedState)
    }

    // Function to determine the next node based on the criteria met
    const handleNext = () => {
      // Check if the "None" option is selected or if the minimum required checkboxes are checked
      const isRequirementMet = Object.keys(checkedCriteria).length >= node.minRequired

      // Determine the next node based on whether the requirement is met
      const nextNodeId = isRequirementMet ? node.nextNodeIdIfPassed : node.nextNodeIdIfFailed

      // Update the current node to the next node based on the decision
      handleNextNode(nextNodeId)
    }

    return (
      <Card sx={{ m: 2 }}>
        <CardHeader
          avatar={node.icon ? <IconifyIcon icon={node.icon} style={{ width: '50px', height: '50px' }} /> : null}
          title={
            <Typography variant='p' style={{ fontWeight: 'bold' }}>
              {node.content}
            </Typography>
          }
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
            {node.criteria.map((criterion, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={!!checkedCriteria[criterion.text]}
                    onChange={() => handleCheckboxChange(node.id, index, criterion.text)}
                    disabled={noneChecked && index !== node.criteria.length} // Disable if "None" is checked, except the "None" checkbox itself
                  />
                }
                label={criterion.text}
              />
            ))}
            {node.allOption && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={node.criteria.every(criterion => checkedCriteria[criterion.text]) && !noneChecked}
                    onChange={() => handleAllChange(node.id)}
                  />
                }
                label={node.allOption.text}
              />
            )}
            {node.noneOption && (
              <FormControlLabel
                control={<Checkbox checked={noneChecked} onChange={() => handleNoneChange(node.id)} color='warning' />}
                label={<Typography color='warning'>{node.noneOption.text}</Typography>}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant='contained' color='success' onClick={handleNext}>
              Next
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        height: '100%' // Use 100% height instead of viewport units,
      }}
    >
      <Box
        style={{
          flex: 1, // This makes the content box take up all available space
          overflowY: 'auto' // Add scroll to content box if content overflows
        }}
      >
        {renderNode(currentNode)}
      </Box>
      <Box>
        <Divider />

        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          {/* <Button onClick={() => handleNextNode(currentNode.nextNodeId)}>Next</Button> */}
          {currentNode.previousNodeId && (
            <Button onClick={() => handlePreviousNode(currentNode.previousNodeId)}>Back</Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default PathwayForm
