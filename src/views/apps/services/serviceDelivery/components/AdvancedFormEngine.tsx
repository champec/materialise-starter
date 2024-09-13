import React, { useState, useEffect } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  FormHelperText,
  Grid,
  FormGroup,
  Checkbox,
  styled
} from '@mui/material'
//custom component
import SymptomChecklist from './CustomFormFields/SymptomChecklist'
import CodeSelect from './CustomFormFields/CodeSelect'
import GateWayNotMet from './CustomFormFields/GateWayNotMet'
import NEWS2Calculator from './CustomFormFields/NEWS2Calculator'
import ReferralComponent from './CustomFormFields/ReferralComponent'
import ChooseOutcome from './CustomFormFields/ChooseOutcome'
import ReviewComponent from './CustomFormFields/ReviewComponent'
import MedicineSupplied from './CustomFormFields/MedicineSupplied'
import SafetyNettingChecklist from './CustomFormFields/SafetyNettingChecklist'
import FeverPainCalculator from './CustomFormFields/FeverPainCalculator'
import TargetRTI from './CustomFormFields/TargetRTI'
import AdviceForm from './CustomFormFields/AdviceForm'
import BloodPressureInput from './CustomFormFields/BloodPressureInput'
import CustomDatePicker from './CustomFormFields/CustomDatePicker'
import ABPMInput from './CustomFormFields/ABPMInput'
import CustomNMSIntervention from './CustomFormFields/CustomNMSIntervention'
import CustomNMSEngagement from './CustomFormFields/CustomNMSEngagement'
import CustomNMSFollowUp from './CustomFormFields/CustomNMSFollowup'
import SimpleMedicineSelect from './CustomFormFields/SimpleMedicineSelect'
import BiometricMeasurements from './CustomFormFields/BiometricMeasurements'
// Add these interfaces
interface ProgressionCriteria {
  type: 'allYes' | 'allNo' | 'someYes' | 'any'
  count?: number
}

interface FormField {
  type: 'text' | 'select' | 'radio' | 'custom' | 'hidden' | 'checkbox'
  question: string
  options?: string[]
  required?: boolean
  component?: React.ComponentType<any> | 'SymptomChecklist'
  validate?: (value: any) => string | null
  progressionCriteria?: ProgressionCriteria
  label: string
  autoProgress?: boolean // New property
}

interface FormNode {
  id: string
  field: FormField
  next: (answer: any) => { nextId: string | null; data?: any } | null
  isEndNode?: boolean
  isStopNode?: boolean
  returnTo?: string
  hidden?: boolean
}

interface FormDefinition {
  name: string
  startNode: string
  nodes: Record<string, FormNode>
}

type CustomComponentType = React.ComponentType<any> | 'SymptomChecklist'

interface AdvancedFormEngineProps {
  formDefinition: FormDefinition
  initialData?: Record<string, any>
  onSubmit: (formData: Record<string, any>) => void
  onSaveProgress: (formData: Record<string, any>) => void
}

// Ensure your SymptomChecklist component is typed correctly
interface SymptomChecklistProps {
  id: string
  value: Record<string, boolean>
  onChange: (value: Record<string, boolean>) => void
  error?: string
  options: string[]
  question: string
  progressionCriteria?: ProgressionCriteria
}

//styled components

const FixedHeightContainer = styled(Paper)(({ theme }) => ({
  maxHeight: '800px', // Adjust this value as needed
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}))

const ScrollableContent = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '16px'
})

const StickyFooter = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between'
}))

