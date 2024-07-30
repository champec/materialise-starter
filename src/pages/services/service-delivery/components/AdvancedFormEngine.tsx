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
  Grid
} from '@mui/material'

interface FormField {
  type: 'text' | 'select' | 'radio' | 'custom' | 'hidden'
  question: string
  options?: string[]
  required?: boolean
  component?: React.ComponentType<any>
  validate?: (value: any) => string | null
}

interface FormNode {
  id: string
  field: FormField
  next: (answer: any) => string | null
  isStopNode?: boolean
  returnTo?: string
}

interface FormDefinition {
  name: string
  startNode: string
  nodes: Record<string, FormNode>
}

interface AdvancedFormEngineProps {
  formDefinition: FormDefinition
  initialData?: Record<string, any>
  onSubmit: (formData: Record<string, any>) => void
  onSaveProgress: (formData: Record<string, any>) => void
}

const SafetyNettingChecklist = ({ id, value, onChange, error, options, question }) => {
  const [checkedItems, setCheckedItems] = useState(value || {})

  const handleChange = event => {
    const newCheckedItems = {
      ...checkedItems,
      [event.target.name]: event.target.checked
    }
    setCheckedItems(newCheckedItems)
    onChange(newCheckedItems)
  }

  const handleCheckAll = () => {
    const allChecked = options.reduce((acc, option) => {
      acc[option] = true
      return acc
    }, {})
    setCheckedItems(allChecked)
    onChange(allChecked)
  }

  const handleUncheckAll = () => {
    const allUnchecked = options.reduce((acc, option) => {
      acc[option] = false
      return acc
    }, {})
    setCheckedItems(allUnchecked)
    onChange(allUnchecked)
  }

  return (
    <Box>
      <FormGroup>
        {options.map(option => (
          <FormControlLabel
            key={option}
            control={<Checkbox checked={checkedItems[option] || false} onChange={handleChange} name={option} />}
            label={option}
          />
        ))}
      </FormGroup>
      <Box mt={2}>
        <Button variant='outlined' onClick={handleCheckAll} sx={{ mr: 1 }}>
          Check All
        </Button>
        <Button variant='outlined' onClick={handleUncheckAll}>
          Uncheck All
        </Button>
      </Box>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  )
}

const AdvancedFormEngine: React.FC<AdvancedFormEngineProps> = ({
  formDefinition,
  initialData = {},
  onSubmit,
  onSaveProgress
}) => {
  const [currentNodeId, setCurrentNodeId] = useState(formDefinition.startNode)
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [history, setHistory] = useState<string[]>([formDefinition.startNode])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLocked, setIsLocked] = useState(false)

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
    setFormData(prevData => ({
      ...prevData,
      [currentNodeId]: answer
    }))
  }

  const handleNext = () => {
    const error = validateField(currentNode.field, formData[currentNodeId])
    if (error) {
      setErrors({ ...errors, [currentNodeId]: error })
      return
    }

    const nextNodeId = currentNode.next(formData[currentNodeId])
    if (nextNodeId) {
      // Find the last decision point
      const currentIndex = history.indexOf(currentNodeId)
      let lastDecisionPointIndex = currentIndex

      for (let i = currentIndex; i >= 0; i--) {
        const node = formDefinition.nodes[history[i]]
        if (Object.keys(node.next({})).length > 1) {
          lastDecisionPointIndex = i
          break
        }
      }

      // Remove answers and history after the last decision point
      const newHistory = history.slice(0, lastDecisionPointIndex + 1)
      if (!newHistory.includes(nextNodeId)) {
        newHistory.push(nextNodeId)
      }

      setHistory(newHistory)

      // Remove form data for removed nodes
      const preservedFormData = {}
      newHistory.forEach(nodeId => {
        if (formData[nodeId] !== undefined) {
          preservedFormData[nodeId] = formData[nodeId]
        }
      })

      setFormData(preservedFormData)
      setCurrentNodeId(nextNodeId)
      setIsLocked(formDefinition.nodes[nextNodeId].isStopNode || false)
    } else {
      // If there's no next node, we might be at the end of the form
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
  const handleNavigation = (nodeId: string) => {
    if (!isLocked || nodeId === formDefinition.nodes[currentNodeId].returnTo) {
      const targetIndex = visibleHistory.indexOf(nodeId)
      if (targetIndex !== -1) {
        // Only navigate to nodes that are in the current history
        setCurrentNodeId(nodeId)
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
      if (field.type === 'custom' && field.component === 'SymptomChecklist') {
        const allAnswered = Object.values(value).length === field.options?.length
        if (!allAnswered) {
          return 'Please answer all symptoms'
        }

        const { progressionCriteria } = field
        const yesCount = Object.values(value).filter(v => v).length

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
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
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
        if (field.component) {
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
      case 'hidden':
        return null
      default:
        return null
    }
  }

  const isCurrentNodeEndNode = () => {
    return currentNode.isEndNode || currentNode.next(formData[currentNodeId]) === null
  }

  const canSubmitFromCurrentNode = () => {
    return isCurrentNodeEndNode() || currentNode.isStopNode
  }

  const isFormComplete = () => {
    return Object.keys(formDefinition.nodes).every(nodeId => {
      const node = formDefinition.nodes[nodeId]
      return node.field.type === 'hidden' || !node.field.required || formData[nodeId] !== undefined
    })
  }
  // const visibleHistory = history.filter(nodeId => formDefinition.nodes[nodeId].field.type !== 'hidden')
  // const visibleHistory = getVisibleHistory(history, formDefinition)

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Stepper activeStep={visibleHistory.indexOf(currentNodeId)} orientation='vertical'>
          {visibleHistory.map((nodeId, index) => (
            <Step key={nodeId}>
              <StepLabel
                error={!!errors[nodeId]}
                onClick={() => handleNavigation(nodeId)}
                style={{
                  cursor:
                    isLocked && nodeId !== formDefinition.nodes[currentNodeId].returnTo ? 'not-allowed' : 'pointer'
                }}
              >
                {formDefinition.nodes[nodeId].field.question}
              </StepLabel>
              <StepContent>
                <Typography variant='body2'>{formData[nodeId] ? 'Answered' : 'Not answered'}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Grid item xs={9}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant='h6' gutterBottom>
            {currentNode.field.question}
          </Typography>
          {renderField(currentNode.field)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button onClick={handleBack} disabled={visibleHistory.indexOf(currentNodeId) === 0}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={isLocked && !currentNode.isStopNode}>
              {currentNode.isStopNode ? 'Continue' : 'Next'}
            </Button>
          </Box>
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
        </Paper>
      </Grid>
    </Grid>
  )
}

const getVisibleHistory = (history: string[], formDefinition: FormDefinition): string[] => {
  return history.filter(nodeId => !formDefinition.nodes[nodeId].hidden)
}

// Helper function to reconstruct history based on initial data
const reconstructHistory = (formDefinition: FormDefinition, initialData: Record<string, any>): string[] => {
  let history = [formDefinition.startNode]
  let currentNodeId = formDefinition.startNode

  while (true) {
    const currentNode = formDefinition.nodes[currentNodeId]
    const answer = initialData[currentNodeId]
    const nextNodeId = currentNode.next(answer)

    if (!nextNodeId) break

    history.push(nextNodeId)
    currentNodeId = nextNodeId
  }

  return history
}

export default AdvancedFormEngine
