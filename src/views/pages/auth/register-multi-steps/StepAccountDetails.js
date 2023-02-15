// ** React Imports
import { useState, SyntheticEvent } from 'react'

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

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

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

const LoginIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const LoginIllustration = styled('img')(({ theme }) => ({
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
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

//function definition and import function to change steps called handleNext
const StepAccountDetails = ({ handleNext, authOrg, authUser }) => {
  // ** Hooks
  const theme = useTheme()
  const name = authOrg?.organisation?.organisation_name
  const { settings } = useSettings()
  //the following hook handles the form data and also received the validation library schema set above
  // we are extracting the methods provided by hook useForm from library HookForms which allows us to perform certain action
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
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const imageSource = skin === 'bordered' ? 'auth-v2-login-illustration-bordered' : 'auth-v2-login-illustration'

  // ** States
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [tabValue, setTabValue] = useState('1')
  const [values, setValues] = useState({
    showPassword: false,
    showConfirmPassword: false
  })

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

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
            <Box sx={{ mb: 6 }}>
              <TypographyStyled variant='h5'>{`Welcome to ${name}! 👋🏻`}</TypographyStyled>
              <Typography variant='body2'>Please sign-in to your account and start the adventure</Typography>
            </Box>
            <TabContext value={tabValue}>
              <TabList variant='fullWidth' onChange={handleTabChange} aria-label='full width tabs example'>
                <Tab value='1' label='Login' />
                <Tab value='2' label='Already Signed In?' />
              </TabList>
              <TabPanel value='1'>
                {/* <div style={(marginTop = '20px')}></div> */}
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
                />
              </TabPanel>
              <TabPanel value='2'>
                <Typography>
                  Chocolate bar carrot cake candy canes sesame snaps. Cupcake pie gummi bears jujubes candy canes. Chupa
                  chups sesame snaps halvah.
                </Typography>
              </TabPanel>
            </TabContext>
          </BoxWrapper>
        </Box>
        {/* <RightWrapper
          sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}
        ></RightWrapper> */}
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
  setRememberMe,
  setShowPassword
}) {
  //** methods

  // onsubmit is received data from the handleChange hook provided by RHF and then we can do what we want with it
  // in this case we pass the credentials to login context using the predefined context changer, login, which returns any errors
  const onSubmit = data => {
    const { email, password } = data
    console.log(authUser.user)
    //fetch user data
    authUser.login({ email, password, rememberMe }, err => {
      console.log(err.message)
      setError('email', {
        type: 'manual',
        message: 'Email or Password is invalid'
      })
    })
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const handleClickShowConfirmPassword = () => {
    setValues({ ...values, showConfirmPassword: !values.showConfirmPassword })
  }

  const handleMouseDownConfirmPassword = event => {
    event.preventDefault()
  }

  const handleLogOut = async () => {
    await authOrg.logout()
  }

  //** methods

  return (
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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
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
        {/* custom button form below */}
        <Grid container spacing={5}>
          {/* <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <TextField label='Username' placeholder='johndoe' />
          </FormControl>
        </Grid> */}

          {/* <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel htmlFor='input-password'>Password</InputLabel>
            <OutlinedInput
              label='Password'
              id='input-password'
              type={values.showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    edge='end'
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    <Icon icon={values.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid> */}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleLogOut}
                variant='contained'
                startIcon={<Icon icon='mdi:chevron-left' fontSize={20} />}
              >
                Logout
              </Button>
              <Button variant='contained' type='submit' endIcon={<Icon icon='mdi:chevron-right' fontSize={20} />}>
                Login
              </Button>
            </Box>
          </Grid>
        </Grid>
        {/*custom button from form below */}
      </Box>
      {/* <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
      Login
    </Button> */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Typography sx={{ mr: 2, color: 'text.secondary' }}>New on our platform?</Typography>
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
    </form>
  )
}
