import React from 'react'
import { Button } from '@mui/material'
import { styled } from '@mui/system'

const LaneSection = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(2)
}))

const AddLaneButton = ({ t, onSelect }) => {
  return (
    <LaneSection>
      <Button variant='contained' color='primary' onClick={onSelect}>
        {'Add lane'}
      </Button>
    </LaneSection>
  )
}

export default AddLaneButton
