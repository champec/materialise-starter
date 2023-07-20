import { useState, forwardRef, useEffect } from 'react'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useUserAuth } from 'src/hooks/useAuth'
import { supabaseOrg } from 'src/configs/supabase'
import {
  Drawer,
  Button,
  Select,
  MenuItem,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  Box,
  FormControl,
  InputAdornment,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { styled } from '@mui/material/styles'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller } from 'react-hook-form'
import AutocompleteCreatable from './CustomAutoComplete'
import * as yup from 'yup'
import { addEntry } from 'src/store/apps/cdr'
import { useDispatch } from 'react-redux'

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <TextField inputRef={ref} label='Date' {...props} />
})

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))

const schema = type =>
  yup.object().shape({
    date: yup.date().required(),
    ...(type === 'receiving'
      ? {
          supplier: yup.string().required(),
          documentRef: yup.string().required(),
          quantity: yup.number().positive().integer().required()
        }
      : {
          patient: yup.string().required(),
          quantity: yup.number().positive().integer().required(),
          prescriber: yup.string().required(),
          collector: yup.string().required()
        })
  })

const CDEntryDrawer = ({
  open,
  toggle,
  patients,
  prescribers,
  suppliers,
  handleNewItemMain,
  selectedDrug,
  refetchData,
  type
}) => {
  // ** State
  const [date, setDate] = useState(new Date())
  const [idRequest, setIdRequest] = useState('no')
  const [idProvided, setIdProvided] = useState('no')
  const [isAutoComplete, setIsAutoComplete] = useState(true)
  const [manualValues, setManualValues] = useState({})
  const [supplierValue, setSupplierValue] = useState('')
  const [patientValue, setPatientValue] = useState('')
  const [prescriberValue, setPrescriberValue] = useState('')
  const [collectorValue, setCollectorValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)

  const user = useUserAuth()?.user
  const orgId = useOrgAuth()?.organisation?.id
  const supabase = supabaseOrg

  const handlePatientChange = value => {
    setSelectedPatient(value)
  }

  console.log(patients)

  //   const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(validationSchema) })
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema(type))
  })

  // console.log('RESET WATCH', watch('patient'))
  const dispatch = useDispatch()

  useEffect(() => {
    setSupplierValue(watch('supplier'))
    setPatientValue(watch('patient'))
    setPrescriberValue(watch('prescriber'))
    setCollectorValue(watch('collector'))
  }, [watch])

  const onSubmit = async () => {
    console.log('submitted')
    setLoading(true)
    setError(null)

    try {
      const formData = getValues() // Get form values using getValues()
      const currentDate = new Date()
      console.log({ currentDate })
      console.log(formData, selectedDrug)
      // Use formData to access the form values
      // const { error } = await supabase.from('cdr_entries').insert([
      dispatchEvent(
        addEntry({
          date: currentDate,
          type: selectedDrug.drug_type, //replace with actual type
          drug_id: selectedDrug.id,
          supplier: type === 'receiving' ? formData.supplier : null,
          patient: type === 'receiving' ? null : formData.patient,
          quantity: formData.quantity,
          document_ref: type === 'receiving' ? formData.documentRef : null,
          collected_by: type === 'receiving' ? null : formData.collector,
          prescriber: type === 'receiving' ? null : formData.prescriber,
          id_requested: type === 'receiving' ? null : idRequest === 'yes',
          id_provided: type === 'receiving' ? null : idProvided === 'yes',
          entrymadeby: user.username,
          entrymadeby_id: user.id,
          running_total: formData.quantity,
          organisation_id: orgId,
          receiving: type === 'receiving'
        })
      )
      // ])

      if (error) {
        throw error
      }
      reset() // reset form values
      setIdRequest('no') // reset idRequest state
      setIdProvided('no') // reset idProvided state
      setManualValues({}) // reset manualValues state
      setSupplierValue('') // reset supplierValue state
      setPatientValue('') // reset patientValue state
      setPrescriberValue('') // reset prescriberValue state
      setCollectorValue('') // reset collectorValue state
      setSelectedPatient(null) // reset selectedPatient state
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
      toggle()
      //  refetchData() // Refetch the data after submission
    }
  }

  const onError = (errors, e) => console.log(errors, e)

  console.log('Supplier: ', watch('supplier'))
  console.log('Patient: ', watch('patient'))
  console.log('Prescriber:', watch('presriber'))

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={toggle}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: [300, 400] } }}
    >
      <Header>
        <Typography variant='h6'>{type === 'receiving' ? 'Add Receivied CD' : 'Handing Out CD'}</Typography>

        <IconButton size='small' onClick={toggle} sx={{ color: 'text.primary' }}>
          <Icon icon='mdi:close' fontSize={20} />
        </IconButton>
      </Header>
      <Box sx={{ p: 5 }}>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <Box sx={{ mb: 6 }}>
            <FormControl component='fieldset'>
              <RadioGroup row value={isAutoComplete} onChange={e => setIsAutoComplete(e.target.value === 'true')}>
                <FormControlLabel value={true} control={<Radio />} label='AutoComplete Entry' />
                <FormControlLabel value={false} control={<Radio />} label='Manual Entry' />
              </RadioGroup>
              {/* <RadioGroup row value={type} onChange={e => setType(e.target.value)}>
                <FormControlLabel value='receiving' control={<Radio />} label='Receiving' />
                <FormControlLabel value='handingOut' control={<Radio />} label='Handing Out' />
              </RadioGroup> */}
            </FormControl>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Controller
              name='date'
              control={control}
              defaultValue={new Date()}
              render={({ field }) => (
                <DatePickerWrapper sx={{ '& .MuiFormControl-root': { width: '100%' } }}>
                  <DatePicker
                    selected={field.value}
                    onChange={date => field.onChange(date)}
                    customInput={<CustomInput />}
                  />
                </DatePickerWrapper>
              )}
            />
          </Box>

          <Box sx={{ mb: 6 }}>
            {type === 'receiving' &&
              (isAutoComplete ? (
                <AutocompleteCreatable
                  data={suppliers}
                  table='cdr_suppliers'
                  handleNewItemMain={handleNewItemMain}
                  labelText='Supplier'
                  mainValue={watch('supplier')}
                  setMainValue={value => setValue('supplier', value)}
                />
              ) : (
                <TextField
                  {...register('supplier')}
                  fullWidth
                  label='Supplier'
                  multiline
                  minRows={2}
                  required
                  error={errors.supplier}
                  helperText={errors.supplier && 'Supplier is required'}
                />
              ))}{' '}
            {type === 'handingOut' &&
              (isAutoComplete ? (
                <AutocompleteCreatable
                  data={patients}
                  table='cdr_patients'
                  handleNewItemMain={handleNewItemMain}
                  labelText='Patient Name'
                  mainValue={watch('patient')}
                  setMainValue={value => setValue('patient', value)}
                  handlePatientChange={handlePatientChange}
                />
              ) : (
                <TextField
                  {...register('patient')}
                  fullWidth
                  label='Patient'
                  multiline
                  minRows={2}
                  required
                  error={errors.patient}
                  helperText={errors.patient && 'Patient is required'}
                />
              ))}
          </Box>
          <Box sx={{ mb: 6 }}>
            {type === 'receiving' ? (
              <TextField
                {...register('documentRef')}
                fullWidth
                label='Document Reference'
                required
                error={errors.documentRef}
                helperText={errors.documentRef && 'Document Reference is required'}
                type='text'
                autoComplete='off'
              />
            ) : null}
          </Box>
          <Box sx={{ mb: 6 }}>
            {type === 'handingOut' &&
              (isAutoComplete ? (
                <AutocompleteCreatable
                  data={prescribers}
                  table='cdr_prescribers'
                  handleNewItemMain={handleNewItemMain}
                  labelText='Prescriber Name'
                  mainValue={watch('prescriber')}
                  setMainValue={value => setValue('prescriber', value)}
                  selectedPatient={selectedPatient}
                />
              ) : (
                <TextField
                  {...register('prescriber')}
                  fullWidth
                  label='Prescriber'
                  multiline
                  minRows={2}
                  required
                  error={errors.prescriber}
                  helperText={errors.prescriber && 'Prescriber is required'}
                />
              ))}
          </Box>
          <Box sx={{ mb: 6 }}>
            {type === 'handingOut' &&
              (isAutoComplete ? (
                <AutocompleteCreatable
                  data={[]}
                  table='cdr_collectors'
                  handleNewItemMain={handleNewItemMain}
                  labelText='Person Collecting'
                  mainValue={watch('collector')}
                  setMainValue={value => setValue('collector', value)}
                  selectedPatient={selectedPatient}
                />
              ) : (
                <TextField
                  {...register('collector')}
                  fullWidth
                  label='Person Collecting'
                  required
                  error={errors.prescriber}
                  helperText={errors.prescriber && 'Collector is required'}
                />
              ))}
          </Box>
          <Box sx={{ mb: 6 }}>
            <TextField
              {...register('quantity')}
              fullWidth
              type='number'
              label='Quantity'
              required
              error={errors.quantity}
              helperText={errors.quantity && 'Quantity is required'}
            />
          </Box>

          <Box sx={{ mb: 6 }}>
            {type === 'handingOut' && (
              <FormControl component='fieldset'>
                <RadioGroup row value={idRequest} onChange={e => setIdRequest(e.target.value)}>
                  <FormControlLabel value='yes' control={<Radio />} label='ID Requested: Yes' />
                  <FormControlLabel value='no' control={<Radio />} label='ID Requested: No' />
                </RadioGroup>
              </FormControl>
            )}
          </Box>
          <Box sx={{ mb: 6 }}>
            {type === 'handingOut' && (
              <FormControl component='fieldset'>
                <RadioGroup row value={idProvided} onChange={e => setIdProvided(e.target.value)}>
                  <FormControlLabel value='yes' control={<Radio />} label='ID Provided: Yes' />
                  <FormControlLabel value='no' control={<Radio />} label='ID Provided: No' />
                </RadioGroup>
              </FormControl>
            )}
          </Box>
          <div>
            <Button size='large' variant='contained' type='submit' disabled={loading} sx={{ mr: 4 }}>
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
            <Button size='large' variant='outlined' color='secondary' onClick={toggle}>
              Cancel
            </Button>
          </div>
          {error && <Typography color='error'>{error}</Typography>}
        </form>
      </Box>
    </Drawer>
  )
}

export default CDEntryDrawer
