// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Custom Component Imports
import CustomInput from './PickersCustomInput'

const PickersBasic = ({ popperPlacement, label, name, onChange, date }) => {
  return (
    <DatePicker
      selected={date ? new Date(date) : new Date()}
      id='basic-input'
      popperPlacement={popperPlacement}
      onChange={onChange}
      name={name}
      placeholderText='Click to select a date'
      customInput={<CustomInput label={label} />}
    />
  )
}

export default PickersBasic
