import React, { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Typography,
  Grid,
  InputAdornment,
  Box
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { upsertPatient, fetchPatients, setSelectedPatient } from 'src/store/apps/drugdash/ddPatients'

function AddEditPatientModal() {
  const searchTerm = useSelector(state => state.ddPatients.searchTerm)
  const parseInput = inputValue => {
    const parts = inputValue.split(' ')
    return {
      first_name: parts[0] || '',
      last_name: parts[1] || '',
      address: parts[2] || ''
    }
  }

  console.log(searchTerm, 'inputData')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    post_code: '',
    date_of_birth: null,
    nhs_number: null,
    gender: 'unknown',
    phone_number: '',
    email: ''
  })

  useEffect(() => {
    if (searchTerm) {
      const parsedInput = parseInput(searchTerm)
      setFormData(prev => ({ ...prev, ...parsedInput }))
    }
  }, [searchTerm])

  const dispatch = useDispatch()

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const newPatient = await dispatch(upsertPatient(formData))
    if (newPatient) {
      await dispatch(fetchPatients())
      dispatch(setSelectedPatient(newPatient))
    }
  }

  return (
    <Container maxWidth='sm'>
      <Typography variant='h5' gutterBottom>
        Add/Edit Patient
      </Typography>

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

        <Grid item xs={12}>
          <Button variant='contained' color='primary' fullWidth onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AddEditPatientModal
