import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { useSelector } from 'react-redux'

const CustomServiceCreator = ({ initialService = null, onSave }) => {
  const [service, setService] = useState({
    name: '',
    abbreviation: '',
    description: '',
    multi: false,
    stages: [{ name: '', description: '', fields: [] }]
  })
  const orgId = useSelector(state => state.organisation.organisation.id)
  const userId = useSelector(state => state.user.user.id)
  const [isLoading, setIsLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    if (initialService) {
      setService(initialService)
    }
  }, [initialService])

  const handleServiceChange = e => {
    const { name, value } = e.target
    setService(prev => ({ ...prev, [name]: value }))
  }

  const handleStageChange = (index, e) => {
    const { name, value } = e.target
    setService(prev => {
      const newStages = [...prev.stages]
      newStages[index] = { ...newStages[index], [name]: value }
      return { ...prev, stages: newStages }
    })
  }

  const addStage = () => {
    setService(prev => ({
      ...prev,
      stages: [...prev.stages, { name: '', description: '', fields: [] }]
    }))
  }

  const removeStage = index => {
    setService(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }))
  }

  const addField = stageIndex => {
    setService(prev => {
      const newStages = [...prev.stages]
      newStages[stageIndex].fields.push({ type: 'text', label: '', required: false })
      return { ...prev, stages: newStages }
    })
  }

  const handleFieldChange = (stageIndex, fieldIndex, e) => {
    const { name, value, type, checked } = e.target
    setService(prev => {
      const newStages = [...prev.stages]
      const field = newStages[stageIndex].fields[fieldIndex]

      if (name === 'type' && value === 'select' && !field.options) {
        field.options = []
      }

      field[name] = type === 'checkbox' ? checked : value

      return { ...prev, stages: newStages }
    })
  }

  const removeField = (stageIndex, fieldIndex) => {
    setService(prev => {
      const newStages = [...prev.stages]
      newStages[stageIndex].fields = newStages[stageIndex].fields.filter((_, i) => i !== fieldIndex)
      return { ...prev, stages: newStages }
    })
  }

  const addOption = (stageIndex, fieldIndex) => {
    setService(prev => {
      const newStages = [...prev.stages]
      const field = newStages[stageIndex].fields[fieldIndex]
      field.options = [...(field.options || []), '']
      return { ...prev, stages: newStages }
    })
  }

  const handleOptionChange = (stageIndex, fieldIndex, optionIndex, value) => {
    setService(prev => {
      const newStages = [...prev.stages]
      newStages[stageIndex].fields[fieldIndex].options[optionIndex] = value
      return { ...prev, stages: newStages }
    })
  }

  const removeOption = (stageIndex, fieldIndex, optionIndex) => {
    setService(prev => {
      const newStages = [...prev.stages]
      newStages[stageIndex].fields[fieldIndex].options.splice(optionIndex, 1)
      return { ...prev, stages: newStages }
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const result = await onSave(service, orgId, userId, initialService)
      setSnackbar({
        open: true,
        message: initialService ? 'Service updated successfully' : 'Service created successfully',
        severity: 'success'
      })
      console.log('result', result)
    } catch (error) {
      console.error('Error saving service:', error)
      setSnackbar({
        open: true,
        message: 'Error saving service. Please try again.',
        severity: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
      <Typography variant='h4' gutterBottom>
        {/* Create Custom Service */}
        {initialService ? (
          <>
            edit{' '}
            <span
              style={{
                textTransform: 'capitalize',
                fontVariant: 'small-caps',
                fontWeight: 'bold',
                fontStyle: 'italic'
              }}
            >
              {service.name}
            </span>{' '}
            service
          </>
        ) : (
          'create custom service'
        )}
      </Typography>

      <TextField
        fullWidth
        label='Service Name'
        name='name'
        value={service.name}
        onChange={handleServiceChange}
        margin='normal'
      />

      <TextField
        fullWidth
        label='Abbreviation'
        name='abbreviation'
        value={service.abbreviation}
        onChange={handleServiceChange}
        margin='normal'
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label='Description'
        name='description'
        value={service.description}
        onChange={handleServiceChange}
        margin='normal'
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={service.multi}
            onChange={e => setService(prev => ({ ...prev, multi: e.target.checked }))}
            name='multi'
          />
        }
        label='Multi-stage service'
      />

      {service.stages.map((stage, stageIndex) => (
        <Box key={stageIndex} sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
          <Typography variant='h6'>Stage {stageIndex + 1}</Typography>

          <TextField
            fullWidth
            label='Stage Name'
            name='name'
            value={stage.name}
            onChange={e => handleStageChange(stageIndex, e)}
            margin='normal'
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label='Stage Description'
            name='description'
            value={stage.description}
            onChange={e => handleStageChange(stageIndex, e)}
            margin='normal'
          />

          <Typography variant='subtitle1' sx={{ mt: 2 }}>
            Fields
          </Typography>

          {stage.fields.map((field, fieldIndex) => (
            <Box key={fieldIndex} sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  value={field.type}
                  onChange={e => handleFieldChange(stageIndex, fieldIndex, e)}
                  name='type'
                  sx={{ mr: 1, minWidth: 120 }}
                >
                  <MenuItem value='text'>Text</MenuItem>
                  <MenuItem value='select'>Select</MenuItem>
                </Select>

                <TextField
                  multiline
                  rows={2}
                  label='Field Label'
                  name='label'
                  value={field.label}
                  onChange={e => handleFieldChange(stageIndex, fieldIndex, e)}
                  sx={{ flexGrow: 1, mr: 1 }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.required}
                      onChange={e => handleFieldChange(stageIndex, fieldIndex, e)}
                      name='required'
                    />
                  }
                  label='Required'
                />

                <IconButton onClick={() => removeField(stageIndex, fieldIndex)}>
                  <Icon icon='mdi:minus' />
                </IconButton>
              </Box>

              {field.type === 'select' && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {field.options?.map((option, optionIndex) => (
                    <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={
                          <TextField
                            value={option}
                            onChange={e => handleOptionChange(stageIndex, fieldIndex, optionIndex, e.target.value)}
                            variant='standard'
                            InputProps={{
                              disableUnderline: true
                            }}
                            sx={{
                              input: {
                                padding: '0 8px',
                                width: '100%'
                              }
                            }}
                          />
                        }
                        onDelete={() => removeOption(stageIndex, fieldIndex, optionIndex)}
                        sx={{
                          width: '100%',
                          '& .MuiChip-label': {
                            width: '100%',
                            padding: 0
                          }
                        }}
                      />
                    </Box>
                  ))}
                  <Button
                    size='small'
                    onClick={() => addOption(stageIndex, fieldIndex)}
                    startIcon={<Icon icon='mdi:plus' />}
                  >
                    Add Option
                  </Button>
                </Box>
              )}
            </Box>
          ))}

          <Button startIcon={<Icon icon='mdi:plus' />} onClick={() => addField(stageIndex)} sx={{ mt: 2 }}>
            Add Field
          </Button>

          {service.multi && service.stages.length > 1 && (
            <Button color='error' onClick={() => removeStage(stageIndex)} sx={{ mt: 2, ml: 2 }}>
              Remove Stage
            </Button>
          )}
        </Box>
      ))}

      {service.multi && (
        <Button startIcon={<Icon icon='mdi:plus' />} onClick={addStage} sx={{ mt: 2 }}>
          Add Stage
        </Button>
      )}

      <Button variant='contained' onClick={handleSubmit} sx={{ mt: 4 }} disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} /> : initialService ? 'Update Service' : 'Create Service'}
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CustomServiceCreator
