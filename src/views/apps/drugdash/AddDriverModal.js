import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Box, Typography, TextField, Button, Grid, CircularProgress, Container } from '@mui/material'
import { addDriver } from 'src/store/apps/drugdash/ddThunks'
import { closeModal } from 'src/store/apps/drugdash/ddModals'

const AddDriverModal = () => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    license_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone_number.trim()) {
      setError('First name, last name, and phone number are required')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    try {
      await dispatch(addDriver(formData)).unwrap()
      dispatch(closeModal())
    } catch (err) {
      console.error('Failed to add driver:', err)
      setError('Failed to add driver. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth='sm'>
      <Typography variant='h5' gutterBottom>
        Add New Driver
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name='first_name'
              label='First Name'
              value={formData.first_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name='last_name'
              label='Last Name'
              value={formData.last_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name='phone_number'
              label='Phone Number'
              value={formData.phone_number}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name='email'
              label='Email'
              type='email'
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name='license_number'
              label='License Number'
              value={formData.license_number}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        {error && (
          <Typography color='error' sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => dispatch(closeModal())} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Driver'}
          </Button>
        </Box>
      </form>
    </Container>
  )
}

export default AddDriverModal
