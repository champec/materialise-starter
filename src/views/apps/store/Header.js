import React from 'react'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const Header = ({ handleShopClick }) => {
  return (
    <AppBar position='static'>
      <Toolbar>
        <Button color='inherit' onClick={handleShopClick}>
          <Icon icon='mdi:arrow-left' />
        </Button>
        <Typography variant='h6' style={{ flexGrow: 1 }}>
          Pharmacy App
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Header
