import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
  TextField,
  Alert
} from '@mui/material'
import {
  fetchDrugClasses,
  fetchDrugBrands,
  fetchDrugForms,
  fetchStrengths,
  createNewRegister
} from 'src/store/apps/cdr'
import toast from 'react-hot-toast'

const NewRegisterModal = ({ open, handleClose }) => {
  const dispatch = useDispatch()
  const orgId = useSelector(state => state.organisation.organisation.id)
  const { drugClasses, drugBrands, drugForms, strengths, newRegisterStatus, newRegisterError } = useSelector(
    state => state.cdr
  )
  const [error, setError] = useState(null)

  console.log({ strengths })

  const [formData, setFormData] = useState({
    className: '',
    brandName: '',
    formName: '',
    strength: '',
    unit: '',
    initialStock: 0
  })

  useEffect(() => {
    if (open) {
      dispatch(fetchDrugClasses())
    }
  }, [open, dispatch])

  useEffect(() => {
    if (formData.className) {
      dispatch(fetchDrugBrands(formData.className))
    }
  }, [formData.className, dispatch])

  useEffect(() => {
    if (formData.className && formData.brandName) {
      dispatch(fetchDrugForms({ className: formData.className, brandName: formData.brandName }))
      dispatch(fetchStrengths({ className: formData.className, brandName: formData.brandName }))
    }
  }, [formData.className, formData.brandName, dispatch])

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Reset dependent fields
    if (name === 'className') {
      setFormData(prev => ({ ...prev, brandName: '', formName: '', strength: '', unit: '' }))
    } else if (name === 'brandName') {
      setFormData(prev => ({ ...prev, formName: '', strength: '', unit: '' }))
    } else if (name === 'strength') {
      const selectedStrength = strengths.find(s => `${s.strength}${s.unit}` === value)
      if (selectedStrength) {
        setFormData(prev => ({ ...prev, unit: selectedStrength.unit }))
      }
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    console.log('FORMDATA', formData)
    dispatch(createNewRegister({ registerData: formData, orgId }))
      .unwrap()
      .then(() => {
        handleClose()
        // You might want to show a success message here
        toast.success('A new register have been added', {
          duration: 2000
        })
      })
      .catch(error => {
        setError(error)
      })
  }

  if (newRegisterStatus === 'loading') {
    return <CircularProgress />
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Create New CD Register</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl fullWidth margin='dense'>
            <InputLabel>Drug Class</InputLabel>
            <Select name='className' value={formData.className} onChange={handleChange} required>
              {drugClasses.map(cls => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.drug_class}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin='dense'>
            <InputLabel>Drug Brand</InputLabel>
            <Select
              name='brandName'
              value={formData.brandName}
              onChange={handleChange}
              required
              disabled={!formData.className}
            >
              {drugBrands.map(brand => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.drug_brand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin='dense'>
            <InputLabel>Strength</InputLabel>
            <Select
              name='strength'
              value={formData.strength}
              onChange={handleChange}
              required
              disabled={!formData.brandName}
            >
              {strengths.map(strength => (
                <MenuItem key={strength.id} value={strength.id}>
                  {`${strength.drug_strength}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin='dense'>
            <InputLabel>Drug Form</InputLabel>
            <Select
              name='formName'
              value={formData.formName}
              onChange={handleChange}
              required
              disabled={!formData.brandName}
            >
              {drugForms.map(form => (
                <MenuItem key={form.id} value={form.id}>
                  {form.form_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin='dense'
            name='initialStock'
            label='Initial Stock'
            type='number'
            fullWidth
            variant='outlined'
            value={formData.initialStock}
            onChange={handleChange}
            InputProps={{
              endAdornment: <span>{formData.unit}</span>
            }}
          />
          {newRegisterError && <Typography color='error'>{newRegisterError}</Typography>}
          {error && (
            <Alert severity='error' style={{ marginTop: '1rem' }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' variant='contained' color='primary' disabled={newRegisterStatus === 'loading'}>
            Create Register
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default NewRegisterModal
