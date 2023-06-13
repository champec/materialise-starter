import React from 'react'
import { Card, CardContent, IconButton, Menu, MenuItem } from '@mui/material'

import Icon from 'src/@core/components/icon'

const CardHeader = ({ title, columnsubtitle }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Card>
      <CardContent>
        <IconButton className='float-end' onClick={handleClick}>
          <Icon className='font-medium-3 cursor-pointer' icon='more-vertical' />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleClose}>Edit</MenuItem>
          <MenuItem onClick={handleClose}>Delete</MenuItem>
        </Menu>
        <h4>{title}</h4>
        <p>{columnsubtitle}</p>
      </CardContent>
    </Card>
  )
}

export default CardHeader
