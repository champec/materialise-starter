import React, { useEffect, useState } from 'react'
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
import { supabaseUser } from 'src/configs/supabase'
import UserLoginForm from 'src/views/pages/auth/pharmexsigninwizard/UserLogin'
import { setUser } from 'src/store/auth/user'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'

// Dummy data
const currentOrganization = {
  name: 'Acme Corp',
  avatar: '/path-to-org-avatar.jpg' // Replace with actual avatar path
}

function SwitchScreen() {
  const org = useSelector(state => state.organisation.organisation)
  const currentUser = useSelector(state => state.user.user)
  const router = useRouter()
  const dispatch = useDispatch()
  const [localUsers, setLocalUsers] = useState([])
  const [newSignup, setNewSignup] = useState()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('success')

  const showMessage = (message, severity) => {
    setMessage(message)
    setSeverity(severity)
    setOpen(true)
  }

  useEffect(() => {
    const storageUsers = JSON.parse(localStorage.getItem('pharmexusers')) || []
    const currentEmail = currentUser?.email

    // Filter out the current user based on email
    const filteredUsers = storageUsers.filter(user => user?.email !== currentEmail)

    setLocalUsers(filteredUsers)

    console.log(filteredUsers)
  }, [currentUser]) // Add currentUser to dependency array

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

  const toggleSignInForm = () => {
    setNewSignup(!newSignup)
  }

  const handleNext = async data => {
    console.log(data)
    setNewSignup(false)
  }

  const handleRemoveUser = clickedUser => {
    const newUsers = localUsers.filter(user => user.email !== clickedUser?.email)
    localStorage.setItem('pharmexusers', JSON.stringify(newUsers))
    console.log('NEW USERS AFTER LOG OUT', newUsers)
    setLocalUsers(newUsers)
  }

  const signInWithToken = async (accessToken, refreshToken) => {
    const { data, error } = await supabaseUser.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
    if (error) {
      console.log('switch session error', error)
      showMessage(error.message, 'error')
      return
    }

    const { data: authUser, error: userError } = await supabaseUser
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      console.log('user data fetch RTK', { userError })
      showMessage(userError.message, 'error')
      return
    }
    const access_token = data.session.access_token
    const refresh_token = data.session.refresh_token

    const enrichedUser = {
      ...authUser,
      access_token,
      refresh_token
    }

    console.log('switch session refreshed ', data)
    console.log('switch session refreshed ', enrichedUser)
    dispatch(setUser(enrichedUser))
    // update the user in the local storage with just the new tokens
    const storageusers = JSON.parse(localStorage.getItem('pharmexusers'))
    const newUsers = storageusers.map(user => {
      if (user.email === currentUser.email) {
        return {
          ...user,
          accessToken: access_token,
          refreshToken: refresh_token
        }
      }
      return user
    })
    localStorage.setItem('pharmexusers', JSON.stringify(newUsers))
    return data
  }

  return (
    <Box display='flex' justifyContent='center' alignItems='center' height='100vh' padding={3}>
      <Card sx={{ width: '100%', maxWidth: 600, height: '90vh' }}>
        <CardContent>
          <Box display={'flex'} marginBottom={4} textAlign='center' justifyContent={'space-between'}>
            <Button variant='contained' onClick={handleBack}>
              Go Back
            </Button>
            <Button variant='contained' onClick={toggleSignInForm}>
              {newSignup ? 'Switch Form' : 'New Login'}
            </Button>
          </Box>
          {newSignup ? (
            <UserLoginForm handleNext={handleNext} />
          ) : (
            <>
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
                          <Typography variant='body2'>
                            Last signed in: {dayjs(new Date()).format('MMM D, YYYY , HH:mm')}
                          </Typography>
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

              {Array.isArray(localUsers) &&
                localUsers?.map((user, index) => (
                  <Card
                    key={index}
                    sx={{
                      marginBottom: 2,
                      '&:hover': { boxShadow: 6 },
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <CardActionArea
                      sx={{ flexGrow: 1 }}
                      onClick={() => signInWithToken(user.accessToken, user.refreshToken)}
                    >
                      <CardContent>
                        <Box display='flex' alignItems='center'>
                          <Avatar src={user.avatar} />
                          <Box marginLeft={2}>
                            <Typography variant='body1'>{user.name}</Typography>
                            <Typography variant='body2'>
                              Last signed in: {dayjs(user.lastSignIn).format('MMM D, YYYY: HH:mm')}
                            </Typography>
                            <Typography variant='body2'>{user.email}</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <IconButton
                      onClick={() => handleRemoveUser(user)}
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
            </>
          )}
        </CardContent>
      </Card>
      <CustomSnackbar
        open={open}
        setOpen={setOpen}
        message={message}
        severity={severity}
        horizontal='center'
        vertical='top'
      />
    </Box>
  )
}

SwitchScreen.getLayout = page => <BlankLayout>{page}</BlankLayout>
SwitchScreen.authGuard = false

export default SwitchScreen
