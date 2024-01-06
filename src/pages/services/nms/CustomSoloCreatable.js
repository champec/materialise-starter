// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'

const filter = createFilterOptions()

const CustomSoloCreatable = ({
  data, // array of options
  label = 'Select option', // default label
  style = { width: '100%' }, // default style
  value, // value to be set
  groupBy, // groupBy function
  getOptionLabel = option => (typeof option === 'string' ? option : option.title || ''), // handle both strings and objects
  renderOption = (props, option) => <li {...props}>{typeof option === 'string' ? option : option.title || ''}</li>,
  onChange, // function to call when the value changes
  multiple = true // Set true as default for multi-select
}) => {
  // ** State

  const handleChange = (event, newValue) => {
    // If it's a multi-select scenario, expect newValue to be an array
    if (multiple) {
      let valueToSet = []

      // Check if newValue is an array (expected in multi-select mode)
      if (Array.isArray(newValue)) {
        // Map over the array to handle simple strings and objects
        valueToSet = newValue.map(item => {
          // Check if it's an object and has 'inputValue' - indicating a newly added value
          if (typeof item === 'object' && item && 'inputValue' in item) {
            return item.inputValue // Use the actual inputValue for newly added values
          }
          return item // For existing values or simple strings
        })
      } else {
        // If newValue is not an array, directly use the value (this scenario might not be common in multiple mode)
        valueToSet = newValue
      }

      // Propagate the cleaned array or single value up to the parent component
      if (onChange) {
        onChange(valueToSet)
      }
    } else {
      // For a single-select scenario, newValue is just a single value (not an array)
      // This might be an object (for selected option) or a string (for newly added values)
      let singleValue = newValue
      if (typeof newValue === 'object' && newValue && 'inputValue' in newValue) {
        // It's a newly added value, use the inputValue
        singleValue = newValue.inputValue
      }
      // Propagate the single value up to the parent component
      if (onChange) {
        onChange(singleValue)
      }
    }
  }

  return (
    <Autocomplete
      freeSolo
      multiple={multiple} // Enable multi-select
      filterSelectedOptions
      clearOnBlur
      value={value}
      groupBy={groupBy}
      selectOnFocus
      handleHomeEndKeys
      sx={style}
      options={data}
      id='autocomplete-free-solo-with-text'
      renderOption={renderOption}
      renderInput={params => <TextField {...params} label={label} />}
      getOptionLabel={getOptionLabel}
      onChange={handleChange}
      filterOptions={(options, params) => {
        const filtered = filter(options, params)
        const { inputValue } = params
        const isExisting = options.some(option => inputValue === option.title)
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            title: `Add "${inputValue}"`
          })
        }
        return filtered
      }}
    />
  )
}

export default CustomSoloCreatable
