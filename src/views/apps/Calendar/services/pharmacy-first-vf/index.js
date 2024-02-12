import React, { useEffect, useState } from 'react';
import {
  Box, Button, FormControl, FormControlLabel, FormHelperText, Grid, Stack, TextField, Typography, Select, MenuItem, FormGroup, FormLabel, RadioGroup, Radio, Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DecisionTrees } from './pathway-forms/DecisionTrees';

function Index({
  handleNext, handleBack, bookingControl, bookingErrors, steps, serviceInfo, setServiceInfo, service
}) {
  const { handleSubmit, control } = useForm();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const pathway = serviceInfo.clinical_pathway;
    const existingScreening = serviceInfo.screening;
    const criteriaNode = DecisionTrees[pathway]?.nodes?.criteria_confirmation;

    if (criteriaNode) {
      // Check if there's already screening data for the selected pathway
      if (!existingScreening || !existingScreening[pathway]) {
        // If not, initialize screening for the selected pathway
        const initializedScreening = criteriaNode.criteria.reduce((acc, criterion) => {
          acc[criterion.text] = { ...criterion, response: '' }; // Initialize each criterion with an empty response
          return acc;
        }, {});

        setServiceInfo(prev => ({
          ...prev,
          screening: {
            ...prev.screening,
            [pathway]: initializedScreening,
            status: 'pending' // Initial status
          }
        }));
      } // else, the existing screening data is kept as is
    } else {
      // Reset screening if no pathway is selected or if it doesn't have criteria
      setServiceInfo(prev => ({ ...prev, screening: {}, clinical_pathway: '' }));
    }
  }, [serviceInfo.clinical_pathway, setServiceInfo, serviceInfo.screening]);


  useEffect(() => {
    // Check if any criteria have a response of 'No' and update showWarning accordingly
    const hasFailedCriteria = Object.values(serviceInfo.screening || {}).some(criterion => criterion.response === 'No');
    setShowWarning(hasFailedCriteria);
  }, [serviceInfo.screening]);

  const handlePathwayChange = (event) => {
    const pathway = event.target.value;
    setServiceInfo(prev => ({ ...prev, clinical_pathway: pathway }));
  };

  const handleCriteriaChange = (criterionText, response) => {
    setServiceInfo(prev => ({
      ...prev,
      screening: {
        ...prev.screening,
        [criterionText]: { ...prev.screening[criterionText], response },
        status: Object.values(prev.screening).some(criterion => criterion.response === 'No') ? 'failedCriteria' : 'passed'
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Box container spacing={5}>
        {/* Form Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>{steps[1].title}</Typography>
          <Typography variant='caption' component='p'>{steps[1].subtitle}</Typography>
        </Box>

        <Stack spacing={4}>
          {/* Presenting Complaint */}
          <FormControl fullWidth>
            <Controller
              name='presentingComplaint'
              control={bookingControl}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={serviceInfo?.presenting_complaint || ''}
                  label='Presenting Complaint'
                  multiline
                  rows={4}
                  onChange={e => {
                    onChange(e);
                    setServiceInfo({ ...serviceInfo, presenting_complaint: e.target.value });
                  }}
                  autoComplete='off'
                  error={Boolean(bookingErrors.presenting_complaint)}
                  placeholder='What is wrong with the patient'
                  aria-describedby='stepper-linear-booking-presentingComplain'
                />
              )}
            />
            {bookingErrors.presentingComplaint && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-booking-presentingComplaint'>
                This field is required
              </FormHelperText>
            )}
          </FormControl>

          {/* Clinical Pathway Selection */}
          {/* Clinical Pathway Selection */}
          <FormControl fullWidth>
            <Controller
              name='clinicalPathway'
              control={control}
              defaultValue={serviceInfo.clinical_pathway || ''}
              render={({ field }) => (
                <Select
                  {...field}
                  onChange={handlePathwayChange}
                  displayEmpty
                  value={serviceInfo.clinical_pathway || ''}
                >
                  <MenuItem value='' disabled>Select a Pathway</MenuItem>
                  {Object.keys(DecisionTrees).map((pathway) => (
                    <MenuItem key={pathway} value={pathway}>{pathway.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {bookingErrors.clinicalPathway && (
              <FormHelperText sx={{ color: 'error.main' }}>This field is required</FormHelperText>
            )}
          </FormControl>

          {/* Criteria Confirmation */}
          {serviceInfo.screening && Object.entries(serviceInfo.screening).map(([text, { required, response }], index) => (
            required && (
              <FormControl key={index} component="fieldset">
                <FormLabel component="legend">{text}</FormLabel>
                <RadioGroup
                  row
                  value={response}
                  onChange={(e) => handleCriteriaChange(text, e.target.value)}
                >
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            )
          ))}

          {/* Warning Message */}
          {showWarning && (
            <Alert severity="warning">
              The patient may not be fit for this service based on the provided criteria.
            </Alert>
          )}
        </Stack>

        {/* Form Navigation Buttons */}
        <Box item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button size='large' variant='outlined' color='secondary' onClick={handleBack}>Back</Button>
          <Button size='large' type='submit' variant='contained'>Next</Button>
        </Box>
      </Box>
    </form>
  );
}

export default Index;
