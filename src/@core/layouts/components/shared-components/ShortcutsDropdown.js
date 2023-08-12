import { useState, Fragment } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { useSelector } from 'react-redux'
import navigation from 'src/navigation/vertical'

const getShortcuts = organizationId => {
  return JSON.parse(localStorage.getItem(`shortcuts-${organizationId}`)) || []
}

const setShortcuts = (organizationId, shortcuts) => {
  localStorage.setItem(`shortcuts-${organizationId}`, JSON.stringify(shortcuts))
}

const Menu = styled(MuiMenu)({
  '& .MuiMenu-paper': {
    width: 350,
    overflow: 'hidden',
    marginTop: 4,
    '&:sm': {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0
  }
})

const MenuItem = styled(MuiMenuItem)({
  paddingTop: 3,
  paddingBottom: 3,
  '&:not(:last-of-type)': {
    borderBottom: `1px solid #e0e0e0`
  }
})

const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: '30rem'
})

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <Box sx={{ maxHeight: '30rem', overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
  }
}
console.log('navigation', navigation())

const ShortcutsDropdown = props => {
  const { settings } = props
  const organizationId = useSelector(state => state.organisation.organisation?.id)
  const [shortcuts, setShortcutsState] = useState(getShortcuts(organizationId))
  const [anchorEl, setAnchorEl] = useState(null)
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const { direction } = settings
  const [addingShortcut, setAddingShortcut] = useState(false) // To handle displaying navigation items for adding shortcuts

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const handleAddShortcut = shortcut => {
    if (shortcuts.length < 6 && !shortcuts.find(s => s.title === shortcut.title)) {
      const newShortcuts = [...shortcuts, shortcut]
      setShortcutsState(newShortcuts)
      setShortcuts(organizationId, newShortcuts)
    }
  }

  const handleRemoveShortcut = shortcut => {
    const newShortcuts = shortcuts.filter(s => s.title !== shortcut.title)
    setShortcutsState(newShortcuts)
    setShortcuts(organizationId, newShortcuts)
  }

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Icon icon='mdi:view-grid-outline' />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{ cursor: 'default', userSelect: 'auto', backgroundColor: 'transparent !important' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography sx={{ fontSize: '1.125rem', color: 'text.secondary', fontWeight: 600 }}>Shortcuts</Typography>
            {shortcuts.length < 6 && (
              <Tooltip title='Add Shortcut' placement='top'>
                <IconButton disableRipple onClick={() => setAddingShortcut(true)}>
                  <Icon icon='mdi:plus-circle-outline' />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </MenuItem>
        <Divider sx={{ my: '0 !important' }} />
        <ScrollWrapper hidden={hidden}>
          <Grid container spacing={0}>
            {addingShortcut &&
              navigation().map(navItem => {
                if (navItem.path && !shortcuts.find(s => s.title === navItem.title)) {
                  return (
                    <Grid
                      item
                      xs={6}
                      key={navItem.title}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                      onClick={() => {
                        handleAddShortcut(navItem)
                        setAddingShortcut(false)
                      }}
                    >
                      <Box
                        href={navItem.path}
                        sx={{
                          p: 6,
                          display: 'flex',
                          textAlign: 'center',
                          alignItems: 'center',
                          textDecoration: 'none',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon icon={navItem.icon} sx={{ mb: 2 }} />
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          {navItem.title}
                        </Typography>
                      </Box>
                    </Grid>
                  )
                }
                return null
              })}

            {shortcuts.map(shortcut => (
              <Grid
                item
                xs={6}
                key={shortcut.title}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <Box
                  component={Link}
                  href={shortcut.path}
                  sx={{
                    p: 6,
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    textDecoration: 'none',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon={shortcut.icon} sx={{ mb: 2 }} />
                  <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                    {shortcut.title}
                  </Typography>
                </Box>
                <IconButton onClick={() => handleRemoveShortcut(shortcut)}>
                  <Icon icon='mdi:close' />
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </ScrollWrapper>
      </Menu>
    </Fragment>
  )
}

export default ShortcutsDropdown
