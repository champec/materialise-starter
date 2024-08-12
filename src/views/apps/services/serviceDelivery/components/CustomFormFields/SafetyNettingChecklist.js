import { useState } from 'react'
import { Box, FormGroup, FormControlLabel, Button, FormHelperText, Checkbox } from '@mui/material'

const SafetyNettingChecklist = ({ id, value, onChange, error, options, question }) => {
  const [checkedItems, setCheckedItems] = useState(value || {})

  const handleChange = event => {
    const newCheckedItems = {
      ...checkedItems,
      [event.target.name]: event.target.checked
    }
    setCheckedItems(newCheckedItems)
    onChange(newCheckedItems)
  }

  const handleCheckAll = () => {
    const allChecked = options.reduce((acc, option) => {
      acc[option] = true
      return acc
    }, {})
    setCheckedItems(allChecked)
    onChange(allChecked)
  }

  const handleUncheckAll = () => {
    const allUnchecked = options.reduce((acc, option) => {
      acc[option] = false
      return acc
    }, {})
    setCheckedItems(allUnchecked)
    onChange(allUnchecked)
  }

  return (
    <Box>
      <FormGroup>
        {options.map(option => (
          <FormControlLabel
            key={option}
            control={<Checkbox checked={checkedItems[option] || false} onChange={handleChange} name={option} />}
            label={option}
          />
        ))}
      </FormGroup>
      <Box mt={2}>
        <Button variant='outlined' onClick={handleCheckAll} sx={{ mr: 1 }}>
          Check All
        </Button>
        <Button variant='outlined' onClick={handleUncheckAll}>
          Uncheck All
        </Button>
      </Box>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  )
}

export default SafetyNettingChecklist
