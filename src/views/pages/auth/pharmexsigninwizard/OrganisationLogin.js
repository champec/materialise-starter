// ** React Imports
import { useState, SyntheticEvent, useEffect } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import FormHelperText from '@mui/material/FormHelperText'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { Snackbar, Alert } from '@mui/material'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import MuiFormControlLabel from '@mui/material/FormControlLabel'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import CardCongratulationsDaisy from 'src/views/ui/gamification/CardCongratulationsDaisy'

// ** RTK imports
import { useDispatch, useSelector } from 'react-redux'
import { login, setOrganisationError } from 'src/store/auth/organisation'
import { logout } from 'src/store/auth/user'

import { set } from 'nprogress'
import { useRouter } from 'next/router'

// this library validates form entries to match as follows
const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(5).required()
})

//form default values
const defaultValues = {
  password: 'example-password',
  email: 'chronic2157@gmail.com'
}

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
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

//function definition and import function to change steps called handleNext
const StepAccountDetails = ({ handleNext, authOrg, authUser }) => {
  // ** Hooks
  const theme = useTheme()
  const name = useSelector(state => state.organisation.organisation?.organisation_name)
  const username = useSelector(state => state?.user?.user?.username)


  const { settings } = useSettings()

  const error = false // useSelector(state => state.organisation.organisationError)

  const [openSuccess, setOpenSuccess] = useState(false)
  const [openError, setOpenError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(error)
  const router = useRouter()

  const redirectToReturnUrlOrHome = () => {
    // Get the returnUrl query parameter
    const returnUrl = router.query.returnUrl

    // Check if returnUrl exists and is a string
    if (returnUrl && typeof returnUrl === 'string') {
      // Decode the URL and navigate to it
      router.push(decodeURIComponent(returnUrl))
    } else {
      // If no returnUrl, navigate to the home page
      router.push('/')
    }
  }

  console.log(error)

  useEffect(() => {
    console.log('useEffect', error)
    if (error) {
      setOpenError(true)
    }
  }, [error, errorMessage])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setErrorMessage(null)
    setOpenSuccess(false)
    setOpenError(false)
  }

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

  // ** Vars
  const { skin } = settings

  // ** States
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [users, setUsers] = useState([])
  const [tabValue, setTabValue] = useState('2')
  const [values, setValues] = useState({
    showPassword: false,
    showConfirmPassword: false
  })

  const dispatch = useDispatch()

  return (
    <>
      <Box /*  className='content-right'*/>
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
            ></Box>

            {name ? (
              <Box sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>{`Welcome to ${name}! 👋🏻`}</TypographyStyled>
                <Typography variant='body2'>Pharmacy Account is already logged, proceed to site or logout</Typography>
              </Box>
            ) : (
              <Box sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>{`Welcome to ${username}! 👋🏻`}</TypographyStyled>
                <Typography variant='body2'>Please sign-in to the Pharmacy Account</Typography>
              </Box>
            )}
            <Form
              handleSubmit={handleSubmit}
              control={control}
              errors={errors}
              setError={setError}
              rememberMe={rememberMe}
              showPassword={showPassword}
              authUser={authUser}
              authOrg={authOrg}
              setRememberMe={setRememberMe}
              setShowPassword={setShowPassword}
              dispatch={dispatch}
              router={router}
              isSignedIn={name}
              redirect={redirectToReturnUrlOrHome}
            />
          </BoxWrapper>
        </Box>
        <Snackbar open={openSuccess} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity='success'>
            Login successful!
          </Alert>
        </Snackbar>
        <Snackbar open={openError} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity='error'>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
      {/* form below */}
    </>
  )
}

export default StepAccountDetails

function Form({
  handleSubmit,
  control,
  errors,
  rememberMe,
  showPassword,
  authUser,
  authOrg,
  setError,
  router,
  setRememberMe,
  setShowPassword,
  dispatch,
  isSignedIn,
  redirect
}) {
  const onSubmit = data => {
    const { email, password } = data

    dispatch(login({ email, password }))
      // .unwrap()
      .then(res => {
        console.log(res)
        router.push('/')
      })
      .catch(err => {
        console.log(err)
        dispatch(setOrganisationError(err))
      })
  }

  const handleLogOut = async () => {
    dispatch(logout())
  }

  //** methods

  return (
    <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
      {!isSignedIn && (
        <>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  autoFocus
                  label='Email'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.email)}
                  placeholder='admin@materialize.com'
                />
              )}
            />
            {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
          </FormControl>

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
                  onBlur={onBlur}
                  label='Password'
                  onChange={onChange}
                  id='auth-login-v2-password'
                  error={Boolean(errors.password)}
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={20} />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              )}
            />
            {errors.password && (
              <FormHelperText sx={{ color: 'error.main' }} id=''>
                {errors.password.message}
              </FormHelperText>
            )}
          </FormControl>
        </>
      )}

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {!isSignedIn && (
          <>
            <FormControlLabel
              label='Remember Me'
              control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />}
            />

            <Typography
              variant='body2'
              component={Link}
              href='/forgot-password'
              sx={{ color: 'primary.main', textDecoration: 'none' }}
            >
              Forgot Password?
            </Typography>
          </>
        )}

        <Grid container spacing={5}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleLogOut}
                variant='contained'
                startIcon={<Icon icon='mdi:chevron-left' fontSize={20} />}
              >
                Logout
              </Button>
              {isSignedIn ? (
                <Button
                  variant='contained'
                  onClick={redirect}
                  endIcon={<Icon icon='mdi:chevron-right' fontSize={20} />}
                >
                  Continue To Site
                </Button>
              ) : (
                <Button variant='contained' type='submit' endIcon={<Icon icon='mdi:chevron-right' fontSize={20} />}>
                  Login
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {!isSignedIn && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Typography sx={{ mr: 2, color: 'text.secondary' }}>Don't have an account?</Typography>
            <Typography href='/register' component={Link} sx={{ color: 'primary.main', textDecoration: 'none' }}>
              Create an account
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
        </>
      )}
    </form>
  )
}
