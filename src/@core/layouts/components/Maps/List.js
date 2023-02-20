import React, { useState } from 'react'
import { CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import PlaceDetails from './PlaceDetails'

function List({ places, childClicked }) {
  const [type, setType] = useState('Pharmacies')

  console.log({ childClicked })

  return (
    <>
      <Typography style={{ marginBottom: '20px' }}>Service Providers around you</Typography>
      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>

        <Select
          value={type}
          label='Type'
          onChange={e => {
            setType(e.target.value)
          }}
          labelId='validation-basic-select'
          aria-describedby='validation-basic-select'
        >
          <MenuItem value='Pharmacies'>Pharmacies</MenuItem>
          <MenuItem value='Surgeries'>Surgeries</MenuItem>
        </Select>
      </FormControl>
      {places?.map((place, i) => {
        return <PlaceDetails key={i} place={place} />
      })}
    </>
  )
}

export default List
