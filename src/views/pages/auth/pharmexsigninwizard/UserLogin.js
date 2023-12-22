// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import FormHelperText from '@mui/material/FormHelperText'
import { Snackbar, Alert, Card, CardContent, Avatar } from '@mui/material'

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

import { styled, useTheme } from '@mui/material/styles'
import MuiFormControlLabel from '@mui/material/FormControlLabel'

// ** RTK imports
import { useDispatch, useSelector } from 'react-redux'
import { login, setUserError } from 'src/store/auth/user'
import { logout } from 'src/store/auth/organisation'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// this library validates form entries to match as follows
const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(5).required()
})

//form default values
const defaultValues = {
  password: 'example-password',
  email: 'champe@live.co.uk'
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
const UserLoginForm = ({ handleNext, authOrg, authUser, auth }) => {
  const error = useSelector(state => state.user.userError)
  const org = useSelector(state => state.organisation.organisation)

  const [openSuccess, setOpenSuccess] = useState(false)
  const [openError, setOpenError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(error)

  useEffect(() => {
    console.log('useEffect', error)
    if (error) {
      setOpenError(true)
    }
  }, [error])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setErrorMessage(null)
    setOpenSuccess(false)
    setOpenError(false)
  }

  const handleLogout = () => {
    dispatch(logout())
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

  const dispatch = useDispatch()

  const onSubmit = data => {
    const { email, password } = data

    dispatch(login({ email, password }))
      .unwrap()
      .then(res => {
        // Do something with the result if needed
        console.log('SUPABASE LOGIN', res)
        const accessToken = res.access_token
        const refreshToken = res.refresh_token
        const name = res.username
        const email = res.email
        const lastSignIn = new Date()
        const avatar = res.avatar_url

        // Get local storage users
        let users = JSON.parse(localStorage.getItem('pharmexusers')) || []

        // Prepare new user object
        const newUser = { name, email, avatar, lastSignIn, accessToken, refreshToken }

        // Check if the user already exists based on email
        const existingUserIndex = users.findIndex(user => user.email === email)

        if (existingUserIndex !== -1) {
          // User exists, update their details
          users[existingUserIndex] = newUser
        } else {
          // New user, add to array
          users.push(newUser)
        }

        // Update local storage
        localStorage.setItem('pharmexusers', JSON.stringify(users))
      })
      .catch(err => {
        console.log(err)
        dispatch(setUserError(err))
      })

    handleNext()
  }

  // ** States
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [values, setValues] = useState({
    showPassword: false,
    showConfirmPassword: false
  })

  return (
    <>
      <Box /*className='content-right'*/>
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
            <Box>
              {org ? (
                <Card sx={{ mb: 4 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    {org.avatar_url ? (
                      <Avatar src={org.avatar_url} sx={{ mr: 2 }} />
                    ) : (
                      <Avatar sx={{ mr: 2 }}>{org.organisation_name.charAt(0)}</Avatar>
                    )}
                    <Typography variant='h6' component='div'>
                      {org.organisation_name} is logged in
                    </Typography>
                    <Button onClick={handleLogout} sx={{ ml: 2 }}>
                      Logout
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
              <Box sx={{ p: 7, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Rest of the component */}
              </Box>
            </Box>
            <Box sx={{ mb: 6 }}>
              <TypographyStyled variant='h5'>{`Welcome to PharmEx! 👋🏻`}</TypographyStyled>
              <Typography variant='body2'>Please sign-in to your account and start the adventure</Typography>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
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
              <Box
                sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
              >
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
              </Box>
              <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
                Login
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ mr: 2, color: 'text.secondary' }}>Is Your Pharmacy Not Using PharmEx?</Typography>
                <Typography href='/register' component={Link} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Get In Touch Today
                </Typography>
              </Box>
              <Divider
                sx={{
                  '& .MuiDivider-wrapper': { px: 4 },
                  mt: theme => `${theme.spacing(5)} !important`,
                  mb: theme => `${theme.spacing(7.5)} !important`
                }}
              >
                Px
              </Divider>
            </form>
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
    </>
  )
}

export default UserLoginForm
