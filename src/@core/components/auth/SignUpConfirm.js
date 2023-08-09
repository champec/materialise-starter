import { Card, Typography, Link, Box, Button, Divider } from '@mui/material'

const SignUpConfirm = ({ email, firstName, org }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Card sx={{ p: 4, width: 400 }}>
        <Typography variant='h5' align='center'>
          Thank you for signing up, {firstName || 'dear friend'}! 🎉
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography paragraph align='center'>
          We've sent a confirmation email to <b>{email || 'the email you used'}</b>. Please click the link in the email
          to confirm your account.
        </Typography>

        <Typography paragraph align='center'>
          Didn't get the email? Check your spam folder or contact us at
          <Link href='mailto:help@pharmex.app'> help@pharmex.app</Link> and we'll help you out!
        </Typography>

        {org && (
          <Typography paragraph align='center'>
            You may have to wait for <b>{org || 'the organisation admin'}</b>. to accept your requtest.
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Button variant='contained' component={Link} href='/login'>
            Return to Login
          </Button>
        </Box>
      </Card>
    </Box>
  )
}

export default SignUpConfirm
