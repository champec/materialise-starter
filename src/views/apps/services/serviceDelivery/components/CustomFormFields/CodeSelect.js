import React from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material'

const CodeSelect = ({ id, label, value, onChange, error, options }) => {
  return (
    <Box>
      <FormControl fullWidth error={!!error}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select labelId={`${id}-label`} id={id} value={value} onChange={e => onChange(e.target.value)} label={label}>
          {options.map(option => (
            <MenuItem key={option.code} value={option.code}>
              {option.display}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </Box>
  )
}

export default CodeSelect