const AdvancedFormEngine: React.FC<AdvancedFormEngineProps> = ({
  formDefinition,
  initialData = {},
  onSubmit,
  onSaveProgress,
  formData,
  setFormData,
  currentNodeId,
  setCurrentNodeId,
  history,
  setHistory,
  isLocked,
  setIsLocked,
  errors,
  setErrors,
  sharedData,
  isQuickService
}) => {
  console.log('FORM DEFINITION', { isQuickService, formDefinition, currentNodeId })
  // const [currentNodeId, setCurrentNodeId] = useState(formDefinition.startNode)
  //const [formData, setFormData] = useState<Record<string, any>>(initialData) //! make sure to add external formdata state in service delivery aswel
  // const [history, setHistory] = useState<string[]>([formDefinition.startNode])
  // const [errors, setErrors] = useState<Record<string, string>>({})
  // const [isLocked, setIsLocked] = useState(false)

  const visibleHistory = getVisibleHistory(history, formDefinition)

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData)
      const reconstructedHistory = reconstructHistory(formDefinition, initialData)
      setHistory(reconstructedHistory)
      setCurrentNodeId(reconstructedHistory[reconstructedHistory.length - 1])
    }
  }, [initialData, formDefinition])

  const currentNode = formDefinition.nodes[currentNodeId]

  // Update handleAnswer function to work with the new SymptomChecklist
  const handleAnswer = (answer: any) => {
    console.log('HANDLE ANSWER FIRED')
    const oldAnswer = formData[currentNodeId]
    const answerChanged = JSON.stringify(oldAnswer) !== JSON.stringify(answer)

    if (!answerChanged) {
      // If the answer hasn't changed, don't do anything
      return
    }
    console.log('HANDLE ANSWER FIRED answer', oldAnswer, answerChanged)
    // Update form data
    const newFormData = {
      ...formData,
      [currentNodeId]: answer
    }

    // Determine the new path
    const result = typeof currentNode.next === 'function' ? currentNode.next(answer) : currentNode.next
    let newNextNode: string | null = null
    let data: any = undefined

    if (typeof result === 'object' && result !== null) {
      newNextNode = result.nextId
      data = result.data
    } else {
      newNextNode = result
    }

    const oldResult =
      oldAnswer !== undefined
        ? typeof currentNode.next === 'function'
          ? currentNode.next(oldAnswer)
          : currentNode.next
        : null
    let oldNextNode: string | null = null

    if (typeof oldResult === 'object' && oldResult !== null) {
      oldNextNode = oldResult.nextId
    } else {
      oldNextNode = oldResult
    }

    console.log('HANDLE ANSWER FIRED node', newNextNode, oldNextNode)
    // If the path has changed, update history and clear irrelevant data
    if (newNextNode !== oldNextNode) {
      // Find the index of the current node in the history
      const currentIndex = history.indexOf(currentNodeId)

      // Create new history, removing future nodes
      const newHistory = history.slice(0, currentIndex + 1)

      // If the new next node isn't already in the history, add it
      if (newNextNode && !newHistory.includes(newNextNode)) {
        newHistory.push(newNextNode)
      }

      // Remove data for nodes that are no longer in the history
      Object.keys(newFormData).forEach(key => {
        if (!newHistory.includes(key) && key !== currentNodeId) {
          delete newFormData[key]
        }
      })

      // Update state
      setFormData(newFormData)
      setHistory(newHistory)
    } else {
      // If the path hasn't changed, just update form data
      setFormData(newFormData)
    }

    // Clear any errors for this field
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors }
      delete newErrors[currentNodeId]
      return newErrors
    })

    // Handle auto-progress if enabled
    if (currentNode.field.autoProgress && newNextNode) {
      setCurrentNodeId(newNextNode)
      setIsLocked(formDefinition.nodes[newNextNode].isStopNode || false)
    }

    // Update the form data with the data returned from the next function
    if (data) {
      setFormData(prevFormData => ({
        ...prevFormData,
        [newNextNode]: {
          ...prevFormData[newNextNode],
          __contextData: data
        }
      }))
    }
  }

  const handleAutoProgress = (answer: any) => {
    const error = validateField(currentNode.field, answer)
    if (error) {
      setErrors({ ...errors, [currentNodeId]: error })
      return
    }

    const result = typeof currentNode.next === 'function' ? currentNode.next(answer) : currentNode.next
    let nextId: string | null = null
    let data: any = undefined

    if (typeof result === 'string' || result === null) {
      nextId = result
    } else {
      nextId = result.nextId
      data = result.data
    }

    if (nextId) {
      const newHistory = [...history, nextId]
      setHistory(newHistory)

      const newFormData = { ...formData, [currentNodeId]: answer }
      if (data) {
        newFormData[nextId] = { ...newFormData[nextId], __contextData: data }
      }

      setFormData(newFormData)
      setCurrentNodeId(nextId)
      setIsLocked(formDefinition.nodes[nextId].isStopNode || false)
    }
  }

  const handleNext = () => {
    const error = validateField(currentNode.field, formData[currentNodeId])
    if (error) {
      setErrors({ ...errors, [currentNodeId]: error })
      return
    }

    const result = typeof currentNode.next === 'function' ? currentNode.next(formData[currentNodeId]) : currentNode.next
    let nextId: string | null = null

    if (typeof result === 'string' || result === null) {
      nextId = result
    } else {
      nextId = result.nextId
    }

    console.log('NEXT ID', nextId)
    if (nextId) {
      setCurrentNodeId(nextId)
      setIsLocked(formDefinition.nodes[nextId].isStopNode || false)
    } else {
      setIsLocked(false)
    }
  }

  const moveToNextNode = (nextNodeId: string, preservedFormData: Record<string, any>) => {
    let currentNodeId = nextNodeId

    // Handle hidden nodes
    while (formDefinition.nodes[currentNodeId].field.type === 'hidden') {
      const hiddenNode = formDefinition.nodes[currentNodeId]
      const nextHiddenNodeId = hiddenNode.next(preservedFormData[currentNodeId])
      if (nextHiddenNodeId) {
        setHistory(prevHistory => {
          if (!prevHistory.includes(nextHiddenNodeId)) {
            return [...prevHistory, nextHiddenNodeId]
          }
          return prevHistory
        })
        currentNodeId = nextHiddenNodeId
      } else {
        break
      }
    }

    setCurrentNodeId(currentNodeId)
    setIsLocked(formDefinition.nodes[currentNodeId].isStopNode || false)
    setFormData(preservedFormData)
  }

  const validateAndNavigate = (targetNodeId: string) => {
    const currentError = validateField(currentNode.field, formData[currentNodeId])
    if (currentError) {
      setErrors(prevErrors => ({ ...prevErrors, [currentNodeId]: currentError }))
      return false
    }

    // Clear the error for the current field if it was previously set
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors }
      delete newErrors[currentNodeId]
      return newErrors
    })

    setCurrentNodeId(targetNodeId)
    return true
  }

  const handleNavigation = (nodeId: string) => {
    if (!isLocked || nodeId === formDefinition.nodes[currentNodeId].returnTo) {
      const targetIndex = visibleHistory.indexOf(nodeId)
      if (targetIndex !== -1) {
        const currentIndex = visibleHistory.indexOf(currentNodeId)

        // If moving forward, validate all steps in between
        if (targetIndex > currentIndex) {
          for (let i = currentIndex; i < targetIndex; i++) {
            if (!validateAndNavigate(visibleHistory[i])) {
              return // Stop if validation fails
            }
          }
        }

        validateAndNavigate(nodeId)
        setIsLocked(formDefinition.nodes[nodeId].isStopNode || false)
      }
    }
  }

  const handleBack = () => {
    if (isLocked) {
      const returnNodeId = formDefinition.nodes[currentNodeId].returnTo
      if (returnNodeId) {
        setCurrentNodeId(returnNodeId)
        setIsLocked(false)
      }
    } else {
      const currentIndex = visibleHistory.indexOf(currentNodeId)
      if (currentIndex > 0) {
        setCurrentNodeId(visibleHistory[currentIndex - 1])
      }
    }
  }

  const handleForward = () => {
    if (!isLocked) {
      const currentIndex = visibleHistory.indexOf(currentNodeId)
      if (currentIndex < visibleHistory.length - 1) {
        setCurrentNodeId(visibleHistory[currentIndex + 1])
      }
    }
  }

  const handleSubmit = () => {
    const newErrors = validateAllFields()
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    } else {
      setErrors(newErrors)
      const firstErrorId = Object.keys(newErrors)[0]
      const errorElement = document.getElementById(firstErrorId)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleSaveProgress = () => {
    onSaveProgress(formData)
  }

  // Update validateField function to handle SymptomChecklist validation
  const validateField = (field: FormField, value: any): string | null => {
    if (field.required) {
      if (!value) {
        return 'This field is required'
      }

      if (field.type === 'custom' && field.component === 'SymptomChecklist') {
        const allAnswered = Object.values(value).length === field.options?.length
        if (!allAnswered) {
          return 'Please answer all symptoms'
        }

        const { progressionCriteria } = field
        const yesCount = Object.values(value).filter(v => v).length
        console.log('PROGRESSION CRITERIA', field)
        switch (progressionCriteria.type) {
          case 'allYes':
            if (yesCount !== field.options?.length) {
              return 'All symptoms must be present to proceed'
            }
            break
          case 'allNo':
            if (yesCount !== 0) {
              return 'No symptoms should be present to proceed'
            }
            break
          case 'someYes':
            if (yesCount < (progressionCriteria.count || 0)) {
              return `At least ${progressionCriteria.count} symptom(s) must be present to proceed`
            }
          case 'any':
            // No validation needed for 'any' criteria
            break
        }
      } else if (!value) {
        return 'This field is required'
      }
    }

    if (field.validate) {
      return field.validate(value)
    }

    return null
  }

  const validateAllFields = (): Record<string, string> => {
    const newErrors: Record<string, string> = {}
    Object.entries(formDefinition.nodes).forEach(([nodeId, node]) => {
      if (node.field.type !== 'hidden') {
        const error = validateField(node.field, formData[nodeId])
        if (error) {
          newErrors[nodeId] = error
        }
      }
    })
    return newErrors
  }

  const renderField = (field: FormField) => {
    const error = errors[currentNodeId]

    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            id={currentNodeId}
            label={field.question}
            value={formData[currentNodeId] || ''}
            onChange={e => handleAnswer(e.target.value)}
            error={!!error}
            helperText={error}
            required={field.required}
            multiline={field?.multi}
            rows={field?.rows || 1}
          />
        )
      case 'select':
        return (
          <Box>
            <Select
              fullWidth
              id={currentNodeId}
              value={formData[currentNodeId] || ''}
              onChange={e => handleAnswer(e.target.value)}
              error={!!error}
              required={field.required}
            >
              {field.options?.map(option => (
                <MenuItem
                  key={typeof option === 'object' ? option.value : option}
                  value={typeof option === 'object' ? option.value : option}
                >
                  {typeof option === 'object' ? option.label : option}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        )
      case 'number':
        return (
          <TextField
            fullWidth
            id={currentNodeId}
            label={field.question}
            value={formData[currentNodeId] || ''}
            onChange={e => handleAnswer(e.target.value)}
            error={!!error}
            helperText={error}
            required={field.required}
            type='number'
          />
        )
      case 'radio':
        return (
          <Box>
            <RadioGroup
              id={currentNodeId}
              value={formData[currentNodeId] || ''}
              onChange={e => handleAnswer(e.target.value)}
            >
              {field.options?.map(option => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        )
      case 'checkbox':
        return (
          <SafetyNettingChecklist
            id={currentNodeId}
            value={formData[currentNodeId] || {}}
            onChange={(value: any) => handleAnswer(value)}
            error={error}
            options={field.options || []}
            question={field.question}
          />
        )
      case 'custom':
        if (field.component === 'SymptomChecklist') {
          return (
            <SymptomChecklist
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              options={field.options || []}
              question={field.question}
              progressionCriteria={field.progressionCriteria}
            />
          )
        }
        if (field.component === 'NMSInterventionDetails') {
          return (
            <CustomNMSIntervention
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              question={field.question}
              sharedData={sharedData}
            />
          )
        }
        if (field.component === 'NMSEngagementDetails') {
          return (
            <CustomNMSEngagement
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              question={field.question}
              __contextData={field.__contextData}
            />
          )
        }
        if (field.component === 'NMSFollowUpDetails') {
          return (
            <CustomNMSFollowUp
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              question={field.question}
              sharedData={sharedData}
            />
          )
        }
        if (field.component === 'BloodPressureInput') {
          return (
            <BloodPressureInput
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
            />
          )
        } else if (field.component === 'ABPMInput') {
          return (
            <ABPMInput
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              question={field.question}
            />
          )
        } else if (field.component === 'DatePicker') {
          return (
            <CustomDatePicker
              id={currentNodeId}
              value={formData[currentNodeId] || new Date()}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
            />
          )
        } else if (field.component === 'AdviceForm') {
          return (
            <AdviceForm
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              options={field.options || []}
              question={field.question}
              progressionCriteria={field.progressionCriteria}
            />
          )
        } else if (field.component === 'TargetRTI') {
          return (
            <TargetRTI
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              options={field.options || []}
              question={field.question}
              progressionCriteria={field.progressionCriteria}
            />
          )
        } else if (field.component === 'FeverPainCalculator') {
          return (
            <FeverPainCalculator
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              options={field.options || []}
              question={field.question}
              progressionCriteria={field.progressionCriteria}
            />
          )
        } else if (field.component === 'ReviewComponent') {
          return <ReviewComponent formData={formData} formDefinition={formDefinition} />
        } else if (field.component === 'Referral') {
          return (
            <Referral
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
            />
          )
        } else if (field.component === 'MedicineSupplied') {
          return (
            <MedicineSupplied
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              predefinedOptions={field.predefinedOptions || []}
            />
          )
        } else if (field.component === 'SimpleMedicineSelect') {
          return (
            <SimpleMedicineSelect
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              predefinedOptions={field?.predefinedOptions || []}
            />
          )
        } else if (field.component === 'BiometricMeasurements') {
          return (
            <BiometricMeasurements
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              question={field.question}
            />
          )
        } else if (field.component === 'CodeSelect') {
          return (
            <CodeSelect
              id={currentNodeId}
              label={field.label}
              value={formData[currentNodeId] || ''}
              onChange={value => handleAnswer(value)}
              error={error}
              options={field?.options || []}
            />
          )
        } else if (field.component === 'NEWS2Calculator') {
          return (
            <NEWS2Calculator
              id={currentNodeId}
              label={field.label}
              value={formData[currentNodeId] || ''}
              onChange={value => handleAnswer(value)}
              error={error}
              options={field?.options || []}
            />
          )
        } else if (field.component === 'ReferralComponent') {
          return (
            <ReferralComponent
              id={currentNodeId}
              label={field.label}
              value={formData[currentNodeId] || ''}
              onChange={value => handleAnswer(value)}
              error={error}
              options={field?.options || []}
            />
          )
        } else if (field.component === 'ChooseOutcome') {
          return (
            <ChooseOutcome
              id={currentNodeId}
              label={field.label}
              value={formData[currentNodeId] || ''}
              onChange={value => handleAnswer(value)}
              error={error}
              options={field?.options || []}
              consultationOutcomes={field.consultationOutcomes}
            />
          )
        } else if (field.component === 'GateWayNotMet') {
          return (
            <GateWayNotMet
              id={currentNodeId}
              label={field.label}
              value={formData[currentNodeId] || ''}
              onChange={value => handleAnswer(value)}
              error={error}
              options={field.options || []}
            />
          )
        } else if (typeof field.component === 'function') {
          const CustomComponent = field.component
          return (
            <CustomComponent
              id={currentNodeId}
              value={formData[currentNodeId] || {}}
              onChange={(value: any) => handleAnswer(value)}
              error={error}
              options={field.options || []}
              question={field.question}
              progressionCriteria={field.progressionCriteria}
            />
          )
        }
        return null

        return null
      case 'hidden':
        return null
      default:
        return null
    }
  }

  const isCurrentNodeEndNode = () => {
    return currentNode.isEndNode
    //|| currentNode.next(formData[currentNodeId]) === null
  }

  const canSubmitFromCurrentNode = () => {
    return isCurrentNodeEndNode() || currentNode.isStopNode
  }

  const isFormComplete = () => {
    return Object.keys(formDefinition.nodes).every(nodeId => {
      const node = formDefinition.nodes[nodeId]
      console.log('NODES', node, nodeId)
      return node.field.type === 'hidden' || !node.field.required || formData[nodeId] !== undefined
    })
  }
  // const visibleHistory = history.filter(nodeId => formDefinition.nodes[nodeId].field.type !== 'hidden')
  // const visibleHistory = getVisibleHistory(history, formDefinition)

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Stepper activeStep={visibleHistory.indexOf(currentNodeId)} orientation='vertical'>
          {visibleHistory.map((nodeId, index) => {
            const nodeKey = typeof nodeId === 'object' ? nodeId.nextId : nodeId
            const node = formDefinition.nodes[nodeKey]

            return (
              <Step key={nodeId}>
                <StepLabel
                  error={!!errors[nodeId]}
                  onClick={() => handleNavigation(nodeId)}
                  style={{
                    cursor:
                      isLocked && nodeId !== formDefinition.nodes[currentNodeId].returnTo ? 'not-allowed' : 'pointer'
                  }}
                >
                  {formDefinition.nodes[nodeKey].field.question}
                </StepLabel>
                <StepContent>
                  <Typography variant='body2'>{formData[nodeId] ? 'Answered' : 'Not answered'}</Typography>
                </StepContent>
              </Step>
            )
          })}
        </Stepper>
      </Grid>
      <Grid item xs={9}>
        <FixedHeightContainer elevation={3}>
          <ScrollableContent>
            <Typography variant='h6' gutterBottom>
              {currentNode.field.question}
            </Typography>
            {renderField(currentNode.field)}
          </ScrollableContent>
          <StickyFooter>
            <Button onClick={handleBack} disabled={visibleHistory.indexOf(currentNodeId) === 0}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={isLocked || currentNode.isStopNode}>
              {currentNode.isStopNode ? 'Continue' : 'Next'}
            </Button>
          </StickyFooter>
        </FixedHeightContainer>
        {!isQuickService && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleSaveProgress} variant='outlined' sx={{ mr: 1 }}>
              Save Progress
            </Button>
            <Button
              onClick={handleSubmit}
              variant='contained'
              disabled={!canSubmitFromCurrentNode() && !isFormComplete()}
            >
              Submit
            </Button>
          </Box>
        )}
      </Grid>
    </Grid>
  )
}

