// ** React Imports
import { forwardRef, useState, useEffect } from 'react'

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
import { CircularProgress, Checkbox } from '@mui/material'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
// import DatePicker from 'react-datepicker'
import { DatePicker } from '@mui/x-date-pickers'
import { useSelector } from 'react-redux'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useUserAuth } from 'src/hooks/useAuth'
import dayjs from 'dayjs'

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const AddNewPharmacistForm = ({ patient, onClose, onSelect, selectedPharmacist, setSelectedPharmacist }) => {
  console.log('add new pharmaicst form', selectedPharmacist)
  // ** States
  const [date, setDate] = useState(null)
  const [language, setLanguage] = useState([])
  const [openSnack, setOpenSnack] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('success') // success, error, warning, info, or default
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [savePermanently, setSavePermanently] = useState(false)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const user = useSelector(state => state.user.user)
  const userId = user?.id

  const showMessage = (msg, sev) => {
    setSnackMessage(msg)
    setSnackSeverity(sev)
    setOpenSnack(true)
  }

  const handleChange = event => {
    const { name, value } = event.target
    console.log('[harmacist handlechange', name, value)
    setSelectedPharmacist({ ...selectedPharmacist, [name]: value })
  }

  const splitName = fullName => {
    const nameParts = fullName.trim().split(' ')
    let firstName = '',
      middleName = '',
      lastName = ''

    if (nameParts.length === 1) {
      lastName = nameParts[0]
    } else if (nameParts.length === 2) {
      ;[firstName, lastName] = nameParts
    } else {
      firstName = nameParts[0]
      lastName = nameParts[nameParts.length - 1]
      middleName = nameParts.slice(1, -1).join(' ')
    }

    return { firstName, middleName, lastName }
  }

  useEffect(() => {
    if (patient && patient.full_name && !selectedPharmacist) {
      const { firstName, middleName, lastName } = splitName(patient.full_name)
      // setFirstName(firstName)
      // setMiddleName(middleName)
      // setLastName(lastName)
      setSelectedPharmacist({ ...patient, first_name: firstName, middle_name: middleName, last_name: lastName })
    }
  }, [patient])

  useEffect(() => {
    if (selectedPharmacist) {
      setFirstName(selectedPharmacist.first_name)
      setMiddleName(selectedPharmacist.middle_name)
      setLastName(selectedPharmacist.last_name)
    }
  }, [selectedPharmacist])

  console.log('patient', firstName)

  // ** Function to handle form submit
  const handleSubmit = async event => {
    // setLoading(true)
    event.preventDefault()

    console.log('selected pharmacist', selectedPharmacist)

    if (savePermanently) {
      // const formData = new FormData(event.target)
      // const formFields = Object.fromEntries(formData.entries())
      // // enrich the form field with the date after converting it from dayjs object to string
      // formFields.dob = date?.format('YYYY-MM-DD')

      const { full_name, ...pharmacistWithoutFullName } = selectedPharmacist

      console.log('pharmacist without full name', pharmacistWithoutFullName)

      // ** Add new patient to database
      const { data, error } = await supabase
        .from('pharmacists')
        .upsert(
          {
            ...pharmacistWithoutFullName,
            profile_id: userId,
            full_name: `${selectedPharmacist.first_name} ${selectedPharmacist.last_name}`
          },
          { onConflict: 'id' }
        )
        .select('*')
        .single()

      if (error) {
        showMessage(error.message, 'error')
        setLoading(false)
        return
      }

      showMessage('Pharmacist added successfully', 'success')

      console.log(data)
      onSelect(data)
      setTimeout(() => {
        onClose()
        setLoading(false)
      }, 2000)
    } else {
      onSelect(selectedPharmacist)
      onClose()
    }
  }

  const handleFirstNameChange = event => {
    setFirstName(event.target.value)
  }

  // Function to handle middle name change
  const handleMiddleNameChange = event => {
    setMiddleName(event.target.value)
  }

  // Function to handle last name change
  const handleLastNameChange = event => {
    setLastName(event.target.value)
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
      <CardHeader title='Add New Pharmacist' />
      <Typography variant='caption' sx={{ px: 2, pb: 2 }}>
        {`You can only add or edit the currently logged in user ( ${
          user.username || user.users.username
        } ) as a pharmacist by clicking the button below , you wont be
        able to permanently save another pharmacists details`}
      </Typography>
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
                // value={firstName}
                // onChange={handleFirstNameChange}
                value={selectedPharmacist?.first_name || ''}
                onChange={handleChange}
                fullWidth
                name='first_name'
                autoComplete='off'
                label='Fist Name'
                placeholder='carterLeonard'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                // value={lastName}
                // onChange={handleLastNameChange}
                value={selectedPharmacist?.last_name || ''}
                onChange={handleChange}
                fullWidth
                name='last_name'
                autoComplete='off'
                label='Last Name'
                placeholder='carterLeonard'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                value={selectedPharmacist?.middle_name || ''}
                onChange={handleChange}
                fullWidth
                name='middle_name'
                autoComplete='off'
                label='Middle Name'
                placeholder='carterLeonard'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                value={selectedPharmacist?.gphc_number || ''}
                onChange={handleChange}
                label='GPhC Number'
                autoComplete='off'
                placeholder='12345678'
                name='gphc_number'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                selected={date}
                showYearDropdown
                defaultValue={selectedPharmacist?.dob ? dayjs(selectedPharmacist?.dob) : null}
                showMonthDropdown
                placeholderText='MM-DD-YYYY'
                // customInput={<CustomInput />}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
                id='form-layouts-separator-date'
                onChange={newDate => setSelectedPharmacist({ ...selectedPharmacist, dob: newDate })}
                name='dob'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='form-layouts-separator-select-label'>Sex</InputLabel>
                <Select
                  label='Country'
                  value={selectedPharmacist?.sex || ''}
                  onChange={handleChange}
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
              <TextField
                value={selectedPharmacist?.house_number || ''}
                onChange={handleChange}
                disabled={loading}
                fullWidth
                label='House Number'
                name='house_number'
                placeholder='A1'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                value={selectedPharmacist?.address || ''}
                onChange={handleChange}
                disabled={loading}
                fullWidth
                label='Address'
                name='address'
                placeholder='Carter'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                value={selectedPharmacist?.post_code || ''}
                onChange={handleChange}
                disabled={loading}
                fullWidth
                label='Post Code'
                name='post_code'
                placeholder='ABC 123'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                disabled={loading}
                value={selectedPharmacist?.email || ''}
                onChange={handleChange}
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
                value={selectedPharmacist?.mobile_number || ''}
                onChange={handleChange}
                label='Mobile No.'
                name='mobile_number'
                placeholder='+1-123-456-8790'
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                disabled={loading}
                value={selectedPharmacist?.telephone_number || ''}
                onChange={handleChange}
                fullWidth
                label='Landline No.'
                name='telephone_number'
                placeholder='+1-123-456-8790'
              />
            </Grid> */}
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
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={loading || (selectedPharmacist?.id && userId !== selectedPharmacist.profile_id)}
                  checked={savePermanently}
                  onChange={e => setSavePermanently(savePermanently => !savePermanently)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
              label='Save Permanently'
            />

            <Button disabled={loading} size='large' type='submit' sx={{ mr: 2 }} variant='contained'>
              {loading ? <CircularProgress size={20} /> : 'Add Pharmacist'}
            </Button>
          </div>
        </CardActions>
      </form>
    </Card>
  )
}

export default AddNewPharmacistForm
