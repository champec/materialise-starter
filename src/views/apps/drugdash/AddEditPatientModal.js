import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material'
import { addPatient, updatePatient } from 'src/store/apps/drugdash/ddThunks'
import { closeModal } from 'src/store/apps/drugdash/ddModals'
import { selectAllPatients, selectSelectedPatient, setSelectedPatient } from 'src/store/apps/drugdash'

const AddEditPatientModal = ({ patientId }) => {
  const dispatch = useDispatch()
  const patients = useSelector(selectAllPatients)
  const selectedPatient = useSelector(selectSelectedPatient)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    post_code: '',
    date_of_birth: '',
    nhs_number: '',
    gender: '',
    phone_number: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // useEffect(() => {
  //   if (selectedPatient) {
  //     setFormData(selectedPatient)
  //   }
  // }, [selectedPatient])

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId)).then(action => {
        if (action.payload) {
          setFormData(action.payload)
        }
      })
    }
  }, [dispatch, patientId])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First name and last name are required')
      return false
    }
    // Add more validation as needed
    setError('')
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    try {
      let result
      if (selectedPatient) {
        result = await dispatch(updatePatient({ id: selectedPatient.id, ...formData })).unwrap()
      } else {
        result = await dispatch(addPatient(formData)).unwrap()
      }
      dispatch(setSelectedPatient(result))
      dispatch(closeModal())
    } catch (err) {
      console.log('Failed to save patient. Please try again.', err, console.log(typeof setSelectedPatient))
      setError('Failed to save patient. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth='sm'>
      <Typography variant='h5' gutterBottom>
        {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
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
              name='address'
              label='Address'
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name='post_code'
              label='Post Code'
              value={formData.post_code}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name='date_of_birth'
              label='Date of Birth'
              type='date'
              value={formData.date_of_birth}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name='nhs_number'
              label='NHS Number'
              value={formData.nhs_number}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position='start'>#</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select label='Gender' name='gender' value={formData.gender} onChange={handleChange}>
                <MenuItem value='male'>Male</MenuItem>
                <MenuItem value='female'>Female</MenuItem>
                <MenuItem value='other'>Other</MenuItem>
                <MenuItem value='unknown'>Unknown</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name='phone_number'
              label='Phone Number'
              value={formData.phone_number}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position='start'>📞</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name='email'
              label='Email'
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position='start'>@</InputAdornment>
              }}
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
            {loading ? <CircularProgress size={24} /> : selectedPatient ? 'Update' : 'Add'}
          </Button>
        </Box>
      </form>
    </Container>
  )
}

export default AddEditPatientModal
