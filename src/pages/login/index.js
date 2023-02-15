// ** React Imports
import { useState } from 'react'

import Link from 'next/link'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
// import authillustration from 'src/public/images/pages/auth/auth-v2-register-multi-steps-illustration.png'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import themeConfig from 'src/configs/themeConfig'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Components Imports
import RegisterMultiStepsWizard from 'src/views/pages/auth/register-multi-steps'
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Styled Components
const RegisterMultiStepsIllustration = styled('img')({
  maxWidth: 200,
  height: 'auto',
  maxHeight: '100%'
})

const BoxWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
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

const TypographyStyled = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.18px',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { marginTop: theme.spacing(8) }
}))

const LoginIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const LeftWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12),
  [theme.breakpoints.up('lg')]: {
    maxWidth: 480
  },
  [theme.breakpoints.down(1285)]: {
    maxWidth: 400
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 635
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(12)
  }
}))

const WizardWrapper = styled(Box)(({ theme }) => ({
  maxWidth: 700,
  margin: theme.spacing(0, 'auto'),
  [theme.breakpoints.up('md')]: {
    width: 700
  }
}))

const handleChange = prop => event => {
  setValues({ ...values, [prop]: event.target.value })
}

const handleClickShowPassword = () => {
  setValues({ ...values, showPassword: !values.showPassword })
}

const handleMouseDownPassword = event => {
  event.preventDefault()
}

const LoginPage = () => {
  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const [values, setValues] = useState({
    password: '',
    showPassword: false
  })

  const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
    '& .MuiFormControlLabel-label': {
      fontSize: '0.875rem',
      color: theme.palette.text.secondary
    }
  }))

  // ** Var
  const { skin } = settings
  const imageSource = skin === 'bordered' ? 'auth-v2-login-illustration-bordered' : 'auth-v2-login-illustration'

  const v2form = () => {
    return (
      <Box className='content-right'>
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
              ></Box>
              <Box sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</TypographyStyled>
                <Typography variant='body2'>Please sign-in to your account and start the adventure</Typography>
              </Box>
              <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
                <TextField autoFocus fullWidth id='email' label='Email' sx={{ mb: 4 }} />
                <FormControl fullWidth>
                  <InputLabel htmlFor='auth-login-v2-password'>Password</InputLabel>
                  <OutlinedInput
                    label='Password'
                    value={values.password}
                    id='auth-login-v2-password'
                    onChange={handleChange('password')}
                    type={values.showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          aria-label='toggle password visibility'
                        >
                          <Icon icon={values.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <Box
                  sx={{
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between'
                  }}
                >
                  <FormControlLabel
                    label='Remember Me'
                    control={<Checkbox />}
                    sx={{ '& .MuiFormControlLabel-label': { color: 'text.primary' } }}
                  />
                  <Typography
                    variant='body2'
                    component={Link}
                    href='/pages/auth/forgot-password-v2'
                    sx={{ color: 'primary.main', textDecoration: 'none' }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>
                <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
                  Login
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Typography sx={{ mr: 2, color: 'text.secondary' }}>New on our platform?</Typography>
                  <Typography
                    component={Link}
                    href='/pages/auth/register-v2'
                    sx={{ color: 'primary.main', textDecoration: 'none' }}
                  >
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
            </BoxWrapper>
          </Box>
        </RightWrapper>
      </Box>
    )
  }

  return (
    <Box className='content-right'>
      {!hidden ? (
        <LeftWrapper>
          <RegisterMultiStepsIllustration
            alt='register-multi-steps-illustration'
            src={'src/public/images/pages/auth/auth-v2-register-multi-steps-illustration.png'}
          />
        </LeftWrapper>
      ) : null}
      <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
        <WizardWrapper>
          <RegisterMultiStepsWizard />
        </WizardWrapper>
      </RightWrapper>
    </Box>
  )
}

LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.authGuard = false
LoginPage.authGuard = false
LoginPage.orgGuard = false

export default LoginPage
