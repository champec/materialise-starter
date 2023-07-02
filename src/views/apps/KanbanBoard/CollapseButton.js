import React from 'react'
import { IconButton } from '@mui/material'
import { Icon } from '@iconify/react'
import { styled } from '@mui/system'

// This is equivalent to the `LaneFooter`
const Footer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(2)
}))

const CollapseButton = ({ collapsed, onClick, laneId }) => {
  return (
    <Footer onClick={onClick}>
      <IconButton>
        <Icon icon={collapsed ? 'mdi:chevron-down' : 'mdi:chevron-up'} />
      </IconButton>
    </Footer>
  )
}

export default CollapseButton
