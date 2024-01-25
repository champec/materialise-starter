// ** Next Import
import Link from 'next/link'
import { useState, useEffect } from 'react'

// ** MUI Components
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { CircularProgress } from '@mui/material'

import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'

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
import Router from 'next/router'
import { useRouter } from 'next/router'

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

const ResetPassword = () => {
  // ** Hooks
  const theme = useTheme()
  const router = useRouter()
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarDuration, setSnackbarDuration] = useState(6000)

  const showSnackbar = (severity, message, duration) => {
    setSnackbarSeverity(severity)
    setSnackbarMessage(message)
    setSnackbarDuration(duration)
    setOpenSnackbar(true)
  }

  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.substring(1) // Remove the '#' character
    const params = new URLSearchParams(hash)
    if (params.get('error')) {
      const errorType = params.get('error')
      const errorMessage = params.get('error_description')?.replace(/\+/g, ' ')
      setError({ type: errorType, message: errorMessage })
      setHasError(true)
      showSnackbar('error', errorMessage, 10000)
    }
  }, [])

  // ** Vars
  const { skin } = settings
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      showSnackbar('error', 'Passwords do not match', 6000)
      return
    }

    // Assuming the user is already in the PASSWORD_RECOVERY state
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
      setLoading(false)
      showSnackbar('error', error.message, 6000)
      return
    }

    if (data) {
      // Redirect user or show success message
      showSnackbar('success', 'Password updated successfully!', 6000)
      // redirect to home page
      Router.push('/')
      console.log('Password updated successfully!')
    }
    setLoading(false)
  }

  const imageSource =
    skin === 'bordered' ? 'auth-v2-reset-password-illustration-bordered' : 'auth-v2-reset-password-illustration'

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          {/* Illustration and Footer */}
          {/* ... */}
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
          {hasError ? (
            <BoxWrapper>
              <BoxWrapper sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>Error</TypographyStyled>
                <Typography variant='body2'>
                  {error?.message || 'An error occurred while resetting your password.'}
                </Typography>
              </BoxWrapper>
              <Button
                fullWidth
                size='large'
                onClick={() => Router.push('/forgot-password')}
                variant='contained'
                sx={{ mb: 5.25 }}
              >
                {'Rsubmit Request'}
              </Button>
              <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LinkStyled href='/login'>
                  <Icon icon='mdi:chevron-left' fontSize='2rem' />
                  <span>Back to login</span>
                </LinkStyled>
              </Typography>
            </BoxWrapper>
          ) : (
            <BoxWrapper>
              <Box sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>Reset Your Password</TypographyStyled>
                <Typography variant='body2'>Enter your new password below.</Typography>
              </Box>
              <form noValidate autoComplete='off' onSubmit={handleSubmit}>
                <TextField
                  autoFocus
                  type='search'
                  label='New Password'
                  autoComplete='off'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  sx={{ display: 'flex', mb: 4 }}
                />
                <TextField
                  type='search'
                  label='Confirm Password'
                  autoComplete='off'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  sx={{ display: 'flex', mb: 4 }}
                />
                {error && (
                  <Typography color='error' sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
                <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 5.25 }}>
                  {loading ? <CircularProgress size={24} /> : 'Reset Password'}
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

ResetPassword.guestGuard = true
ResetPassword.authGuard = false
ResetPassword.orgGuard = false
ResetPassword.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default ResetPassword
