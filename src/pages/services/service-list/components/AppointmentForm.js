import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Chip,
  Tooltip,
  styled,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import CustomAutoCompleteInput from 'src/views/apps/Calendar/services/pharmacy-first/CustomAutoComplete'
import IconifyIcon from 'src/@core/components/icon'
import PatientPreview from './PatientPreview'
import useGPSearch from '../hooks/useGPSearch'
import GPSearchDialog from './GPSearchDialog'
import GPPreview from './GPPreview'
import TriageSection from './TriageSection' // Import the new TriageSection component

// Styled FormControl to adjust label positioning
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-outlined': {
    backgroundColor: theme.palette.background.paper,
    padding: '0 8px',
    marginLeft: '-6px'
  }
}))

// Styled DateTimePicker to ensure full width
const StyledDateTimePicker = styled(DateTimePicker)({
  width: '100%'
})

// Custom component to display selected value with icon
const SelectedValue = ({ value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <IconifyIcon icon={value === 'remote-video' ? 'mdi:video' : 'mdi:account'} />
    <Typography sx={{ ml: 1 }}>{value === 'remote-video' ? 'Remote Video' : 'In-Person'}</Typography>
  </Box>
)

const AppointmentForm = ({
  appointment,
  formData,
  services,
  serviceStages,
  selectedPatient,
  patientInputValue,
  onPatientSelect,
  onPatientInputChange,
  onEditPatient,
  onServiceChange,
  onFieldChange,
  onDateChange,
  onSubmit,
  onNhsPatientFetch,
  onNewPatientDialogOpen,
  setSelectedPatient,
  setPatientInputValue,
  selectedGP,
  setGpSearchTerm,
  handleRemoveGP,
  setGpDialogOpen,
  gpDialogOpen,
  handleCheckboxChange
}) => {
  useEffect(() => {
    // Reset triage data when service or stage changes
    if (formData.service_id !== 'pharmacy_first' || !formData.current_stage_id) {
      onFieldChange({
        target: {
          name: 'details.triage',
          value: {}
        }
      })
    }
  }, [formData.service_id, formData.current_stage_id])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: 400, p: 3 }}>
        <Typography variant='h6' gutterBottom>
          {appointment ? 'Edit Appointment' : 'New Appointment'}
        </Typography>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            {selectedPatient ? (
              <Grid item xs={12}>
                <PatientPreview
                  patient={selectedPatient}
                  onEdit={onEditPatient}
                  setSelectedPatient={setSelectedPatient}
                  setPatientInputValue={setPatientInputValue}
                />
              </Grid>
            ) : (
              <Grid item xs={12} container alignItems='center'>
                <Grid item xs={11}>
                  <CustomAutoCompleteInput
                    onSelect={onPatientSelect}
                    value={patientInputValue}
                    setValue={onPatientInputChange}
                    placeHolder={'Search for a patient'}
                    tableName={'patients'}
                    displayField={'full_name'}
                    onAdd={onNewPatientDialogOpen}
                    label='Search or add patient'
                    searchVector={'name_search_vector'}
                    displayFields={['full_name', 'address', 'dob']}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={onNhsPatientFetch}>
                    <IconifyIcon icon='mdi:database-search' />
                  </IconButton>
                </Grid>
              </Grid>
            )}

            {/* GP Selection */}
            <Grid item xs={12}>
              {selectedGP ? (
                <GPPreview
                  gp={selectedGP}
                  onEdit={() => setGpDialogOpen(true)}
                  setSelectedGP={handleRemoveGP}
                  setGPInputValue={setGpSearchTerm}
                />
              ) : (
                <Button onClick={() => setGpDialogOpen(true)} variant='outlined' fullWidth>
                  Find GP
                </Button>
              )}
            </Grid>

            <Grid item xs={12}>
              <StyledFormControl fullWidth variant='outlined'>
                <InputLabel id='service-label'>Service</InputLabel>
                <Select
                  labelId='service-label'
                  name='service_id'
                  value={formData.service_id}
                  onChange={onServiceChange}
                  label='Service'
                  required
                >
                  {services.map(service => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12}>
              <StyledFormControl fullWidth variant='outlined'>
                <InputLabel id='appointment-type-label'>Appointment Type</InputLabel>
                <Select
                  labelId='appointment-type-label'
                  id='appointment-type'
                  value={formData.appointment_type || ''}
                  onChange={onFieldChange}
                  name='appointment_type'
                  label='Appointment Type'
                  renderValue={value => <SelectedValue value={value} />}
                  required
                >
                  <MenuItem value='remote-video'>
                    <ListItemIcon>
                      <IconifyIcon icon='mdi:video' />
                    </ListItemIcon>
                    <ListItemText primary='Remote Video' />
                  </MenuItem>
                  <MenuItem value='in-person'>
                    <ListItemIcon>
                      <IconifyIcon icon='mdi:account' />
                    </ListItemIcon>
                    <ListItemText primary='In-Person' />
                  </MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12}>
              <StyledFormControl fullWidth variant='outlined'>
                <InputLabel>Overall Status</InputLabel>
                <Select name='overall_status' value={formData.overall_status} onChange={onFieldChange} required>
                  <MenuItem value='Scheduled'>Scheduled</MenuItem>
                  <MenuItem value='In Progress'>In Progress</MenuItem>
                  <MenuItem value='Completed'>Completed</MenuItem>
                  <MenuItem value='Cancelled'>Cancelled</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12}>
              <Tooltip title={!formData.service_id ? 'Please select a service first' : ''}>
                <span>
                  <StyledFormControl fullWidth variant='outlined'>
                    <InputLabel>Current Stage</InputLabel>
                    <Select
                      name='current_stage_id'
                      value={formData.current_stage_id}
                      onChange={onFieldChange}
                      required
                      disabled={!formData.service_id}
                    >
                      {serviceStages.map(stage => (
                        <MenuItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </StyledFormControl>
                </span>
              </Tooltip>
            </Grid>

            {formData.service_id === '5a499835-7a49-43b6-9de5-6b492baf12d9' && formData.current_stage_id && (
              <Grid item xs={12}>
                <TriageSection stageId={formData.current_stage_id} formData={formData} onFieldChange={onFieldChange} />
              </Grid>
            )}

            <Grid item xs={12}>
              <StyledDateTimePicker
                label='Scheduled Time'
                value={formData.scheduled_time}
                onChange={onDateChange}
                renderInput={params => <TextField {...params} fullWidth required />}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name='details.additional_details'
                label='Additional Details'
                multiline
                rows={4}
                value={formData.details.additional_details || ''}
                onChange={onFieldChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.details.acceptTerms || false}
                    onChange={handleCheckboxChange}
                    name='details.acceptTerms'
                  />
                }
                label='I accept all usage terms and conditions'
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.details.sendTextUpdate || false}
                    onChange={handleCheckboxChange}
                    name='details.sendTextUpdate'
                  />
                }
                label='Send a text message with this update'
              />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained' color='primary' fullWidth>
                {appointment ? 'Update Appointment' : 'Create Appointment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </LocalizationProvider>
  )
}

export default AppointmentForm