const getVisibleHistory = (history: string[], formDefinition: FormDefinition): string[] => {
  return history.filter(nodeId => !formDefinition.nodes[nodeId]?.hidden)
}

// Helper function to reconstruct history based on initial data

const reconstructHistory = (formDefinition: FormDefinition, initialData: Record<string, any>): string[] => {
  let history = [formDefinition.startNode]
  let currentNodeId = formDefinition.startNode

  console.log('Starting reconstructHistory with initialData:', initialData)

  while (true) {
    const currentNode = formDefinition.nodes[currentNodeId]
    const answer = initialData[currentNodeId]
    console.log(`Processing node: ${currentNodeId}, answer:`, answer)

    if (!currentNode) {
      console.error(`Node not found: ${currentNodeId}`)
      break
    }

    try {
      const nextResult = typeof currentNode.next === 'function' ? currentNode.next(answer) : currentNode.next
      console.log(`Next result:`, nextResult)

      if (!nextResult) {
        console.log('Reached end of form')
        break
      }

      let nextNodeId
      if (typeof nextResult === 'object' && nextResult.nextId) {
        nextNodeId = nextResult.nextId
      } else if (typeof nextResult === 'string') {
        nextNodeId = nextResult
      } else {
        console.error(`Invalid next result:`, nextResult)
        break
      }

      console.log(`Next node: ${nextNodeId}`)

      if (!nextNodeId) break

      history.push(nextNodeId)
      currentNodeId = nextNodeId
    } catch (error) {
      console.error(`Error in node ${currentNodeId}:`, error)
      break
    }
  }

  console.log('Reconstructed history:', history)
  return history
}

export default AdvancedFormEngine
