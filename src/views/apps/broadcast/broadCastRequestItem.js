import React, { forwardRef, use, useEffect, useState } from 'react'

import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid
} from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'
import StepperCustomDot from './elements/StepperCustomDot'

const itemOptions = ['drug', 'appliance', 'stationary', 'OTC', 'drivers', 'other']
const stateOptions = ['full', 'split', 'either']
const transactionOptions = ['replace', 'buy', 'exchange']

function BroadCastRequestItem({ activeStep, setActiveStep, steps, setFormValues, formValues }) {
  // const transactionType = watch('transactionType')

  const onSubmit = data => {
    console.log(data)
  }
  // const formData = watch()
  const CustomInput = forwardRef(({ ...props }, ref) => {
    return <TextField inputRef={ref} label='Date' {...props} />
  })

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <Box mt={2}>
            <FormControl fullWidth>
              <InputLabel id='item-select-label'>Item</InputLabel>
              <Select
                label='Type of Item'
                value={formValues.itemType}
                onChange={event => setFormValues(prev => ({ ...prev, itemType: event.target.value }))}
              >
                {itemOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box mt={2}>
              <TextField
                fullWidth
                label='Name'
                value={formValues.itemname}
                onChange={event => setFormValues(prev => ({ ...prev, itemname: event.target.value }))}
              />
            </Box>
            <Box mt={2}>
              <TextField
                fullWidth
                label='Brand'
                value={formValues.brand}
                onChange={event => setFormValues(prev => ({ ...prev, brand: event.target.value }))}
              />
            </Box>
          </Box>
        )
      case 1:
        return (
          <Box mt={2}>
            <FormControl fullWidth>
              <InputLabel id='quantity-select-label'>Quantity Type</InputLabel>
              <Select
                label='Quantity'
                value={formValues.quantityType}
                onChange={event => setFormValues(prev => ({ ...prev, quantityType: event.target.value }))}
              >
                <MenuItem value='packs'>Packs</MenuItem>
                <MenuItem value='quantity'>Contents</MenuItem>
              </Select>
            </FormControl>

            <Box mt={2}>
              <TextField
                fullWidth
                label='Quantity Number'
                value={formValues.quantityNumber}
                onChange={event => setFormValues(prev => ({ ...prev, quantityNumber: event.target.value }))}
                type='number'
              />
            </Box>
            <Box mt={2}>
              <FormControl fullWidth>
                <InputLabel id='state-select-label'>State</InputLabel>
                <Select
                  label='State'
                  value={formValues.state}
                  onChange={event => setFormValues(prev => ({ ...prev, state: event.target.value }))}
                >
                  {stateOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )
      case 2:
        return (
          <Box mt={2}>
            <FormControl fullWidth>
              <InputLabel id='transaction-select-label'>Transaction Type</InputLabel>
              <Select
                label='Transaction Type'
                value={formValues.transactionType}
                onChange={event => setFormValues(prev => ({ ...prev, transactionType: event.target.value }))}
              >
                {transactionOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formValues.transactionType === 'buy' && (
              <Box mt={2}>
                <TextField
                  fullWidth
                  label='Offer Price'
                  value={formValues.offerPrice}
                  onChange={event => setFormValues(prev => ({ ...prev, offerPrice: event.target.value }))}
                  type='number'
                  InputProps={{ startAdornment: '£' }}
                />
                <Typography variant='caption'>Please check tariff price before making offer.</Typography>
              </Box>
            )}
            {formValues.transactionType === 'exchange' && (
              <Box mt={2}>
                <TextField
                  fullWidth
                  label='Exchange For'
                  value={formValues.exchangeFor}
                  onChange={event => setFormValues(prev => ({ ...prev, exchangeFor: event.target.value }))}
                  multiline
                  rows={2}
                />
              </Box>
            )}
            {formValues.transactionType === 'replace' && (
              <Box mt={2}>
                <DatePickerWrapper sx={{ '& .MuiFormControl-root': { width: '100%' } }}>
                  <DatePicker
                    selected={formValues.replaceDate}
                    onChange={date => setFormValues(prev => ({ ...prev, replaceDate: date }))}
                    dateFormat='MM/dd/yyyy'
                    placeholderText='Estimated Replace Date'
                    customInput={<CustomInput />}
                  />
                </DatePickerWrapper>
              </Box>
            )}
          </Box>
        )
      case 3:
        return (
          <Box mt={2}>
            <Typography variant='h6'>Summary</Typography>
            <br />
            <Typography variant='h7'>Confirm the details and press submit below to submit the form</Typography>
            <br />
            <br />
            <Typography>Item: {formValues.itemType}</Typography>
            <Typography>Name: {formValues.itemname}</Typography>
            <Typography>Brand: {formValues.brand}</Typography>
            <Typography>Quantity Type: {formValues.quantityType}</Typography>
            <Typography>Quantity Number: {formValues.quantityNumber}</Typography>
            <Typography>State: {formValues.state}</Typography>
            <Typography>Transaction Type: {formValues.transactionType}</Typography>
            {formValues.transactionType === 'buy' && <Typography>Offer Price: {formValues.offerPrice}</Typography>}
            {formValues.transactionType === 'exchange' && (
              <Typography>Exchange For: {formValues.exchangeFor}</Typography>
            )}
            {formValues.transactionType === 'replace' && (
              <Typography>
                Replace Date:{' '}
                {(formValues.replaceDate instanceof Date ? formValues.replaceDate : new Date()).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        )
      default:
        return 'Unknown stepIndex'
    }
  }

  return (
    <StepperWrapper>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel StepIconComponent={StepperCustomDot}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        <div>
          <div>{getStepContent(activeStep)}</div>
          <div>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }} mt={3}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              {activeStep === steps.length ? null : (
                <Button variant='contained' color='primary' onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              )}
            </Grid>
          </div>
        </div>
      </div>
    </StepperWrapper>
  )
}

export default BroadCastRequestItem
