import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from 'src/configs/supabase'
import { Box, Button, Typography } from '@mui/material'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'

const AzureIntegration = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const azureClientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
  const redirectUri = '/pharmacy/mypharmacy/integratemail'
  const orgId = useSelector(state => state.organisation.organisation.id)
  const router = useRouter()

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

    // calculate the date 90 days from now in time stamptz format
    const expiryDate = dayjs().add(expires_in, 'second').format('YYYY-MM-DD HH:mm:ssZ')

    try {
      const { data, error } = await supabase.from('pharmacy_settings').insert({
        nhs_mail_access_token: access_token,
        nhs_mail_refresh_token: expiryDate,
        pharmacy_id: orgId
      })

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
    </Box>
  )
}

// AzureIntegration.getLayout = page => <BlankLayout>{page}</BlankLayout>
// AzureIntegration.authGuard = false
// AzureIntegration.orgGuard = false

export default AzureIntegration
