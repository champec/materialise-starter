import React, { useState, useEffect } from 'react'
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material'

const ControlledDrugEntryForm = ({ initialData, onSubmit, registers }) => {
  const [formData, setFormData] = useState({
    type: '',
    drugId: '',
    quantity: '',
    supplierOrPatient: '',
    prescriber: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({ ...prevData, ...initialData }))
    }
  }, [initialData])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleReturnToCapture = () => {
    setProcessedData(null);
  };

  return (
    <Box component='form' onSubmit={handleSubmit}>
      <Typography variant='h6' gutterBottom>
        {initialData ? 'Edit Controlled Drug Entry' : 'New Controlled Drug Entry'}
      </Typography>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Type</InputLabel>
        <Select name='type' value={formData.type} onChange={handleChange} required>
          <MenuItem value='received'>Received</MenuItem>
          <MenuItem value='supplied'>Supplied</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Drug</InputLabel>
        <Select name='drugId' value={formData.drugId} onChange={handleChange} required>
          {registers.map(register => (
            <MenuItem key={register.id} value={register.id}>
              {register.drug_name} {register.strength} {register.form}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        name='quantity'
        label='Quantity'
        type='number'
        value={formData.quantity}
        onChange={handleChange}
        required
        margin='normal'
      />
      <TextField
        fullWidth
        name='supplierOrPatient'
        label={formData.type === 'received' ? 'Supplier' : 'Patient'}
        value={formData.supplierOrPatient}
        onChange={handleChange}
        required
        margin='normal'
      />
      {formData.type === 'supplied' && (
        <TextField
          fullWidth
          name='prescriber'
          label='Prescriber'
          value={formData.prescriber}
          onChange={handleChange}
          required
          margin='normal'
        />
      )}
      <TextField
        fullWidth
        name='date'
        label='Date'
        type='date'
        value={formData.date}
        onChange={handleChange}
        required
        margin='normal'
        InputLabelProps={{
          shrink: true
        }}
      />
      <TextField
        fullWidth
        name='notes'
        label='Notes'
        multiline
        rows={4}
        value={formData.notes}
        onChange={handleChange}
        margin='normal'
      />
      <Button type='submit' variant='contained' color='primary' sx={{ mt: 2 }}>
        {initialData ? 'Update Entry' : 'Add Entry'}
      </Button>
    </Box>
  )
}

export default ControlledDrugEntryForm
