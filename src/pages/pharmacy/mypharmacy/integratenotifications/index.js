import React, { useState } from 'react'
import { TextField, Button, CircularProgress, Typography } from '@mui/material'
import { supabase } from 'src/configs/supabase'
import { useSelector } from 'react-redux'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'
const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingValue, setExistingValue] = useState('')
  const orgId = useSelector(state => state.organisation.organisation.id)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('success')

  const showSnackMessage = (message, severity) => {
    setMessage(message)
    setSeverity(severity)
    setOpen(true)
  }

  const onCheck = async () => {
    setLoading(true)
    setError('')
    try {
      // Here you would call the backend to check for an existing value
      const { data, error } = await supabase
        .from('pharmacy_settings')
        .select('notify_api_key')
        .eq('pharmacy_id', orgId)
        .single()
      if (error) {
        showSnackMessage('Failed to check for existing value. Please try again.', 'error')
        throw error
      }

      showSnackMessage('Existing value found.', 'success')
      return data?.notify_api_key
    } catch (err) {
      showSnackMessage('Failed to check for existing value. Please try again.', 'error')
      setError('Failed to check for existing value. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onSave = async () => {
    setLoading(true)
    setError('')
    try {
      // Here you would call the backend to save the API key
      const { data, error } = await supabase.from('pharmacy_settings').upsert(
        {
          notify_api_key: apiKey,
          pharmacy_id: orgId
        },
        { onConflict: 'pharmacy_id' }
      )
      if (error) {
        showSnackMessage('Failed to save API Key. Please try again.', 'error')
        throw error
      }
    } catch (err) {
      showSnackMessage('Failed to save API Key. Please try again.', 'error')
      setError('Failed to save API Key. Please try again.')
    } finally {
      showSnackMessage('API Key saved successfully.', 'success')
      setApiKey('')
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      // Here you would call the backend to save the API key
      // onSave(apiKey) should be an async function passed as a prop
      await onSave(apiKey)
    } catch (err) {
      setError('Failed to save API Key. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const checkForExistingValue = async () => {
    setLoading(true)
    setError('')
    try {
      // onCheck() should be an async function passed as a prop
      // that checks for existing value and returns it
      const value = await onCheck()
      setExistingValue(value)
    } catch (err) {
      setError('Failed to check for existing value. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    // Check if there's an existing API key on component mount
    checkForExistingValue()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      {loading && <CircularProgress />}
      {!loading && (
        <>
          <Typography variant='h6'>API Key Input</Typography>
          {existingValue && (
            <Typography variant='body1'>
              Existing value: {'*'.repeat(existingValue.length - 4) + existingValue.slice(-4)}
            </Typography>
          )}
          <TextField
            fullWidth
            label='API Key'
            variant='outlined'
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            error={!!error}
            helperText={error || 'Enter your API key here'}
            margin='normal'
          />
          <Button variant='contained' color='primary' onClick={handleSave} disabled={!apiKey}>
            Save Key
          </Button>
        </>
      )}
      <CustomSnackbar
        open={open}
        setOpen={setOpen}
        message={message}
        severity={severity}
        vertical={'top'}
        horizontal={'center'}
      />
    </div>
  )
}

export default ApiKeyInput
