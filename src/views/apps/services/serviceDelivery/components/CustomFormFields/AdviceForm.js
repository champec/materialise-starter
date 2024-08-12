import React, { useState, useEffect } from 'react'
import { Box, Typography, TextField, Checkbox, FormControlLabel, FormGroup, FormHelperText } from '@mui/material'

const AdviceForm = ({ id, value, onChange, error, options }) => {
  // Initialize state with all options set to false if not provided in `value`
  const initialState = {
    essentialAdviceGiven: options.reduce((acc, option) => {
      acc[option] = value?.essentialAdviceGiven?.[option] || false
      return acc
    }, {}),
    additionalAdvice: value?.additionalAdvice || ''
  }

  const [state, setState] = useState(initialState)

  useEffect(() => {
    // Update the state if the `value` prop changes
    setState(initialState)
  }, [value, options])

  const handleCheckboxChange = advice => {
    const updatedEssentialAdviceGiven = {
      ...state.essentialAdviceGiven,
      [advice]: !state.essentialAdviceGiven[advice]
    }
    setState(prevState => ({
      ...prevState,
      essentialAdviceGiven: updatedEssentialAdviceGiven
    }))
    onChange({
      ...state,
      essentialAdviceGiven: updatedEssentialAdviceGiven
    })
  }

  const handleTextChange = event => {
    const newText = event.target.value
    setState(prevState => ({
      ...prevState,
      additionalAdvice: newText
    }))
    onChange({
      ...state,
      additionalAdvice: newText
    })
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Essential Advice Discussed
      </Typography>
      <FormGroup>
        {options.map(option => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox checked={state.essentialAdviceGiven[option]} onChange={() => handleCheckboxChange(option)} />
            }
            label={option}
          />
        ))}
      </FormGroup>
      {error && <FormHelperText error>{error}</FormHelperText>}
      <TextField
        label='Additional Advice / Steps Taken'
        value={state.additionalAdvice}
        onChange={handleTextChange}
        fullWidth
        margin='normal'
        multiline
        rows={4}
      />
    </Box>
  )
}

export default AdviceForm
