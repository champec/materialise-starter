import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper
} from '@mui/material'
import { setSelectedPatient } from 'src/store/apps/drugdash/'
import { addBag } from '../../../store/apps/drugdash/ddThunks'
import { fetchPatients, fetchPatientMedications, fetchBagById } from '../../../store/apps/drugdash/ddThunks'
import { closeModal, openModal } from 'src/store/apps/drugdash/ddModals'
import { selectAllPatients, selectSelectedPatient } from 'src/store/apps/drugdash'

const NewBagModal = ({ bagId, onClose }) => {
  const dispatch = useDispatch()
  const patients = useSelector(selectAllPatients)
  const selectedPatient = useSelector(selectSelectedPatient)
  const patientMedications = useSelector(state => state.drugDash.patientMedications)

  const [patientSearchInput, setPatientSearchInput] = useState('')
  const [selectedMedications, setSelectedMedications] = useState([])
  const [selectedBag, setSelectedBag] = useState(null)

  useEffect(() => {
    dispatch(fetchPatients())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchPatients())
    if (bagId) {
      dispatch(fetchBagById(bagId)).then(action => {
        if (action.payload) {
          const bag = action.payload
          setSelectedBag(bag)
          dispatch(setSelectedPatient(bag.patient))
          dispatch(fetchPatientMedications(bag.patient_id))
          setPatientSearchInput('')
          setSelectedMedications(bag.selected_medicines || [])
          // setBagStatus(bag.status)
        }
      })
    }
  }, [dispatch, bagId])

  useEffect(() => {
    if (selectedPatient && !bagId) {
      dispatch(fetchPatientMedications(selectedPatient.id))
      setPatientSearchInput('') // Clear search input when a patient is selected
    }
  }, [dispatch, selectedPatient])

  const handlePatientSearch = (event, newValue, reason) => {
    if (reason === 'select-option') {
      dispatch(setSelectedPatient(newValue))
    } else {
      setPatientSearchInput(newValue)
    }
  }

  const handleAddNewPatient = () => {
    dispatch(openModal('addEditPatient'))
  }

  const handleAddNewDrug = () => {
    dispatch(openModal('addEditPatientDrug'))
  }

  const handleMedicationToggle = medicationId => {
    setSelectedMedications(prev =>
      prev.includes(medicationId) ? prev.filter(id => id !== medicationId) : [...prev, medicationId]
    )
  }

  const handleSaveBag = () => {
    if (selectedPatient && selectedMedications.length > 0) {
      dispatch(
        addBag({
          ...selectedBag,
          patientId: selectedPatient.id,
          medications: selectedMedications,
          status: 'in_pharmacy',
          patient: selectedPatient
        })
      ).then(() => {
        onClose()
      })
    }
  }

  const getPatientLabel = patient => {
    if (!patient) return ''
    const firstName = patient.first_name || ''
    const lastName = patient.last_name || ''
    return `${firstName} ${lastName}`.trim() || 'Unnamed Patient'
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h6' component='h2' gutterBottom>
        {bagId ? 'Edit Bag' : 'Create New Bag'}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Autocomplete
          options={patients}
          getOptionLabel={getPatientLabel}
          renderInput={params => (
            <TextField
              {...params}
              label='Search Patient'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position='end'>
                    <Button
                      variant='contained'
                      size='small'
                      onClick={handleAddNewPatient}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Add
                    </Button>
                    {params.InputProps.endAdornment}
                  </InputAdornment>
                )
              }}
            />
          )}
          value={selectedPatient}
          inputValue={patientSearchInput}
          onInputChange={handlePatientSearch}
          onChange={(event, newValue) => dispatch(setSelectedPatient(newValue))}
          freeSolo
          renderOption={(props, option) => <li {...props}>{`${option.first_name} ${option.last_name}`}</li>}
        />
      </Box>
      {selectedPatient && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant='subtitle1'>Selected Patient:</Typography>
          <Typography>{`${selectedPatient.first_name} ${selectedPatient.last_name}`}</Typography>
          <Typography>{`DOB: ${selectedPatient.date_of_birth}`}</Typography>
          <Typography>{`NHS Number: ${selectedPatient.nhs_number}`}</Typography>
          <Typography>{`Address: ${selectedPatient.address}, ${selectedPatient.post_code}`}</Typography>
        </Box>
      )}
      {selectedPatient && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant='subtitle1'>Medications</Typography>
            <Button variant='outlined' onClick={handleAddNewDrug}>
              Add New Drug
            </Button>
          </Box>
          <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant='subtitle2'>Regular Medications</Typography>
                {patientMedications
                  .filter(med => !med.is_acute)
                  .map(med => (
                    <FormControlLabel
                      key={med.id}
                      control={
                        <Checkbox
                          checked={selectedMedications.includes(med.id)}
                          onChange={() => handleMedicationToggle(med.id)}
                        />
                      }
                      label={med?.vmp?.nm}
                    />
                  ))}
              </Grid>
              <Grid item xs={6}>
                <Typography variant='subtitle2'>Acute Medications</Typography>
                {patientMedications
                  .filter(med => med.is_acute)
                  .map(med => (
                    <FormControlLabel
                      key={med.id}
                      control={
                        <Checkbox
                          checked={selectedMedications.includes(med.id)}
                          onChange={() => handleMedicationToggle(med.id)}
                        />
                      }
                      label={med?.vmp?.nm}
                    />
                  ))}
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => onClose()} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSaveBag}
          disabled={!selectedPatient || selectedMedications.length === 0}
        >
          Save Bag
        </Button>
      </Box>
    </Box>
  )
}

export default NewBagModal
