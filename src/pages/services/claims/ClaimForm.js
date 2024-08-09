import React, { useState, useEffect } from 'react'
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { useSelector } from 'react-redux'

const ClaimForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    service_id: '',
    patient_id: '',
    pharmacy_id: '',
    details: {}
  })

  const services = useSelector(state => state.services.services)
  const pharmacies = useSelector(state => state.pharmacies.pharmacies)

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()
    onSubmit(formData)
  }

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id='service-select-label'>Service</InputLabel>
        <Select
          labelId='service-select-label'
          name='service_id'
          value={formData.service_id}
          onChange={handleChange}
          required
        >
          {services.map(service => (
            <MenuItem key={service.id} value={service.id}>
              {service.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField name='patient_id' label='Patient ID' value={formData.patient_id} onChange={handleChange} required />
      <FormControl fullWidth>
        <InputLabel id='pharmacy-select-label'>Pharmacy</InputLabel>
        <Select
          labelId='pharmacy-select-label'
          name='pharmacy_id'
          value={formData.pharmacy_id}
          onChange={handleChange}
          required
        >
          {pharmacies.map(pharmacy => (
            <MenuItem key={pharmacy.id} value={pharmacy.id}>
              {pharmacy.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Add more form fields based on the selected service */}
      <Button type='submit' variant='contained' color='primary'>
        Submit Claim
      </Button>
    </Box>
  )
}

export default ClaimForm
