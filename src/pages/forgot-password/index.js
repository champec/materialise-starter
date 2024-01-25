// ** Next Import
import Link from 'next/link'
import { useState } from 'react'

// ** MUI Components
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'
import { CircularProgress } from '@mui/material'

import { supabase } from 'src/configs/supabase'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// Styled Components
const ForgotPasswordIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
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

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  '& svg': { mr: 1.5 },
  alignItems: 'center',
  textDecoration: 'none',
  justifyContent: 'center',
  color: theme.palette.primary.main
}))

const ForgotPassword = () => {
  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const [showPasswordSentScreen, setShowPasswordSentScreen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarDuration, setSnackbarDuration] = useState(10000)

  // ** Vars
  const { skin } = settings
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const handleSubmit = async e => {
    e.preventDefault()
    const email = e.target.elements.email?.value
    console.log('Email Submitted:', email)
    setLoading(true)
    setEmail(email)

    // send a password reset to supabase
    const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://pharmex.app/reset-password'
    })

    if (error) {
      setSnackbarSeverity('error')
      setSnackbarMessage(error.message)
      setOpenSnackbar(true)
      setLoading(false)
      return
    }

    setSnackbarSeverity('success')
    setSnackbarMessage('Password reset email sent')
    setOpenSnackbar(true)
    setLoading(false)
    setShowPasswordSentScreen(true)
  }

  const resetForm = () => {
    setShowPasswordSentScreen(false)
    setEmail('')
  }

  const imageSource =
    skin === 'bordered' ? 'auth-v2-forgot-password-illustration-bordered' : 'auth-v2-forgot-password-illustration'
  const EmailSentScreen = () => {
    return (
      <BoxWrapper>
        <Box sx={{ mb: 6 }}>
          <TypographyStyled variant='h5'>Password Reset Email Sent</TypographyStyled>
          <Typography variant='body2'>{`We've sent a password reset link to ${email}.`}</Typography>
          <Typography variant='body2'>
            Please check your email for a link to reset your password. If it doesn't appear within a few minutes, check
            your spam folder.
          </Typography>
        </Box>

        <Button fullWidth size='large' onClick={resetForm} variant='contained' sx={{ mb: 5.25 }}>
          Resend Email?
        </Button>
        <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LinkStyled href='/login'>
            <Icon icon='mdi:chevron-left' fontSize='2rem' />
            <span>Back to login</span>
          </LinkStyled>
        </Typography>
      </BoxWrapper>
    )
  }

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <ForgotPasswordIllustrationWrapper>
            <ForgotPasswordIllustration
              alt='forgot-password-illustration'
              src={`/images/pages/${imageSource}-${theme.palette.mode}.png`}
            />
          </ForgotPasswordIllustrationWrapper>
          <FooterIllustrationsV2 image={`/images/pages/auth-v2-forgot-password-mask-${theme.palette.mode}.png`} />
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
          {showPasswordSentScreen ? (
            <EmailSentScreen />
          ) : (
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
                <Typography variant='h6' sx={{ ml: 2, lineHeight: 1, fontWeight: 700, fontSize: '1.5rem !important' }}>
                  {themeConfig.templateName}
                </Typography>
              </Box>
              <Box sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>Forgot Password? 🔒</TypographyStyled>
                <Typography variant='body2'>
                  Enter your email and we&prime;ll send you instructions to reset your password
                </Typography>
              </Box>
              <form noValidate onSubmit={handleSubmit}>
                <TextField
                  autoFocus
                  autoComplete='email'
                  type='email'
                  name='email'
                  label='Email'
                  sx={{ display: 'flex', mb: 4 }}
                />
                <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 5.25 }}>
                  {loading ? <CircularProgress size={24} /> : 'Send reset link'}
                </Button>
                <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LinkStyled href='/login'>
                    <Icon icon='mdi:chevron-left' fontSize='2rem' />
                    <span>Back to login</span>
                  </LinkStyled>
                </Typography>
              </form>
            </BoxWrapper>
          )}
        </Box>
      </RightWrapper>
      <CustomSnackbar
        open={openSnackbar}
        setOpen={setOpenSnackbar}
        vertical={'top'}
        horizontal={'center'}
        severity={snackbarSeverity}
        message={snackbarMessage}
        duration={snackbarDuration}
      />
    </Box>
  )
}
ForgotPassword.guestGuard = true
ForgotPassword.authGuard = false
ForgotPassword.orgGuard = false
ForgotPassword.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default ForgotPassword
