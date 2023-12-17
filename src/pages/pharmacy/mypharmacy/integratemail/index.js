import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from 'src/configs/supabase'
import { Box, Button, Typography } from '@mui/material'

const AzureIntegration = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const azureClientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
  const redirectUri = '/pharmacy/mypharmacy/integratemail'
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
      handleAuthorizationCode(code)
    }
  }, [router])

  const handleIntegration = () => {
    const redirectUri = getRedirectUri()
    const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${azureClientId}&response_type=code&redirect_uri=${redirectUri}&scope=...`
    window.location.href = microsoftAuthUrl
  }

  const handleAuthorizationCode = async code => {
    try {
      const response = await fetch('/api/exchange-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })
      const { accessToken, refreshToken } = await response.json()

      if (accessToken && refreshToken) {
        await storeTokens(accessToken, refreshToken)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Error handling authorization code:', error)
    }
  }

  const storeTokens = async (accessToken, refreshToken) => {
    try {
      const { data, error } = await supabase
        .from('pharmacy_settings')
        .insert({ nhs_mail_access_token: accessToken, nhs_mail_refresh_token: refreshToken })

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

export default AzureIntegration
