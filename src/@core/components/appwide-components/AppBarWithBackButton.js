import { AppBar, Toolbar, Button, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'

function AppBarWithBackButton({ onBackClick, title }) {
  return (
    <div>
      <AppBar position='static'>
        <Toolbar>
          <Button color='inherit' onClick={onBackClick}>
            <Icon icon='mdi:arrow-left' />
          </Button>
          <Typography variant='h6' style={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default AppBarWithBackButton
