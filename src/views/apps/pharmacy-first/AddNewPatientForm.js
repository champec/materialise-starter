// ** React Imports
import { forwardRef, useState } from 'react'

import { supabase } from 'src/configs/supabase'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import CustomSnackbar from './CustomSnackBar'
import { CircularProgress } from '@mui/material'

// ** Third Party Imports
// import DatePicker from 'react-datepicker'
import { DatePicker } from '@mui/x-date-pickers'
import { useSelector } from 'react-redux'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useUserAuth } from 'src/hooks/useAuth'

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const AddNewPatientForm = ({ patient, onClose, onSelect }) => {
  console.log('add new patiuent form', patient)
  // ** States
  const [date, setDate] = useState(null)
  const [language, setLanguage] = useState([])
  const [openSnack, setOpenSnack] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('success') // success, error, warning, info, or default
  const [loading, setLoading] = useState(false)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const userId = useSelector(state => state.user.user.id)

  const showMessage = (msg, sev) => {
    setSnackMessage(msg)
    setSnackSeverity(sev)
    setOpenSnack(true)
  }

  // ** Function to handle form submit
  const handleSubmit = async event => {
    setLoading(true)
    event.preventDefault()
    console.log('ADD NEW PATIENT FORM SUBMIT')
    const formData = new FormData(event.target)
    const formFields = Object.fromEntries(formData.entries())

    // ** Add new patient to database
    const { data, error } = await supabase
      .from('patients')
      .insert({ ...formFields, pharmacy_id: orgId, created_by: userId })
      .select('*')
      .single()

    if (error) {
      showMessage(error.message, 'error')
      setLoading(false)
      return
    }

    showMessage('Patient added successfully', 'success')

    console.log(data)
    onSelect(data)
    setTimeout(() => {
      onClose()
      setLoading(false)
    }, 2000)
  }

  return (
    <Card>
      <CustomSnackbar
        vertical='top'
        horizontal='center'
        open={openSnack}
        setOpen={setOpenSnack}
        message={snackMessage}
        severity={snackSeverity}
      />
      <CardHeader title='Add New Patient' />
      <Divider sx={{ m: '0 !important' }} />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                1. Personal Info
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                defaultValue={patient?.full_name}
                fullWidth
                name='full_name'
                autoComplete='off'
                label='Full Name'
                placeholder='carterLeonard'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='text'
                label='NHS Number'
                autoComplete='off'
                placeholder='carterleonard@gmail.com'
                name='nhs_number'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                selected={date}
                showYearDropdown
                showMonthDropdown
                placeholderText='MM-DD-YYYY'
                customInput={<CustomInput />}
                id='form-layouts-separator-date'
                onChange={date => setDate(date)}
                name='dob'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='form-layouts-separator-select-label'>Sex</InputLabel>
                <Select
                  label='Country'
                  defaultValue=''
                  id='form-layouts-separator-select'
                  labelId='form-layouts-separator-select-label'
                  name='sex'
                  disabled={loading}
                >
                  <MenuItem value='male'>Male</MenuItem>
                  <MenuItem value='female'>Female</MenuItem>
                  <MenuItem value='unknown'>Unknown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ mb: '0 !important' }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                2. Address and More
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField disabled={loading} fullWidth label='House Number' name='house_number' placeholder='A1' />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField disabled={loading} fullWidth label='Address' name='address' placeholder='Carter' />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField disabled={loading} fullWidth label='Post Code' name='post_code' placeholder='ABC 123' />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                disabled={loading}
                fullWidth
                type='email'
                name='email'
                label='Email'
                placeholder='carterleonard@gmail.com'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                disabled={loading}
                fullWidth
                label='Mobile No.'
                name='mobile_number'
                placeholder='+1-123-456-8790'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                disabled={loading}
                fullWidth
                label='Landline No.'
                name='telephone_number'
                placeholder='+1-123-456-8790'
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider sx={{ m: '0 !important' }} />
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <div>
            <Button
              disabled={loading}
              sx={{ mr: 1 }}
              onClick={onClose}
              size='large'
              color='secondary'
              variant='outlined'
            >
              Cancel
            </Button>
            <Button disabled={loading} type='reset' size='large' color='secondary' variant='outlined'>
              Reset
            </Button>
          </div>

          <Button disabled={loading} size='large' type='submit' sx={{ mr: 2 }} variant='contained'>
            {loading ? <CircularProgress size={20} /> : 'Add Patient'}
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default AddNewPatientForm
