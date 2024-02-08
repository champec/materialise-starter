import React, { useState } from 'react'
import { TextField, Button, CircularProgress, Typography } from '@mui/material'
import { supabase } from 'src/configs/supabase'
import { useSelector } from 'react-redux'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'
import { set } from 'nprogress'

const MIN_KEY_LENGTH = 8; // Define a constant for minimum length requirement

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [templateKey, setTemplateKey] = useState(''); // New state for template key
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(''); // Separate error state for API key
  const [templateError, setTemplateError] = useState(''); // Separate error state for Template key
  const [existingApiValue, setExistingApiValue] = useState('');
  const [existingTemplateValue, setExistingTemplateValue] = useState(''); // State to hold existing template key value
  const orgId = useSelector(state => state.organisation.organisation.id);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const validateKeys = () => {
    let isValid = true;
    if (!apiKey) {
      setApiError('API Key is required.');
      isValid = false;
    } else {
      setApiError('');
    }

    if (!templateKey) {
      setTemplateError('Template Key is required.');
      isValid = false;
    } else {
      setTemplateError('');
    }

    return isValid;
  };

  const showSnackMessage = (message, severity) => {
    setMessage(message)
    setSeverity(severity)
    setOpen(true)
  }

  const onCheck = async () => {
    setLoading(true);
    setApiError('');
    setTemplateError('');
    let existingApi = '';
    let existingTemplate = '';

    try {
      const { data, error } = await supabase
        .from('pharmacy_settings')
        .select('notify_api_key, message_template')
        .eq('pharmacy_id', orgId)
        .single();

      if (error) {
        throw error;
      }

      // Check if API key exists and is valid
      if (data?.notify_api_key) {
        existingApi = data.notify_api_key;
        // You can add more specific validation for the API key here if needed
      } else {
        setApiError('No valid API Key found.');
      }

      // Check if Template key exists and is valid
      if (data?.message_template) {
        existingTemplate = data.message_template;
        // You can add more specific validation for the Template key here if needed
      } else {
        setTemplateError('No valid Template Key found.');
      }

      if (existingApi && existingTemplate) {
        showSnackMessage('Both API and Template Keys are valid.', 'success');
      } else if (existingApi || existingTemplate) {
        showSnackMessage('One of the keys is valid.', 'warning');
      }

    } catch (err) {
      showSnackMessage('Failed to check for existing values. Please try again.', 'error');
    } finally {
      setLoading(false);
    }

    // Return the existing keys to update the state, regardless of validation
    return { api: existingApi, template: existingTemplate };
  };

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      setApiError('API Key is required.');
      return; // Stop the save operation if the API Key is missing
    }

    if (apiKey.length < MIN_KEY_LENGTH) {
      setApiError(`API Key must be at least ${MIN_KEY_LENGTH} characters long.`);
      return; // Stop the save operation if the API Key is too short
    }

    setLoading(true);
    try {
      const {data, error } = await supabase.from('pharmacy_settings').upsert(
        {
          notify_api_key: apiKey,
          pharmacy_id: orgId
        },
        { onConflict: 'pharmacy_id' }
      ).select('notify_api_key');

      if (error) {
        setApiError('Failed to save API Key. Please try again.');
        throw error;
      }
      showSnackMessage('API Key saved successfully.', 'success');
      setApiError('');
      setExistingApiValue(data[0].notify_api_key);
      setApiKey(''); // Reset API key input field after successful save
    } catch (err) {
      // Error handling is already done above
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplateKey = async () => {
    if (!templateKey) {
      setTemplateError('Template Key is required.');
      return; // Stop the save operation if the Template Key is missing
    }

    if (templateKey.length < MIN_KEY_LENGTH) {
      setTemplateError(`Template Key must be at least ${MIN_KEY_LENGTH} characters long.`);
      return; // Stop the save operation if the Template Key is too short
    }

    setLoading(true);
    try {
      const {data, error } = await supabase.from('pharmacy_settings').upsert(
        {
          message_template: templateKey,
          pharmacy_id: orgId
        },
        { onConflict: 'pharmacy_id' }
      ).select('message_template')


      if (error) {
        setTemplateError('Failed to save Template Key. Please try again.');
        throw error;
      }
      console.log('data', data)
      setTemplateError('');
      setExistingTemplateValue(data[0].message_template);
      showSnackMessage('Template Key saved successfully.', 'success');
      setTemplateKey(''); // Reset Template key input field after successful save
    } catch (err) {
      // Error handling is already done above
    } finally {
      setLoading(false);
    }
  };


  const checkForExistingValue = async () => {
    setLoading(true);
    try {
      const values = await onCheck();
      setExistingApiValue(values.api);
      setExistingTemplateValue(values.template);
    } catch (err) {
      // Error handling is already done in onCheck

    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Check if there's an existing API key on component mount
    checkForExistingValue()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      {loading && <CircularProgress />}
      {!loading && (
        <>
          <Typography variant='h6'>API and Template Key Input</Typography>
          {existingApiValue && (
            <Typography variant='body1'>
              Existing API value: {'*'.repeat(existingApiValue.length - 4) + existingApiValue.slice(-4)}
            </Typography>
          )}
          <TextField
            fullWidth
            label='API Key'
            variant='outlined'
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            error={!!apiError}
            helperText={apiError || 'Enter your API key here'}
            margin='normal'
          />
          <Button
            variant='contained'
            color='primary'
            onClick={handleSaveApiKey}
            disabled={!apiKey || loading}
            style={{ marginBottom: '20px' }} // Added some spacing between the buttons
          >
            Save API Key
          </Button>

          {existingTemplateValue && (
            <Typography variant='body1'>
              Existing Template value: {'*'.repeat(existingTemplateValue.length - 4) + existingTemplateValue.slice(-4)}
            </Typography>
          )}
          <TextField
            fullWidth
            label='Template Key'
            variant='outlined'
            value={templateKey}
            onChange={e => setTemplateKey(e.target.value)}
            error={!!templateError}
            helperText={templateError || 'Enter your Template key here'}
            margin='normal'
          />
          <Button
            variant='contained'
            color='primary'
            onClick={handleSaveTemplateKey}
            disabled={!templateKey || loading}
          >
            Save Template Key
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
  );

}

export default ApiKeyInput
