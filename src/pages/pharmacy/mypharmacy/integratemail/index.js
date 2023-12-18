import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from 'src/configs/supabase'
import { Box, Button, Typography } from '@mui/material'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import CustomSnackbar from 'src/views/apps/pharmacy-first/CustomSnackBar'

const AzureIntegration = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('success')

  const azureClientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
  const redirectUri = '/pharmacy/mypharmacy/integratemail'
  const orgId = useSelector(state => state.organisation.organisation.id)
  const router = useRouter()

  const showSnack = (message, severity) => {
    setSnackMessage(message)
    setSnackSeverity(severity)
    setOpenSnack(true)
  }

  const getRedirectUri = () => {
    const protocol = window.location.protocol
    const host = window.location.host // Includes hostname and port if applicable
    const redirectPath = '/pharmacy/mypharmacy/integratemail' // Specify the path where you handle the redirect
    return `${protocol}//${host}${redirectPath}`
  }

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      console.log('Authorization code:', code)
      handleAuthorizationCode(code)
    }
  }, [router])

  const handleIntegration = () => {
    const redirectUri = getRedirectUri()
    const scope = encodeURIComponent('Mail.Read Mail.Send offline_access')
    const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${azureClientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`
    window.location.href = microsoftAuthUrl
  }

  const handleAuthorizationCode = async code => {
    const redirectUrl = getRedirectUri()
    console.log('HANDLE INTE', redirectUrl)
    try {
      const response = await supabase.functions.invoke('getAzureMailTokens', {
        body: {
          code,
          clientId: azureClientId,
          redirectUrl: redirectUrl
        }
      })

      console.log('Tokens:', response)
      const { data, error } = response

      if (data.error) {
        // show the error in a snackbar
        showSnack(data.error, 'error')
        console.log('error', data.error)
        return
      }

      if (data) {
        await storeTokens(data)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Error handling authorization code:', error)
    }
  }

  const storeTokens = async data => {
    const { access_token, refresh_token } = data

    console.log('access_token', access_token, 'refresh_token', refresh_token)
    const expiryDate = dayjs().add(90, 'day')

    // Format the date as a timestamp with time zone string
    const expiryDateFormatted = expiryDate.format()

    try {
      const { data, error } = await supabase.from('pharmacy_settings').upsert(
        {
          nhs_mail_access_token: access_token,
          nhs_mail_refresh_token: refresh_token,
          pharmacy_id: orgId,
          nhs_mail_token_expiry: expiryDateFormatted
        },
        { onConflict: 'pharmacy_id' }
      )

      if (error) throw error
      console.log('Tokens stored:', data)
    } catch (error) {
      console.error('Error storing tokens in Supabase:', error)
    }
  }

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', textAlign: 'center', mt: 5 }}>
      <Typography variant='h4' gutterBottom>
        Azure Integration
      </Typography>
      {isAuthenticated ? (
        <Typography variant='body1' gutterBottom>
          Integration Successful
        </Typography>
      ) : (
        <Button variant='contained' color='primary' onClick={handleIntegration}>
          Integrate with Azure
        </Button>
      )}
      <CustomSnackbar
        vertical='top'
        horizontal='center'
        open={openSnack}
        setOpen={setOpenSnack}
        message={snackMessage}
        severity={snackSeverity}
      />
    </Box>
  )
}

export default AzureIntegration
