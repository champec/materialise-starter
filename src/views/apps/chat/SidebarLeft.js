// ** React Imports
import { useState, useEffect } from 'react'
import { useOrgAuth } from 'src/hooks/useOrgAuth'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Chip from '@mui/material/Chip'
import Badge from '@mui/material/Badge'
import Drawer from '@mui/material/Drawer'
import MuiAvatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import InputAdornment from '@mui/material/InputAdornment'

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Import
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Chat App Components Imports
import UserProfileLeft from 'src/views/apps/chat/UserProfileLeft'

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <Box sx={{ height: '100%', overflow: 'auto' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const SidebarLeft = props => {
  // ** Props
  const {
    store,
    hidden,
    mdAbove,
    dispatch,
    statusObj,
    userStatus,
    selectChat,
    getInitials,
    sidebarWidth,
    setUserStatus,
    leftSidebarOpen,
    removeSelectedChat,
    userProfileLeftOpen,
    formatDateToMonthShort,
    handleLeftSidebarToggle,
    handleUserProfileLeftSidebarToggle,
    active,
    setActive,
    organisation,
    contacts
  } = props

  console.log(store)

  const userId = organisation.id

  // ** States
  const [query, setQuery] = useState('')
  const [filteredChat, setFilteredChat] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])

  // ** Hooks
  const router = useRouter()

  const handleChatClick = (type, chat) => {
    dispatch(selectChat(chat.id))
    setActive({ type, id: chat.id })
    if (!mdAbove) {
      handleLeftSidebarToggle()
    }
  }

  useEffect(() => {
    if (store && store.chats) {
      if (active !== null) {
        if (active.type === 'contact' && active.chat.id === store.chats[0].id) {
          setActive({ type: 'chat', chat: active.chat })
        }
      }
    }
  }, [store.chats, active])

  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      setActive(null)
      dispatch(removeSelectedChat())
    })

    return () => {
      setActive(null)
      dispatch(removeSelectedChat())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasActiveId = id => {
    if (store.chats !== null) {
      const arr = store.chats.filter(i => i.id === id)

      return !!arr.length
    }
  }

  const renderChats = () => {
    if (store && store.chats && store.chats.length) {
      if (query.length && !filteredChat.length) {
        return (
          <ListItem>
            <Typography sx={{ color: 'text.secondary' }}>No Chats Found</Typography>
          </ListItem>
        )
      } else {
        const arrToMap = query.length && filteredChat.length ? filteredChat : store.chats

        return arrToMap.map((chat, index) => {
          // const lastMessage = chat.chatMessages.slice(-1)[0]
          const lastMessage = chat.chatMessages[0]
          const activeCondition = active !== null && active.id === chat.id && active.type === 'chat'
          const chatParticipant = chat.chatParticipants[0]

          return (
            <ListItem key={index} disablePadding sx={{ '&:not(:last-child)': { mb: 1.5 } }}>
              <ListItemButton
                disableRipple
                onClick={() => handleChatClick('chat', chat)}
                sx={{
                  px: 2.5,
                  py: 2.5,
                  width: '100%',
                  borderRadius: 1,
                  alignItems: 'flex-start',
                  ...(activeCondition && { backgroundColor: theme => `${theme.palette.primary.main} !important` })
                }}
              >
                <ListItemAvatar sx={{ m: 0 }}>
                  <Badge
                    overlap='circular'
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    badgeContent={
                      <Box
                        component='span'
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          color: 'success.main', // You can change this to the desired status color
                          backgroundColor: 'success.main', // You can change this to the desired status color
                          boxShadow: theme =>
                            `0 0 0 2px ${
                              !activeCondition ? theme.palette.background.paper : theme.palette.common.white
                            }`
                        }}
                      />
                    }
                  >
                    {chatParticipant?.profile.avatar_url ? (
                      <MuiAvatar
                        src={chatParticipant?.profile.avatar_url}
                        alt={chatParticipant?.profile.username}
                        sx={{
                          width: 40,
                          height: 40,
                          outline: theme => `2px solid ${activeCondition ? theme.palette.common.white : 'transparent'}`
                        }}
                      />
                    ) : (
                      <CustomAvatar
                        color={null} // You can set a specific color if needed
                        skin={activeCondition ? 'light-static' : 'light'}
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: '1rem',
                          outline: theme => `2px solid ${activeCondition ? theme.palette.common.white : 'transparent'}`
                        }}
                      >
                        {chatParticipant?.profile?.username && getInitials(chatParticipant?.profile?.username)} //Change
                        this to get the desired initials
                      </CustomAvatar>
                    )}
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    my: 0,
                    ml: 4,
                    mr: 1.5,
                    '& .MuiTypography-root': { ...(activeCondition && { color: 'common.white' }) }
                  }}
                  primary={
                    <Typography noWrap sx={{ ...(!activeCondition ? { color: 'text.secondary' } : {}) }}>
                      {chatParticipant?.profile.organisation_name}
                    </Typography>
                  }
                  secondary={
                    <Typography noWrap variant='body2' sx={{ ...(!activeCondition && { color: 'text.disabled' }) }}>
                      {lastMessage ? lastMessage.message : null}
                    </Typography>
                  }
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                  }}
                >
                  <Typography sx={{ whiteSpace: 'nowrap', color: activeCondition ? 'common.white' : 'text.disabled' }}>
                    <>
                      {lastMessage
                        ? formatDateToMonthShort(new Date(lastMessage.created_at), true)
                        : new Date().toDateString()}
                    </>
                  </Typography>
                  {/* You can implement an "unseenMsgs" counter and use it here, similar to the original code */}
                  {chat.unseenMsgs && chat.unseenMsgs > 0 ? (
                    <Chip
                      color='error'
                      label={chat.unseenMsgs}
                      sx={{
                        mt: 0.5,
                        height: 18,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        '& .MuiChip-label': { pt: 0.25, px: 1.655 }
                      }}
                    />
                  ) : null}
                </Box>
              </ListItemButton>
            </ListItem>
          )
        })
      }
    }
  }

  const renderContacts = () => {
    if (store && store.chats && store.chats.length) {
      if (query.length && !filteredContacts.length) {
        return (
          <ListItem>
            <Typography sx={{ color: 'text.secondary' }}>No Contacts Found</Typography>
          </ListItem>
        )
      } else {
        const arrToMap = query.length && filteredContacts.length ? filteredContacts : contacts

        return arrToMap !== null
          ? arrToMap.map((contact, index) => {
              const activeCondition =
                active !== null && active.id === contact.id && active.type === 'contact' && !hasActiveId(contact.id)

              return (
                <ListItem key={index} disablePadding sx={{ '&:not(:last-child)': { mb: 1.5 } }}>
                  <ListItemButton
                    disableRipple
                    onClick={() => handleChatClick(hasActiveId(contact.id) ? 'chat' : 'contact', contact.id)}
                    sx={{
                      px: 2.5,
                      py: 2.5,
                      width: '100%',
                      borderRadius: 1,
                      ...(activeCondition && { backgroundColor: theme => `${theme.palette.primary.main} !important` })
                    }}
                  >
                    <ListItemAvatar sx={{ m: 0 }}>
                      {contact.avatar ? (
                        <MuiAvatar
                          alt={contact.fullName}
                          src={contact.avatar}
                          sx={{
                            width: 40,
                            height: 40,
                            outline: theme =>
                              `2px solid ${activeCondition ? theme.palette.common.white : 'transparent'}`
                          }}
                        />
                      ) : (
                        <CustomAvatar
                          color={contact.avatarColor}
                          skin={activeCondition ? 'light-static' : 'light'}
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: '1rem',
                            outline: theme =>
                              `2px solid ${activeCondition ? theme.palette.common.white : 'transparent'}`
                          }}
                        >
                          {getInitials(contact.fullName)}
                        </CustomAvatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        my: 0,
                        ml: 4,
                        ...(activeCondition && { '& .MuiTypography-root': { color: 'common.white' } })
                      }}
                      primary={
                        <Typography sx={{ ...(!activeCondition ? { color: 'text.secondary' } : {}) }}>
                          {contact.fullName}
                        </Typography>
                      }
                      secondary={
                        <Typography noWrap variant='body2' sx={{ ...(!activeCondition && { color: 'text.disabled' }) }}>
                          {contact.about}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              )
            })
          : null
      }
    }
  }

  const handleFilter = e => {
    setQuery(e.target.value)
    if (store.chats !== null && contacts !== null) {
      const searchFilterFunction = contact =>
        contact?.profile?.organisation_name.toLowerCase().includes(e.target.value.toLowerCase())
      const filteredChatsArr = store.chats.filter(searchFilterFunction)
      const filteredContactsArr = contacts.filter(searchFilterFunction)
      setFilteredChat(filteredChatsArr)
      setFilteredContacts(filteredContactsArr)
    }
  }

  return (
    <div>
      <Drawer
        open={leftSidebarOpen}
        onClose={handleLeftSidebarToggle}
        variant={mdAbove ? 'permanent' : 'temporary'}
        ModalProps={{
          disablePortal: true,
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: 7,
          height: '100%',
          display: 'block',
          position: mdAbove ? 'static' : 'absolute',
          '& .MuiDrawer-paper': {
            boxShadow: 'none',
            overflow: 'hidden',
            width: sidebarWidth,
            position: mdAbove ? 'static' : 'absolute',
            borderTopLeftRadius: theme => theme.shape.borderRadius,
            borderBottomLeftRadius: theme => theme.shape.borderRadius
          },
          '& > .MuiBackdrop-root': {
            borderRadius: 1,
            position: 'absolute',
            zIndex: theme => theme.zIndex.drawer - 1
          }
        }}
      >
        <Box
          sx={{
            px: 5.5,
            py: 3.5,
            display: 'flex',
            alignItems: 'center',
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          {store && store.userProfile ? (
            <Badge
              overlap='circular'
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              sx={{ mr: 4.5 }}
              onClick={handleUserProfileLeftSidebarToggle}
              badgeContent={
                <Box
                  component='span'
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    color: `${statusObj[userStatus]}.main`,
                    backgroundColor: `${statusObj[userStatus]}.main`,
                    boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`
                  }}
                />
              }
            >
              <MuiAvatar
                src={store.userProfile.avatar}
                alt={store.userProfile.fullName}
                sx={{ width: 40, height: 40, cursor: 'pointer' }}
              />
            </Badge>
          ) : null}
          <TextField
            fullWidth
            size='small'
            value={query}
            type='search'
            onChange={handleFilter}
            placeholder='Search for contact...'
            sx={{ '& .MuiInputBase-root': { borderRadius: 5 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='mdi:magnify' fontSize='1.25rem' />
                </InputAdornment>
              )
            }}
          />
          {!mdAbove ? (
            <IconButton sx={{ p: 1, ml: 1 }} onClick={handleLeftSidebarToggle}>
              <Icon icon='mdi:close' fontSize='1.375rem' />
            </IconButton>
          ) : null}
        </Box>

        <Box sx={{ height: `calc(100% - 4.125rem)` }}>
          <ScrollWrapper hidden={hidden}>
            <Box sx={{ p: theme => theme.spacing(5, 3, 3) }}>
              <Typography variant='h6' sx={{ ml: 2, mb: 4, color: 'primary.main' }}>
                Chats
              </Typography>
              <List sx={{ mb: 7.5, p: 0 }}>{renderChats()}</List>
              <Typography variant='h6' sx={{ ml: 2, mb: 4, color: 'primary.main' }}>
                Contacts
              </Typography>
              <List sx={{ p: 0 }}>{renderContacts()}</List>
            </Box>
          </ScrollWrapper>
        </Box>
      </Drawer>

      <UserProfileLeft
        store={store}
        hidden={hidden}
        statusObj={statusObj}
        userStatus={userStatus}
        sidebarWidth={sidebarWidth}
        setUserStatus={setUserStatus}
        userProfileLeftOpen={userProfileLeftOpen}
        handleUserProfileLeftSidebarToggle={handleUserProfileLeftSidebarToggle}
      />
    </div>
  )
}

export default SidebarLeft
