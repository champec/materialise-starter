// ** React Imports
import { useState, Fragment, forwardRef, useEffect, useMemo } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { _, debounce } from 'lodash'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { Snackbar, Autocomplete } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useUserAuth } from 'src/hooks/useAuth'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

const defaultValues = {
  email: '',
  username: '',
  password: '',
  terms: false,
  firstName: '',
  lastName: '',
  dateOfBirth: new Date(),
  organisation: ''
}

// ** Styled Components
const RegisterIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const PickersComponent = forwardRef(({ ...props }, ref) => {
  return (
    <TextField
      inputRef={ref}
      fullWidth
      {...props}
      label={props.label || ''}
      sx={{ width: '100%' }}
      error={props.error}
    />
  )
})

const RegisterIllustration = styled('img')(({ theme }) => ({
  maxWidth: '48rem',
  [theme.breakpoints.down('xl')]: {
    maxWidth: '38rem'
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '30rem'
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 400
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 450
  }
}))

const BoxWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}))

const TypographyStyled = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.18px',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { marginTop: theme.spacing(8) }
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const Register = () => {
  // ** States
  const [showPassword, setShowPassword] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [dateOfBirth, setDateOfBirth] = useState(new Date())
  const [organisationOptions, setOrganisationOptions] = useState([])
  const [selectedOrganisation, setSelectedOrganisation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  // ** Hooks
  const theme = useTheme()
  const { register } = useUserAuth()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings

  const schema = yup.object().shape({
    password: yup.string().min(5).required(),
    username: yup.string().min(3).required(),
    email: yup.string().email().required(),
    terms: yup.bool().oneOf([true], 'You must accept the privacy policy & terms'),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    dateOfBirth: yup.date().required('Date of birth is required'),
    organisation: yup.string().required('Organisation is required')
  })

  const fetchOrganisations = async searchTerm => {
    const { data, error, count } = await supabase
      .from('pharmacies')
      .select('id, organisation_name, address1, ods_code')
      .ilike('organisation_name', `%${searchTerm}%`)
      .ilike('address1', `%${searchTerm}%`)
      .ilike('ods_code', `%${searchTerm}%`)
      .range(page * pageSize - pageSize, page * pageSize - 1)
      .order('organisation_name', { ascending: true })

    if (error) {
      console.error(error)
    } else {
      const options = data.map(({ id, organisation_name, address1, ods_code }) => ({
        label: `${organisation_name} (${ods_code}) - ${address1}`,
        value: id
      }))
      setOrganisationOptions(options)
      setTotalPages(Math.ceil(count / pageSize))
    }
  }

  // Define a debounced version of fetchOrganisations
  const fetchOrganisationsDebounced = useMemo(() => debounce(searchTerm => fetchOrganisations(searchTerm), 300), [])

  useEffect(() => {
    fetchOrganisationsDebounced(searchTerm)
  }, [searchTerm])

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = data => {
    const { email, username, password } = data
    register({ email, username, password }, err => {
      if (err.email) {
        setError('email', {
          type: 'manual',
          message: err.email
        })
      }
      if (err.username) {
        setError('username', {
          type: 'manual',
          message: err.username
        })
      }
    })
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setPage(1)
  }

  const handleRegister = async data => {
    console.log('SUBMITTING', data)
    // try {
    //   const { error } = await supabase.auth.signUp({
    //     email: data.email,
    //     password: data.password
    //   })

    //   if (error) {
    //     throw error
    //   }

    //   const { user, error: profileError } = await supabase
    //     .from('profiles')
    //     .insert({
    //       user_id: user.id,
    //       first_name: data.firstName,
    //       last_name: data.lastName,
    //       date_of_birth: data.dateOfBirth,
    //       organisation: data.organisation
    //     })
    //     .single()

    //   if (profileError) {
    //     throw profileError
    //   }

    //   setSnackbarSeverity('success')
    //   setSnackbarMessage('Registration successful')
    //   setOpenSnackbar(true)
    //   history.push('/login')
    // } catch (error) {
    //   setSnackbarSeverity('error')
    //   setSnackbarMessage(error.message)
    //   setOpenSnackbar(true)
    // }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const imageSource = skin === 'bordered' ? 'auth-v2-register-illustration-bordered' : 'auth-v2-register-illustration'

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <RegisterIllustrationWrapper>
            <RegisterIllustration
              alt='register-illustration'
              src={`/images/pages/${imageSource}-${theme.palette.mode}.png`}
            />
          </RegisterIllustrationWrapper>
          <FooterIllustrationsV2 image={`/images/pages/auth-v2-register-mask-${theme.palette.mode}.png`} />
        </Box>
      ) : null}
      <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
        <Box
          sx={{
            p: 7,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          <BoxWrapper>
            <Box
              sx={{
                top: 30,
                left: 40,
                display: 'flex',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width={47} fill='none' height={26} viewBox='0 0 268 150' xmlns='http://www.w3.org/2000/svg'>
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fill={theme.palette.primary.main}
                  transform='matrix(-0.865206 0.501417 0.498585 0.866841 195.571 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fillOpacity='0.4'
                  fill='url(#paint0_linear_7821_79167)'
                  transform='matrix(-0.865206 0.501417 0.498585 0.866841 196.084 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fill={theme.palette.primary.main}
                  transform='matrix(0.865206 0.501417 -0.498585 0.866841 173.147 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fill={theme.palette.primary.main}
                  transform='matrix(-0.865206 0.501417 0.498585 0.866841 94.1973 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fillOpacity='0.4'
                  fill='url(#paint1_linear_7821_79167)'
                  transform='matrix(-0.865206 0.501417 0.498585 0.866841 94.1973 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fill={theme.palette.primary.main}
                  transform='matrix(0.865206 0.501417 -0.498585 0.866841 71.7728 0)'
                />
                <defs>
                  <linearGradient
                    y1='0'
                    x1='25.1443'
                    x2='25.1443'
                    y2='143.953'
                    id='paint0_linear_7821_79167'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop />
                    <stop offset='1' stopOpacity='0' />
                  </linearGradient>
                  <linearGradient
                    y1='0'
                    x1='25.1443'
                    x2='25.1443'
                    y2='143.953'
                    id='paint1_linear_7821_79167'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop />
                    <stop offset='1' stopOpacity='0' />
                  </linearGradient>
                </defs>
              </svg>
              <Typography variant='h6' sx={{ ml: 2, lineHeight: 1, fontWeight: 700, fontSize: '1.5rem !important' }}>
                {themeConfig.templateName}
              </Typography>
            </Box>
            <Box sx={{ mb: 6 }}>
              <TypographyStyled variant='h5'>Adventure starts here 🚀</TypographyStyled>
              <Typography variant='body2'>Make your app management easy and fun!</Typography>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(handleRegister)}>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Controller
                    name='firstName'
                    control={control}
                    defaultValue=''
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextField
                        fullWidth
                        label='First Name'
                        margin='normal'
                        onBlur={onBlur}
                        onChange={onChange}
                        value={value}
                        error={Boolean(errors.firstName)}
                        helperText={errors.firstName?.message}
                        variant='outlined'
                        autoComplete='off'
                      />
                    )}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Controller
                    name='lastName'
                    control={control}
                    defaultValue=''
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextField
                        fullWidth
                        label='Last Name'
                        margin='normal'
                        type='search'
                        onBlur={onBlur}
                        onChange={onChange}
                        value={value}
                        error={Boolean(errors.lastName)}
                        helperText={errors.lastName?.message}
                        variant='outlined'
                        autoComplete='off'
                      />
                    )}
                  />
                </Box>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Controller
                  name='username'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      value={value}
                      onBlur={onBlur}
                      label='Username'
                      onChange={onChange}
                      placeholder='johndoe'
                      error={Boolean(errors.username)}
                      autoComplete='off'
                      type='search'
                    />
                  )}
                />
                {errors.username && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.username.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      value={value}
                      label='Email'
                      onBlur={onBlur}
                      onChange={onChange}
                      error={Boolean(errors.email)}
                      placeholder='user@email.com'
                      autoComplete='off'
                      type='search'
                    />
                  )}
                />
                {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
              </FormControl>
              <DatePickerWrapper>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    <Controller
                      name='dateOfBirth'
                      control={control}
                      defaultValue={null}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <DatePicker
                          value={dateOfBirth}
                          selected={dateOfBirth}
                          onChange={newValue => {
                            onChange(newValue)
                            setDateOfBirth(newValue) // update state
                          }}
                          onBlur={onBlur}
                          customInput={
                            <PickersComponent
                              label='Date of Birth'
                              error={Boolean(errors.dateOfBirth)}
                              helperText={errors.dateOfBirth?.message}
                            />
                          }
                          renderInput={params => (
                            <TextField fullWidth margin='normal' variant='outlined' autoComplete='off' />
                          )}
                        />
                      )}
                    />
                  </Box>
                </FormControl>
              </DatePickerWrapper>
              <FormControl fullWidth>
                <InputLabel htmlFor='auth-login-v2-password' error={Boolean(errors.password)}>
                  Password
                </InputLabel>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <OutlinedInput
                      value={value}
                      label='Password'
                      onBlur={onBlur}
                      onChange={onChange}
                      id='auth-login-v2-password'
                      error={Boolean(errors.password)}
                      type={showPassword ? 'search' : 'password'}
                      autoComplete='off'
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  )}
                />
                {errors.password && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth sx={{ mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Controller
                    name='organisation'
                    control={control}
                    defaultValue=''
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Autocomplete
                        options={organisationOptions}
                        getOptionLabel={option => option.label}
                        value={organisationOptions.find(option => option.value === value) || null}
                        onChange={(_, newValue) => {
                          onChange(newValue?.value || '')
                        }}
                        onInputChange={(_, inputVal) => setSearchTerm(inputVal)}
                        onBlur={onBlur}
                        renderInput={params => (
                          <TextField
                            {...params}
                            fullWidth
                            margin='normal'
                            error={Boolean(errors.organisation)}
                            helperText={errors.organisation?.message}
                            variant='outlined'
                            autoComplete='off'
                            type='search'
                            label='Organisation'
                            InputProps={{
                              ...params.InputProps,
                              autoComplete: 'off',
                              type: 'search'
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Box>
              </FormControl>

              <FormControl sx={{ my: 0 }} error={Boolean(errors.terms)}>
                <Controller
                  name='terms'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => {
                    return (
                      <FormControlLabel
                        sx={{
                          ...(errors.terms ? { color: 'error.main' } : null),
                          '& .MuiFormControlLabel-label': { fontSize: '0.875rem' }
                        }}
                        control={
                          <Checkbox
                            checked={value}
                            onChange={onChange}
                            sx={errors.terms ? { color: 'error.main' } : null}
                          />
                        }
                        label={
                          <Fragment>
                            <Typography
                              variant='body2'
                              component='span'
                              sx={{ color: errors.terms ? 'error.main' : '' }}
                            >
                              I agree to{' '}
                            </Typography>
                            <Typography
                              href='/'
                              variant='body2'
                              component={Link}
                              sx={{ color: 'primary.main', textDecoration: 'none' }}
                              onClick={e => e.preventDefault()}
                            >
                              privacy policy & terms
                            </Typography>
                          </Fragment>
                        }
                      />
                    )
                  }}
                />
                {errors.terms && (
                  <FormHelperText sx={{ mt: 0, color: 'error.main' }}>{errors.terms.message}</FormHelperText>
                )}
              </FormControl>
              <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
                Sign up
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ mr: 2, color: 'text.secondary' }}>Already have an account?</Typography>
                <Typography href='/login' component={Link} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Sign in instead
                </Typography>
              </Box>
              <Divider
                sx={{
                  '& .MuiDivider-wrapper': { px: 4 },
                  mt: theme => `${theme.spacing(5)} !important`,
                  mb: theme => `${theme.spacing(7.5)} !important`
                }}
              >
                or
              </Divider>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton href='/' component={Link} sx={{ color: '#497ce2' }} onClick={e => e.preventDefault()}>
                  <Icon icon='mdi:facebook' />
                </IconButton>
                <IconButton href='/' component={Link} sx={{ color: '#1da1f2' }} onClick={e => e.preventDefault()}>
                  <Icon icon='mdi:twitter' />
                </IconButton>
                <IconButton
                  href='/'
                  component={Link}
                  onClick={e => e.preventDefault()}
                  sx={{ color: theme => (theme.palette.mode === 'light' ? '#272727' : 'grey.300') }}
                >
                  <Icon icon='mdi:github' />
                </IconButton>
                <IconButton href='/' component={Link} sx={{ color: '#db4437' }} onClick={e => e.preventDefault()}>
                  <Icon icon='mdi:google' />
                </IconButton>
              </Box>
            </form>
          </BoxWrapper>
        </Box>
      </RightWrapper>
    </Box>
  )
}
Register.getLayout = page => <BlankLayout>{page}</BlankLayout>
Register.authGuard = false
// LoginPage.authGuard = false
Register.orgGuard = false

export default Register
