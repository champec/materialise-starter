import React, { useEffect, useState } from 'react';
import {
  Box, Button, FormControl, FormControlLabel, FormHelperText, Grid, Stack, TextField, Typography, Select, MenuItem, FormGroup, FormLabel, RadioGroup, Radio, Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DecisionTrees } from './pathway-forms/DecisionTrees';

function Index({
  handleNext, handleBack, bookingControl, bookingErrors, steps, serviceInfo, setServiceInfo, service, handleBookingSubmit, onSubmit
}) {
  const { handleSubmit, control } = useForm();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const pathway = serviceInfo.clinical_pathway;
    const existingScreening = serviceInfo?.screening;
    const criteriaNode = DecisionTrees[pathway]?.nodes?.criteria_confirmation;

    // Initialize screening only if there's no existing screening data for the selected pathway
    if (criteriaNode && (!existingScreening || !existingScreening[pathway])) {
      const initializedScreening = criteriaNode.criteria.reduce((acc, criterion) => {
        acc[criterion.text] = { ...criterion, response: '' }; // Initialize with an empty response
        return acc;
      }, {});

      setServiceInfo(prev => ({
        ...prev,
        screening: {
          ...prev.screening,
          [pathway]: initializedScreening,
        }
      }));
    }
    // Note: No else clause to reset the screening, preserving existing data if any
  }, [serviceInfo.clinical_pathway, setServiceInfo]);

  const handlePathwayChange = (event) => {
    const newPathway = event.target.value;

    // Update the clinical pathway in the state
    setServiceInfo(prev => ({ ...prev, clinical_pathway: newPathway }));

    // Initialize or reset screening for the new pathway
    const criteriaNode = DecisionTrees[newPathway]?.nodes?.criteria_confirmation;
    if (criteriaNode) {
      // Initialize screening for the new pathway with empty responses
      const initializedScreening = criteriaNode.criteria.reduce((acc, criterion) => {
        acc[criterion.text] = { ...criterion, response: '' }; // Initialize with an empty response
        return acc;
      }, {});

      setServiceInfo(prev => ({
        ...prev,
        screening: { [newPathway]: initializedScreening } // Reset screening to only include the new pathway
      }));
    } else {
      // If "None" is selected or the pathway has no criteria, clear the screening data
      setServiceInfo(prev => ({
        ...prev,
        screening: {}
      }));
    }
  };


  useEffect(() => {
    // Check if the currently selected pathway has any criteria responses set to 'No'
    const currentPathwayScreening = serviceInfo?.screening?.[serviceInfo.clinical_pathway] || {};

    const hasFailedCriteria = currentPathwayScreening && Object.values(currentPathwayScreening).some(criterion => criterion.response === 'No');

    setShowWarning(hasFailedCriteria);
  }, [serviceInfo.screening, serviceInfo.clinical_pathway]); // Depend on both the screening data and the selected pathway



  const handleCriteriaChange = (criterionText, response) => {
    // Update the response for the specific criterion within the currently selected pathway
    setServiceInfo(prev => ({
      ...prev,
      screening: {
        ...prev.screening,
        [serviceInfo.clinical_pathway]: {
          ...prev.screening[serviceInfo.clinical_pathway],
          [criterionText]: { ...prev.screening[serviceInfo.clinical_pathway][criterionText], response: response },
        },
        status: Object.values(prev.screening[serviceInfo.clinical_pathway]).some(criterion => criterion.response === 'No') ? 'failedCriteria' : 'passed',
      }
    }));
  };

  return (
    // <form onSubmit={handleSubmit(data => console.log(data))}>
    <form key={1} onSubmit={handleBookingSubmit(onSubmit)}>
      <Box container spacing={5}>
        {/* Form Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>{steps[0].title}</Typography>
          <Typography variant='caption' component='p'>{steps[0].subtitle}</Typography>
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
          {serviceInfo.clinical_pathway && serviceInfo.screening?.[serviceInfo.clinical_pathway] && Object.entries(serviceInfo.screening[serviceInfo.clinical_pathway]).map(([text, criterion], index) => (
  criterion.required && (
    <FormControl key={index} component="fieldset">
      <FormLabel component="legend">{text}</FormLabel>
      <RadioGroup
        row
        value={criterion.response}
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
          <Button size='large' disabled variant='outlined' color='secondary' onClick={handleBack}>Back</Button>
          <Button size='large' type='submit' variant='contained'>Next</Button>
        </Box>
      </Box>
    </form>
  );
}

export default Index;
