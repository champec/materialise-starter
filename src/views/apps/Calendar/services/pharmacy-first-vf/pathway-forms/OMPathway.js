import React, { useState, useEffect } from 'react'
import { acuteOtitisMediaDecisionTree } from './decisionTrees/AOMTree'
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
  ListItemText
} from '@mui/material'

function OMPathway({ onServiceUpdate, state }) {
  const decisionData = state?.pathwayform
  console.log('OMPathway', decisionData)
  const [currentNode, setCurrentNode] = useState(
    acuteOtitisMediaDecisionTree.nodes[acuteOtitisMediaDecisionTree.nextNodeIdIfTrue]
  )
  // Initialize an object to keep track of checkbox states for each node
  const [nodeStates, setNodeStates] = useState({})

  useEffect(() => {
    if (decisionData) {
      setNodeStates(decisionData)
    }
  }, [decisionData]) // Dependency array ensures effect runs when decisionData changes

  const handleNextNode = nextNodeId => {
    setCurrentNode(acuteOtitisMediaDecisionTree.nodes[nextNodeId])
  }

  const handlePreviousNode = previousNodeId => {
    setCurrentNode(acuteOtitisMediaDecisionTree.nodes[previousNodeId])
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
    }
  }

  const renderInformationNode = node => (
    <Box>
      <Typography variant='body1'>{node.content}</Typography>
      {node.nextNodeId && (
        <Button
          variant='contained'
          onClick={() => {
            handleInformationAcknowledged(node.id) // Mark the information as acknowledged
            handleNextNode(node.nextNodeId) // Navigate to the next node
          }}
        >
          Continue
        </Button>
      )}
    </Box>
  )

  const renderSymptomsNode = node => (
    <Box>
      <Typography variant='h6'>{node.content}</Typography>
      {node.symptoms.map((symptom, index) => (
        <FormControlLabel
          key={index}
          control={
            <Checkbox
              onChange={e => handleSymptomChange(node.id, symptom, e.target.checked)}
              checked={nodeStates[node.id]?.selectedSymptoms?.includes(symptom) ?? false}
            />
          }
          label={symptom}
        />
      ))}
      <Button
        variant='contained'
        onClick={() => {
          handleSymptomDecision(node.id, 'Yes') // 'Yes' decision
          handleNextNode(node.nextNodeIdIfYes)
        }}
      >
        Yes
      </Button>
      <Button
        variant='contained'
        onClick={() => {
          handleSymptomDecision(node.id, 'No') // 'No' decision
          handleNextNode(node.nextNodeIdIfNo)
        }}
      >
        No
      </Button>
    </Box>
  )

  const handleStopDecision = (nodeId, decision) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      decision
    }

    setNodeStates(updatedState)
  }

  const renderStopNode = node => (
    <Box>
      <Typography variant='body1' color='error'>
        {node.content}
      </Typography>

      <Box sx={{ mb: 4, justifyContent: 'space-between', alignContent: 'space-between' }} />
      <Button
        variant='contained'
        onClick={() => {
          handleStopDecision(node.id, 'End Consultation')
          handleNextNode(node.nextNodeIdIfYes) // Assuming this leads to the end or a summary
        }}
      >
        End Consultation
      </Button>
      <Button
        variant='outlined'
        onClick={() => {
          handleStopDecision(node.id, 'Treat Anyway')
          handlePreviousNode(node.nextNodeIdIfNo) // Assuming this takes the user back to a previous step
        }}
      >
        Treat Anyway
      </Button>
    </Box>
  )

  const renderGatewayNode = node => (
    <Box>
      <Typography variant='body1'>{node.content}</Typography>
      {node.nextNodeId && (
        <Button
          variant='contained'
          onClick={() => {
            handleGatewayAcknowledged(node.id)
            handleNextNode(node.nextNodeId)
          }}
        >
          Enter
        </Button>
      )}
    </Box>
  )

  const handleGatewayAcknowledged = nodeId => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      acknowledged: true
    }

    setNodeStates(updatedState)
  }

  const renderAdviceNode = node => (
    <Box>
      <Typography variant='body1'>{node.content}</Typography>
      <Box sx={{ mb: 4, justifyContent: 'space-between', alignContent: 'space-between' }}>
        <Button
          sx={{ ml: 1, padding: 2, fontSize: 14 }}
          variant='contained'
          onClick={() => {
            handleAdviceDecision(node.id, 'End Consultation')
            handleNextNode(node.nextNodeIdIfYes)
          }}
        >
          End Consultation
        </Button>
        <Button
          variant='outlined'
          sx={{ ml: 1, padding: 2, fontSize: 14 }}
          onClick={() => {
            handleAdviceDecision(node.id, 'Proceed Anyway')
            handlePreviousNode(node.nextNodeIdIfNo)
          }}
        >
          Proceed Anyway
        </Button>
      </Box>
    </Box>
  )

  const handleAdviceDecision = (nodeId, decision) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      decision
    }

    setNodeStates(updatedState)
  }

  const renderReferralNode = node => (
    <Box>
      <Typography variant='body1'>{node.content}</Typography>
      <Box sx={{ mt: 4, justifyContent: 'space-between', alignContent: 'space-between' }}>
        <Button
          sx={{ ml: 1, padding: 2, fontSize: 14 }}
          variant='contained'
          onClick={() => handleReferralDecision(node.id, 'End Consultation')}
        >
          End Consultation
        </Button>
        <Button
          variant='outlined'
          sx={{ ml: 1, padding: 2, fontSize: 14 }}
          onClick={() => handleReferralDecision(node.id, 'Proceed with Treatment')}
        >
          Proceed with Treatment
        </Button>
      </Box>
    </Box>
  )

  const handleReferralDecision = (nodeId, decision) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      decision // This captures the decision made at the referral node
    }

    setNodeStates(updatedState)
    if (decision === 'End Consultation') {
      handleNextNode(node.nextNodeIdIfYes) // Proceed to end the consultation
    } else {
      handlePreviousNode(node.nextNodeIdIfNo) // Go back for treatment despite referral
    }
  }

  const renderPlanNode = node => (
    <Box>
      <Typography sx={{ mb: 4 }} variant='body1'>
        {node.content}
      </Typography>
      <TextField
        id={`plan-${node.id}`}
        label='Decision made for patient'
        multiline
        rows={4}
        defaultValue=''
        variant='outlined'
        sx={{ width: '100%', mb: 4 }}
        onBlur={e => handlePlanInput(node.id, e.target.value)} // Capture the input when the user navigates away from the TextField
      />

      <Button variant='contained' onClick={() => handleNextNode(node.nextNodeId)}>
        Treatment options
      </Button>
      <Button variant='outlined' onClick={() => handleNextNode(node.nextNodeIdIfYes)}>
        End consultation
      </Button>
    </Box>
  )

  const handlePlanInput = (nodeId, planText) => {
    const updatedState = { ...nodeStates }
    updatedState[nodeId] = {
      ...updatedState[nodeId],
      planText // Store the plan text input by the user
    }

    setNodeStates(updatedState)
  }

  const renderQuestionNode = node => (
    <Box>
      <Typography variant='h6'>{node.content}</Typography>
      <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <Button variant='contained' onClick={() => handleQuestionAnswer(node.id, 'Yes', node.nextNodeIdIfYes)}>
          Yes
        </Button>
        <Button variant='contained' onClick={() => handleQuestionAnswer(node.id, 'No', node.nextNodeIdIfNo)}>
          No
        </Button>
      </Box>
    </Box>
  )

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
        {Object.keys(nodeStates).map(nodeId => {
          const node = acuteOtitisMediaDecisionTree.nodes[nodeId]
          const state = nodeStates[nodeId]
          if (node.type === 'stop' && state.treatAnyway) {
            return (
              <ListItem key={nodeId}>
                <ListItemText primary='Decision: Treat Anyway despite recommendations' />
              </ListItem>
            )
          }
          //   console.log('OMPathway', node, state)
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
        {node.actions.map(action => (
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

  const renderCriteriaNode = node => (
    <Box>
      <Typography variant='h6'>{node.content}</Typography>
      {node.criteria.map((criterion, index) => (
        <Typography key={index}>{criterion}</Typography>
      ))}
      <Button onClick={() => handleNextNode(node.nextNodeIdIfTrue)}>Yes</Button>
      <Button onClick={() => handleNextNode(node.nextNodeIdIfFalse)}>No</Button>
    </Box>
  )

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

export default OMPathway
