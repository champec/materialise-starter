// ** React Imports
import { forwardRef, useState, useEffect } from 'react'

import { supabase } from 'src/configs/supabase'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'

// ** Third Party Imports
// import DatePicker from 'react-datepicker'
import { DatePicker } from '@mui/x-date-pickers'
import { useSelector } from 'react-redux'
import { format, parseISO, isValid } from 'date-fns'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useUserAuth } from 'src/hooks/useAuth'
import dayjs from 'dayjs'

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const AddEditPatientForm = ({ patient, onClose, onSelect, selectedPatient, setSelectedPatient }) => {
  console.log('add new patient form', selectedPatient, 'PATIENT', patient)
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
  const orgId = useSelector(state => state.organisation.organisation.id)
  const userId = useSelector(state => state.user.user.id)
  const [savePermanently, setSavePermanently] = useState(false)
  const [editingPatient, setEditingPatient] = useState({})
  const [openResetDialog, setOpenResetDialog] = useState(false)
  const [openSaveDialog, setOpenSaveDialog] = useState(false)

  const showMessage = (msg, sev) => {
    setSnackMessage(msg)
    setSnackSeverity(sev)
    setOpenSnack(true)
  }

  const handleChange = event => {
    const { name, value } = event.target
    console.log('name', name)
    setEditingPatient({ ...editingPatient, [name]: value })
  }

  const splitName = fullName => {
    const nameParts = fullName.trim().split(' ')
    let firstName = '',
      middleName = '',
      lastName = ''

    console.log('NAME PARTS', { nameParts })
    if (nameParts.length === 1) {
      firstName = nameParts[0]
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
    if (patient && patient.full_name && !selectedPatient) {
      const { firstName, middleName, lastName } = splitName(patient.full_name)
      // setFirstName(selectedfirstName)
      // setMiddleName(middleName)
      // setLastName(lastName)
      setEditingPatient({ ...patient, first_name: firstName, middle_name: middleName, last_name: lastName })
    }
  }, [patient])

  const handleDateChange = newDate => {
    setEditingPatient(prev => ({
      ...prev,
      dob: newDate ? format(newDate, 'yyyy-MM-dd') : null
    }))
  }

  useEffect(() => {
    if (selectedPatient) {
      setEditingPatient(prev => ({ ...selectedPatient }))
      setFirstName(selectedPatient.first_name)
      setMiddleName(selectedPatient.middle_name)
      setLastName(selectedPatient.last_name)
    }
  }, [selectedPatient])

  console.log('patient', firstName)

  const handleSubmit = async e => {
    e.preventDefault()
    setOpenSaveDialog(true)
  }

  // ** Function to handle form submit
  const confirmSave = async () => {
    // setLoading(true)
    setOpenSaveDialog(false)
    console.log('selected patient', selectedPatient)

    if (savePermanently) {
      // const formData = new FormData(event.target)
      // const formFields = Object.fromEntries(formData.entries())

      const { full_name, ...patientWithoutFullName } = editingPatient

      // enrich the form field with the date after converting it from dayjs object to string
      // patientWithoutFullName.dob = patientWithoutFullName.dob?.format('YYYY-MM-DD')

      // ** Add new patient to database
      const { data, error } = await supabase
        .from('patients')
        .upsert({ ...patientWithoutFullName, pharmacy_id: orgId, created_by: userId }, { onConflict: 'id' })
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
    } else {
      onSelect(editingPatient)
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

  const handleReset = () => {
    setOpenResetDialog(true)
  }

  const confirmReset = () => {
    setEditingPatient(patient || {})
    setOpenResetDialog(false)
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
      <form onSubmit={e => handleSubmit(e)}>
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
                value={editingPatient?.first_name || ''}
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
                value={editingPatient?.last_name || ''}
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
                value={editingPatient?.middle_name || ''}
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
                value={editingPatient?.nhs_number || ''}
                onChange={handleChange}
                label='NHS Number'
                autoComplete='off'
                placeholder='12345678'
                name='nhs_number'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label='Date of Birth'
                value={editingPatient?.dob ? parseISO(editingPatient.dob) : null}
                onChange={handleDateChange}
                renderInput={params => <TextField {...params} fullWidth />}
                inputFormat='dd/MM/yyyy'
                mask='__/__/____'
                disableFuture
                openTo='year'
                views={['year', 'month', 'day']}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: editingPatient?.dob ? !isValid(parseISO(editingPatient.dob)) : false,
                    helperText: editingPatient?.dob && !isValid(parseISO(editingPatient.dob)) ? 'Invalid date' : ''
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='form-layouts-separator-select-label'>Sex</InputLabel>
                <Select
                  label='Country'
                  defaultValue={editingPatient?.sex || ''}
                  id='form-layouts-separator-select'
                  labelId='form-layouts-separator-select-label'
                  name='sex'
                  disabled={loading}
                  onChange={handleChange}
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
                value={editingPatient?.house_number || ''}
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
                value={editingPatient?.address || ''}
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
                value={editingPatient?.post_code || ''}
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
                value={editingPatient?.email || ''}
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
                value={editingPatient?.mobile_number || ''}
                onChange={handleChange}
                label='Mobile No.'
                name='mobile_number'
                placeholder='+1-123-456-8790'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                disabled={loading}
                value={editingPatient?.telephone_number || ''}
                onChange={handleChange}
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
            <Button disabled={loading} onClick={handleReset} size='large' color='secondary' variant='outlined'>
              Reset
            </Button>
          </div>
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={loading}
                  checked={savePermanently}
                  onChange={e => setSavePermanently(savePermanently => !savePermanently)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
              label='Save Permanently'
            />

            <Button disabled={loading} size='large' type='submit' sx={{ mr: 2 }} variant='contained'>
              {loading ? <CircularProgress size={20} /> : 'Add Patient'}
            </Button>
          </div>
        </CardActions>
      </form>
      {/* Reset Confirmation Dialog */}
      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
        <DialogTitle>Confirm Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the form? All unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button onClick={confirmReset} autoFocus>
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle>Confirm Save</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {savePermanently
              ? 'This will create and save a new patient record in the database.'
              : "This will only save the patient for this appointment and won't create a new patient record in the database."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)}>Cancel</Button>
          <Button onClick={confirmSave} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default AddEditPatientForm
