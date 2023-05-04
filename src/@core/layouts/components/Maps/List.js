import React, { useEffect, useState, createRef } from 'react'
import { CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import PlaceDetails from './PlaceDetails'

function List({ places, childClicked, loading }) {
  const [type, setType] = useState('Pharmacies')
  const [elRefs, setElRefs] = useState([])

  // console.log({ childClicked })
  useEffect(() => {
    const refs = Array(places?.length)
      .fill()
      .map((_, i) => elRefs[i] || createRef())
    setElRefs(refs)
  }, [places])

  return (
    <>
      {loading ? (
        <div>
          <CircularProgress />
        </div>
      ) : (
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
          <Grid container style={{ height: 600, overflow: 'scroll' }} className='scroll-container'>
            {places?.map((place, i) => {
              return (
                <div ref={elRefs[i]} key={i}>
                  <PlaceDetails place={place} selected={Number(childClicked) == i} refProp={elRefs[i]} />
                </div>
              )
            })}
          </Grid>
        </>
      )}
    </>
  )
}

export default List
