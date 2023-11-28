import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TextField, Button, Container, Typography, Grid, Checkbox, FormControlLabel } from '@mui/material'
import { searchDrugs, upsertPatientDrug } from 'src/store/apps/drugdash/ddDrugs'
import { fetchPatientDrugs } from 'src/store/apps/drugdash/ddDrugs'
import { closeModal } from 'src/store/apps/drugdash/ddModals'

function AddEditPatientDrugModal() {
  const dispatch = useDispatch()
  const selectedPatient = useSelector(state => state.ddPatients.selectedPatient)
  const selectedDrugDetail = useSelector(state => state.ddDrugs.selectedDrugDetail)
  console.log(selectedDrugDetail, 'selectedDrugDetail')
  const [formData, setFormData] = useState({
    patient: selectedPatient.id,
    medication: selectedDrugDetail.drugId,
    packId: selectedDrugDetail.packId,
    is_regular: false,
    is_acute: false,
    dose: '',
    daily_dose: null
  })

  const handleChange = e => {
    const { name, value, checked } = e.target

    // Handle the checkboxes
    if (name === 'is_regular' || name === 'is_acute') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        [name === 'is_regular' ? 'is_acute' : 'is_regular']: !checked
      }))
      return
    }

    // Handle other form fields
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      const newDrug = await dispatch(upsertPatientDrug(formData))

      if (newDrug) {
        await dispatch(fetchPatientDrugs(selectedPatient.id))
        dispatch(closeModal()) // close the modal
      }
    } catch (error) {
      console.error('Failed to upsert drug:', error)
    }
  }

  return (
    <Container maxWidth='sm'>
      <Typography variant='h5' gutterBottom>
        Add/Edit Patient Drug
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='subtitle1' gutterBottom>
            Adding {selectedDrugDetail.name} drug, to {selectedPatient.first_name} {selectedPatient.last_name}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_regular}
                onChange={handleChange}
                name='is_regular'
                disabled={formData.is_acute}
              />
            }
            label='Is Regular'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_acute}
                onChange={handleChange}
                name='is_acute'
                disabled={formData.is_regular}
              />
            }
            label='Is Acute'
          />
        </Grid>

        <Grid item xs={12}>
          <TextField required fullWidth name='dose' label='Dose' value={formData.dose} onChange={handleChange} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            type='number'
            name='daily_dose'
            label='Daily Dose'
            value={formData.daily_dose}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant='contained' color='primary' fullWidth onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AddEditPatientDrugModal
