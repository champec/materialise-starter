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
import Link from 'next/link'

function PathwayForm({ onServiceUpdate, state, ServiceTree, nodeStates, setNodeStates }) {
  const decisionData = state?.pathwayform
  console.log('PathwayForm', decisionData, ServiceTree)
  const [currentNode, setCurrentNode] = useState(ServiceTree.nodes?.root)
  // Initialize an object to keep track of checkbox states for each node
  //   const [nodeStates, setNodeStates] = useState({})
  const [navigationHistory, setNavigationHistory] = useState([])

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
    setNavigationHistory(history => [...history, currentNode.id]) // Push current node ID onto the stac
    setCurrentNode(ServiceTree.nodes[nextNodeId])
  }

  //   const handlePreviousNode = previousNodeId => {
  //     setCurrentNode(ServiceTree.nodes[previousNodeId])
  //   }

  const handlePreviousNode = () => {
    setNavigationHistory(history => {
      const updatedHistory = [...history]
      const previousNodeId = updatedHistory.pop() // Remove the last node from the stack
      setCurrentNode(ServiceTree.nodes[previousNodeId] || ServiceTree.nodes.root)
      return updatedHistory // Return the updated history
    })
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
      type: ServiceTree.nodes[nodeId].type,
      type: ServiceTree.nodes[nodeId].type,
      selectedSymptoms
    }

    setNodeStates(updatedState)
  }

  const handleSymptomDecision = (nodeId, decision) => {
    const updatedState = { ...nodeStates }
    const nodeState = updatedState[nodeId] || {}

    updatedState[nodeId] = {
      ...nodeState,
      type: ServiceTree.nodes[nodeId].type,
      type: ServiceTree.nodes[nodeId].type,
      decision // This captures the decision generically, without assuming it's about deterioration
    }

    setNodeStates(updatedState)
  }

  const handleCommentsChange = (nodeId, value) => {
    const updatedState = { ...nodeStates }
    const currentNodeState = updatedState[nodeId] || {}

    updatedState[nodeId] = {
      ...currentNodeState,
      type: ServiceTree.nodes[nodeId].type,
      type: ServiceTree.nodes[nodeId].type,
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
      // Use the criteria from the state if available, otherwise fall back to the node's initial criteria
      const criteria = state.criteria || node.criteria

      // Map each criterion to a string that includes the criterion text and the selected response
      const decisions = criteria
        .map(criterion => {
          const responseText = criterion.response ? `Response: ${criterion.response}` : 'No Response'
          return `${criterion.text} - ${responseText}`
        })
        .join(', ')
      summaryText += decisions ? `Selected Criteria: ${decisions}` : 'No Criteria Selected'
    }

    if (node.type === 'symptoms') {
      const symptoms = nodeStates[node.id]?.symptoms || node.symptoms
      const symptomsSummary = symptoms
        .map((symptom, index) => {
          const responseText = symptom.response ? `${symptom.response}` : 'No Response'
          return `${index + 1}. ${symptom.text} - ${responseText}`
        })
        .join('; ')

      summaryText += symptomsSummary ? `Symptoms Assessed: ${symptomsSummary}` : 'No Symptoms Assessed'
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
    } else if (node.type === 'comments') {
      const commentsText = state.comment ? `Comments: ${state.comment}` : 'No Comments Provided'
      summaryText += commentsText
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
      type: ServiceTree.nodes[nodeId].type,
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
      type: ServiceTree.nodes[nodeId].type,
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
      type: ServiceTree.nodes[nodeId].type,
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
      type: ServiceTree.nodes[nodeId].type,
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
      type: ServiceTree.nodes[nodeId].type,
      acknowledged: true // Mark as acknowledged
    }

    setNodeStates(updatedState)
  }

  const renderNode = node => {
    console.log('renderNode', node)
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
      case 'comments':
        return renderCommentsNode(node)
      case 'countBased':
        return renderCountBasedNode(node)
    }
  }

  const renderCommentsNode = node => {
    console.log('renderCommentsNode', node)
    const handleCommentChange = (nodeId, value) => {
      const updatedState = { ...nodeStates }
      const currentNodeState = updatedState[nodeId] || {}

      updatedState[nodeId] = {
        ...currentNodeState,
        type: ServiceTree.nodes[nodeId].type,
        comment: value
      }

      setNodeStates(updatedState)
    }

    const handleContinue = () => {
      // Proceed to the next node if defined
      if (node.nextNodeId) {
        handleNextNode(node.nextNodeId)
      }
    }

    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          title={<Typography variant='h6'>{node.title}</Typography>}
          sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}
        />
        <CardContent>
          <TextField
            id={`comment-${node.id}`}
            label='Comments'
            multiline
            rows={4}
            value={nodeStates[node.id]?.comment || ''}
            onChange={e => handleCommentChange(node.id, e.target.value)}
            variant='outlined'
            fullWidth
            margin='normal'
          />
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button variant='contained' color='primary' onClick={handleContinue}>
            Continue
          </Button>
        </CardActions>
      </Card>
    )
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
          {node.content && (
            <Typography variant='body1' sx={{ mb: 2 }}>
              {node.content}
            </Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3, alignItems: 'flex-start' }}>
            {node.context_list &&
              node.context_list.map((context, index) => (
                <Typography key={index} variant='body2' sx={{ mb: 1 }}>
                  {`${index + 1}) ${context}`}
                </Typography>
              ))}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {node?.links &&
              node.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ color: 'secondary.main' }} // Use MUI color for better visibility
                >
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    {`${index + 1}) ${link.text}`}
                  </Typography>
                </Link>
              ))}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3, alignItems: 'stretch' }}>
            {node.answers.map((answer, index) => (
              <Button
                key={index}
                variant='contained'
                sx={{
                  mb: 1,
                  padding: 2,
                  fontSize: 14,
                  width: '100%', // Changed to '100%' for full width
                  textAlign: 'left', // Added textAlign for text alignment,
                  justifyContent: 'flex-start' // Added justifyContent for text alignment
                }}
                onClick={() => handleMultipleChoiceSelection(node.id, answer.text, answer.action)}
              >
                {`${index + 1}) ${answer.text}`}
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
        type: ServiceTree.nodes[nodeId].type,
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
    const nodeState = nodeStates[node.id] || {}
    // Transform symptoms into objects with 'text' and 'response' properties if not already done
    const symptoms = nodeState.symptoms || node.symptoms

    const handleResponseChange = (nodeId, index, response) => {
      const updatedState = { ...nodeStates }
      const updatedSymptoms = [...symptoms]
      updatedSymptoms[index].response = response // Update the response for the selected symptom

      updatedState[nodeId] = {
        ...nodeState,
        type: ServiceTree.nodes[nodeId].type,
        symptoms: updatedSymptoms
      }

      setNodeStates(updatedState)
    }

    const handleAllChange = (nodeId, response) => {
      const updatedState = { ...nodeStates }
      const updatedSymptoms = symptoms.map(symptom => ({ ...symptom, response }))

      updatedState[nodeId] = {
        ...nodeState,
        type: ServiceTree.nodes[nodeId].type,
        symptoms: updatedSymptoms
      }

      setNodeStates(updatedState)
    }

    const handleNext = () => {
      // Determine if the pass criteria are met based on the node's passResponse
      const passCondition = symptoms.every(symptom => symptom.response === node.passResponse)
      const nextNodeId = passCondition ? node.nextNodeIdIfNo : node.nextNodeIdIfYes
      handleNextNode(nextNodeId)
    }

    return (
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardHeader
          avatar={<IconifyIcon icon={node.icon || 'healthicons:symptom'} style={{ fontSize: '40px' }} />}
          title={<Typography variant='h6'>{node.title || node.content}</Typography>}
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', '& .MuiCardHeader-avatar': { mr: 2 } }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3 }}>
            {node?.context && (
              <Typography variant='p' sx={{ mb: 2 }}>
                {node.context}
              </Typography>
            )}
            {symptoms.map((symptom, index) => (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                <Typography>{`${index + 1}. ${symptom.text}`}</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                  <Button
                    variant={symptom.response === 'Yes' ? 'contained' : 'outlined'}
                    color='primary'
                    onClick={() => handleResponseChange(node.id, index, 'Yes')}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={symptom.response === 'No' ? 'contained' : 'outlined'}
                    color='secondary'
                    onClick={() => handleResponseChange(node.id, index, 'No')}
                  >
                    No
                  </Button>
                </Box>
              </Box>
            ))}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center' }}>
              <Button variant='outlined' color='primary' onClick={() => handleAllChange(node.id, 'Yes')}>
                Yes to All
              </Button>
              <Button variant='outlined' color='secondary' onClick={() => handleAllChange(node.id, 'No')}>
                No to All
              </Button>
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button variant='contained' color='primary' onClick={handleNext}>
            Next
          </Button>
        </CardActions>
      </Card>
    )
  }

  const handleStopDecision = (nodeId, decision) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      type: ServiceTree.nodes[nodeId].type,
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
              handleNextNode(node.nextNodeIdIfNo) // Assuming this takes the user back to a previous step
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
      type: ServiceTree.nodes[nodeId].type,
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
      type: ServiceTree.nodes[nodeId].type,
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
      type: ServiceTree.nodes[nodeId].type,
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
      type: ServiceTree.nodes[nodeId].type,
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
      type: ServiceTree.nodes[nodeId].type,
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
        <Card sx={{ m: 2, boxShadow: 3 }}>
          <CardHeader
            avatar={<IconifyIcon icon={node.icon || 'mdi:format-list-checks'} style={{ fontSize: '40px' }} />}
            title={<Typography variant='h6'>{node.title || 'Treatment decision'}</Typography>}
            titleTypographyProps={{ variant: 'h6' }}
            sx={{ backgroundColor: 'info.main', color: 'info.contrastText' }}
          />

          <Typography variant='p'>{node.content}</Typography>

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
                        <Typography
                          component='span'
                          variant='caption'
                          sx={{ display: 'block', color: 'text.secondary' }}
                        >
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
        </Card>
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
    // Directly use 'criteria' from the node, ensuring it has default 'response' values if not already set
    const criteria =
      nodeState.criteria || node.criteria.map(criterion => ({ ...criterion, response: criterion.response || null }))

    const handleResponseChange = (nodeId, index, response) => {
      const updatedState = { ...nodeStates }
      const updatedCriteria = [...criteria]
      updatedCriteria[index].response = response // Update the response for the selected criterion

      updatedState[nodeId] = {
        ...nodeState,
        type: ServiceTree.nodes[nodeId].type,
        criteria: updatedCriteria
      }

      setNodeStates(updatedState)
    }

    const handleAllChange = (nodeId, response) => {
      const updatedState = { ...nodeStates }
      const updatedCriteria = criteria.map(criterion => ({ ...criterion, response })) // Set all responses

      updatedState[nodeId] = {
        ...nodeState,
        type: ServiceTree.nodes[nodeId].type,
        criteria: updatedCriteria
      }

      setNodeStates(updatedState)
    }

    const handleNext = () => {
      // Determine if the pass criteria are met based on the node's requirements
      const passCondition = criteria.every(criterion => criterion.response === node.passResponse)
      const nextNodeId = passCondition ? node.nextNodeIdIfPassed : node.nextNodeIdIfFailed
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
          sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText',mb:4 }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {criteria.map((criterion, index) => (
              <Box key={index}>
                <Typography>{`${index +1}) ${criterion.text}`}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                  <Button
                    variant={criterion.response === 'Yes' ? 'contained' : 'outlined'}
                    color='primary'
                    onClick={() => handleResponseChange(node.id, index, 'Yes')}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={criterion.response === 'No' ? 'contained' : 'outlined'}
                    color='secondary'
                    onClick={() => handleResponseChange(node.id, index, 'No')}
                  >
                    No
                  </Button>
                </Box>
              </Box>
            ))}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center' }}>
              <Button variant='outlined' color='primary' onClick={() => handleAllChange(node.id, 'Yes')}>
                Yes to All
              </Button>
              <Button variant='outlined' color='secondary' onClick={() => handleAllChange(node.id, 'No')}>
                No to All
              </Button>
            </Box>
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

  const renderCountBasedNode = node => {
   // Initialize node state from nodeStates or use the node's initial questions if not present
  // Merge the default node state with any saved state from nodeStates
  const nodeState = { ...ServiceTree.nodes[node.id], ...nodeStates[node.id] };


  console.log('countbased nodeState', nodeState)

  // Update nodeStates with the initialized node state if it wasn't already present
  if (!nodeStates[node.id]) {
    setNodeStates({ ...nodeStates, [node.id]: nodeState });
  }

  const handleResponseChange = (index, response) => {
    // Create a copy of the questions array and update the response for the selected question
    const updatedQuestions = nodeState.questions.map((question, i) =>
      i === index ? { ...question, response } : question
    );

    // Update the node state in nodeStates with the new questions array
    const updatedNodeState = { ...nodeState, questions: updatedQuestions };
    setNodeStates({ ...nodeStates, [node.id]: updatedNodeState });
  };

  const yesCount = nodeState.questions.filter(question => question.response === node.countOption).length;
    const handleNext = node => {
      console.log('nodeMap', node)

      const nextNodeId = node.nextNodeMap[yesCount] || node.defaultNextNodeId;

      handleNextNode(nextNodeId)
    }

    const handleAllResponses = (response) => {
      const updatedQuestions = nodeState.questions.map(question => ({ ...question, response }));

      setNodeStates({ ...nodeStates, [node.id]: { ...nodeState, questions: updatedQuestions } });
    };

    return (
      <Card>
        {/* <CardHeader title={node.title} /> */}
        <CardHeader
          avatar={node.icon ? <IconifyIcon icon={node.icon} style={{ width: '50px', height: '50px' }} /> : null}
          title={
            <Typography variant='p' style={{ fontWeight: 'bold' }}>
              {node.title}
            </Typography>
          }
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText',mb:4 }}
        />
        <CardContent>
          <Typography sx={{}}>{node.content || node.context}</Typography>
          {nodeState.questions.map((question, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography>{`${index + 1}. ${question.text}`}</Typography>
              <Button
                variant={question.response === 'Yes' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => handleResponseChange(index, 'Yes')}
                sx={{ mr: 1 }}
              >
                Yes
              </Button>
              <Button
                variant={question.response === 'No' ? 'contained' : 'outlined'}
                color='secondary'
                onClick={() => handleResponseChange(index, 'No')}
              >
                No
              </Button>
            </Box>
          ))}
<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button variant="outlined" color="primary" onClick={() => handleAllResponses('Yes')}>
            Yes to All
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => handleAllResponses('No')}>
            No to All
          </Button>
        </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Typography variant='h6' sx={{ mr: 2 }}>
            {node.countText}: {yesCount}
          </Typography>
          <Button variant='contained' color='primary' onClick={() => handleNext(node)}>
            Next
          </Button>
        </CardActions>
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
          {currentNode.id !== 'root' && <Button onClick={() => handlePreviousNode()}>Back</Button>}
          <Button onClick={() => handleNextNode('consultation_summary')}>Review</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default PathwayForm
