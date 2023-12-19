import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  CardActionArea,
  Divider,
  CardHeader,
  CardActions,
  IconButton
} from '@mui/material'
import dayjs from 'dayjs'
import { useSelector, useDispatch } from 'react-redux'
import organisation from 'src/store/auth/organisation'
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { logout } from 'src/store/auth/user'
import { logout as logoutOrg } from 'src/store/auth/organisation'

// Dummy data
const currentOrganization = {
  name: 'Acme Corp',
  avatar: '/path-to-org-avatar.jpg' // Replace with actual avatar path
}

const users = [
  {
    name: 'John Doe',
    avatar: '/path-to-user-avatar.jpg', // Replace with actual avatar path
    lastSignIn: '2023-04-15',
    email: 'john@example.com'
  }
  // ... more users
]

function SwitchScreen() {
  const org = useSelector(state => state.organisation.organisation)
  const currentUser = useSelector(state => state.user.user)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleBack = () => {
    router.back()
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleLogoutOrg = () => {
    dispatch(logoutOrg())
  }

  console.log(currentUser)

  return (
    <Box display='flex' justifyContent='center' alignItems='center' height='100vh' padding={3}>
      <Card sx={{ width: '100%', maxWidth: 600, height: '90vh' }}>
        <CardContent>
          <Box display={'flex'} marginBottom={4} textAlign='center' justifyContent={'start'} alignItems={'start'}>
            <Button variant='contained' onClick={handleBack}>
              Go Back
            </Button>
          </Box>

          <Card sx={{ marginBottom: 6 }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Avatar src={org.avatar_url} />
                <Typography variant='h6' marginLeft={2}>
                  {org.organisation_name}
                </Typography>
                <Typography
                  variant='body2'
                  marginLeft={2}
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    lineHeight: 2,
                    '&:hover': {
                      color: 'primary.main',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={handleLogoutOrg}
                >
                  logout
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Box style={{ marginBottom: 8 }}>
            <Divider />
          </Box>
          {currentUser ? (
            <Card
              sx={{
                marginBottom: 2,
                '&:hover': { boxShadow: 6 },
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <CardActionArea sx={{ flexGrow: 1 }}>
                <CardContent>
                  <Box display='flex' alignItems='center'>
                    <Avatar src={currentUser.avatar_url} />
                    <Box marginLeft={2}>
                      <Typography variant='body1'>{currentUser.username}</Typography>
                      <Typography variant='body2'>Last signed in: {dayjs(new Date()).format('MMM D, YYYY')}</Typography>
                      <Typography variant='body2'>{currentUser.email}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
              <IconButton aria-label='logout' onClick={handleLogout}>
                <Icon icon={'ic:round-logout'} />
              </IconButton>
            </Card>
          ) : (
            <Card sx={{ marginBottom: 2, '&:hover': { boxShadow: 6 } }}>
              <CardHeader title='No user logged in' />
            </Card>
          )}

          <Box style={{ marginBottom: 8 }}>
            <Divider />
          </Box>

          {users.map((user, index) => (
            <Card
              key={index}
              sx={{ marginBottom: 2, '&:hover': { boxShadow: 6 }, display: 'flex', justifyContent: 'space-between' }}
            >
              <CardActionArea sx={{ flexGrow: 1 }}>
                <CardContent>
                  <Box display='flex' alignItems='center'>
                    <Avatar src={user.avatar} />
                    <Box marginLeft={2}>
                      <Typography variant='body1'>{user.name}</Typography>
                      <Typography variant='body2'>
                        Last signed in: {dayjs(user.lastSignIn).format('MMM D, YYYY')}
                      </Typography>
                      <Typography variant='body2'>{user.email}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
              <IconButton
                onClick={handleLogout}
                aria-label='logout'
                // sx={{
                //   '&:hover': {
                //     backgroundColor: 'rgba(0, 0, 0, 0.04)' // Adjust hover color as needed
                //   }
                // }}
              >
                <Icon icon={'ic:round-logout'} />
              </IconButton>
            </Card>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}

SwitchScreen.getLayout = page => <BlankLayout>{page}</BlankLayout>
SwitchScreen.authGuard = false

export default SwitchScreen
