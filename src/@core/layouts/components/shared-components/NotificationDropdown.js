// ** React Imports
import { useState, Fragment } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Util Import
import { getInitials } from 'src/@core/utils/get-initials'
import { useSelector } from 'react-redux'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { supabase } from 'src/configs/supabase'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'
import { useRouter } from 'next/router'

// Extend Day.js with the plugin
dayjs.extend(relativeTime)

// ** Styled Menu component
const Menu = styled(MuiMenu)(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 380,
    overflow: 'hidden',
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0
  }
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}))

// ** Styled PerfectScrollbar component
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: 344
})

// ** Styled Avatar component
const Avatar = styled(CustomAvatar)({
  width: 38,
  height: 38,
  fontSize: '1.125rem'
})

// ** Styled component for the title in MenuItems
const MenuItemTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  flex: '1 1 100%',
  overflow: 'hidden',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75)
}))

// ** Styled component for the subtitle in MenuItems
const MenuItemSubtitle = styled(Typography)({
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <Box sx={{ maxHeight: 349, overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
  }
}

const NotificationDropdown = props => {
  // ** Props
  const { settings } = props

  const notifications = useSelector(state =>
    state.notifications.notifications.filter(notification => notification.read === false)
  )
  const orgId = useSelector(state => state.organisation.organisation?.id)
  const userId = useSelector(state => state.user.user?.id)
  const router = useRouter()

  // ** States
  const [anchorEl, setAnchorEl] = useState(null)
  const [loading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // ** Hook
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const showMessage = (severity, message) => {
    setSnackbarSeverity(severity)
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  const handleNotificationClick = async notification => {
    // mark the notificaiton as read and if there is a link redirect to it
    console.log('NOTIFICATION CLICKED', notification)
    setIsLoading(true)
    const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', notification.id)

    if (error) {
      showMessage('error', error.message)
      setIsLoading(false)
      return
    }

    if (notification.link) {
      router.push(notification.link)
    }
  }

  const handleReadAllNotifications = async () => {
    //playNotificationSound()
    console.log('READ ALL NOTIFICATIONS')
    setIsLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
      .eq('organisation_id', orgId)
      .or(`user_id.eq.${userId},user_id.is.null`)

    showMessage('success', 'All notifications have been read')
    setAnchorEl(null)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const RenderAvatar = ({ notification }) => {
    const { avatarAlt, avatarImg, avatarIcon, avatarText, avatarColor } = notification
    if (avatarImg) {
      return <Avatar alt={avatarAlt} src={avatarImg} />
    } else if (avatarIcon) {
      return (
        <Avatar skin='light' color={avatarColor}>
          {avatarIcon}
        </Avatar>
      )
    } else {
      return (
        <Avatar skin='light' color={avatarColor}>
          {getInitials(avatarText)}
        </Avatar>
      )
    }
  }

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Badge
          color='error'
          variant='dot'
          invisible={!notifications.length}
          sx={{
            '& .MuiBadge-badge': { top: 4, right: 4, boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}` }
          }}
        >
          <Icon icon='mdi:bell-outline' />
        </Badge>
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
            <Typography sx={{ cursor: 'text', fontWeight: 600 }}>Notifications</Typography>
            <CustomChip
              skin='light'
              size='small'
              color='primary'
              label={`${notifications.length} New`}
              sx={{ height: 20, fontSize: '0.75rem', fontWeight: 500, borderRadius: '10px' }}
            />
          </Box>
        </MenuItem>
        <ScrollWrapper hidden={hidden}>
          {notifications.map((notification, index) => {
            const now = dayjs()
            const createdAt = dayjs(notification.created_at)
            let displayTime

            if (now.diff(createdAt, 'day') < 1) {
              displayTime = createdAt.fromNow()
            } else {
              displayTime = createdAt.format('D MMM')
            }

            return (
              <MenuItem key={index} onClick={() => handleNotificationClick(notification)}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                  {/* <RenderAvatar notification={notification} /> */}
                  <Box sx={{ mx: 4, flex: '1 1', display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
                    <MenuItemTitle>{notification.title}</MenuItemTitle>
                    <MenuItemSubtitle variant='body2'>{notification.message}</MenuItemSubtitle>
                  </Box>
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    {displayTime}
                  </Typography>
                </Box>
              </MenuItem>
            )
          })}
        </ScrollWrapper>
        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{
            py: 3.5,
            borderBottom: 0,
            cursor: 'default',
            userSelect: 'auto',
            backgroundColor: 'transparent !important',
            borderTop: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <Button fullWidth variant='contained' onClick={handleReadAllNotifications}>
            Read All Notifications
          </Button>
        </MenuItem>
      </Menu>
      <CustomSnackbar
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        severity={snackbarSeverity}
        horizontal='center'
        vertical='top'
        message={snackbarMessage}
      />
    </Fragment>
  )
}

export default NotificationDropdown
