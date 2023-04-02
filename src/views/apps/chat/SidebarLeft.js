// ** React Imports
import { useState, useEffect } from 'react'

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
import { useOrgAuth } from 'src/hooks/useOrgAuth'

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <Box sx={{ height: '100%', overflow: 'auto' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const SidebarLeft = props => {
  // ** Props
  // store contains, contacts and chats, hidden referes to mediaquery of screen size lg, md above is medium, dispatch calls actions, stausObj, selectchats fro redux
  // getinitials, sidebarWidth value, setUserStates online etc, leftsidebar, removeselectedchat upon exit or return, userprofile, datformat, toggle the left bar,
  const {
    store,
    hidden,
    mdAbove,
    dispatch,
    statusObj,
    userStatus,
    selectChat,
    getInitials,
    newMessage,
    sidebarWidth,
    setUserStatus,
    leftSidebarOpen,
    removeSelectedChat,
    userProfileLeftOpen,
    formatDateToMonthShort,
    handleLeftSidebarToggle,
    handleUserProfileLeftSidebarToggle,
    mapChatID,
    setTriggerRender
  } = props

  // ** States
  // the words used in search
  const [query, setQuery] = useState('')
  // the resultant array of contatcs chats
  const [filteredChat, setFilteredChat] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [updateMessage, setUpdateMessage] = useState()
  // making a chat active and writing to message table

  const [active, setActive] = useState(null)

  // ** Hooks
  const router = useRouter()
  const { organisation } = useOrgAuth()

  //when you click on select chat - you receive its type(chat or contact) and fetch the messages based on its ID, selectChat is a async function, also set the current active chat
  //in state - if left side toggle is open then close

  // setActive({ type: 'chat', id: 'bfef0f4d-72a1-401e-ad27-bd1d2647de61' })

  const handleChatClick = (type, id, chat, guest) => {
    const send = [chat, guest, id]
    const state = { type, id }
    setActive(prev => state)
    dispatch(selectChat(send))
    if (!mdAbove) {
      handleLeftSidebarToggle()
    }
  }

  useEffect(() => {
    if (newMessage) {
      setUpdateMessage(newMessage)
    }
  }, [newMessage])

  useEffect(() => {
    if (store && store.chats) {
      if (active !== null) {
        if (active.type === 'contact' && active.id === store.chats[0].id) {
          setActive({ type: 'chat', id: active.id })
        }
      }
    }
  }, [store, active])

  // cleans the active chat and removes selected chats
  // useEffect(() => {
  //   router.events.on('routeChangeComplete', () => {
  //     setActive(null)
  //     dispatch(removeSelectedChat())
  //   })

  //   return () => {
  //     setActive(null)
  //     dispatch(removeSelectedChat())
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const hasActiveId = id => {
    if (store.chats !== null) {
      const arr = store.chats.filter(i => i.id === id)

      return !!arr.length
    }
  }

  useEffect(() => {
    if (mapChatID) {
      const arrayToMap = store.chats.filter(x => x.id == mapChatID)
      const guest = arrayToMap[0]?.chatParticipants[0]
      const type = 'chat'
      const chat = arrayToMap[0]?.chatMessages[0]
      const send = [chat, guest, mapChatID]
      handleChatClick(type, mapChatID, chat, guest)
      setTriggerRender(state => !state)
    }
  }, [])

  const renderChats = () => {
    if (store && store.chats && store.chats.length) {
      // if you search but the search doesnt return any results
      if (query.length && !filteredChat.length) {
        return (
          <ListItem>
            <Typography sx={{ color: 'text.secondary' }}>No Chats Found</Typography>
          </ListItem>
        )
      } else {
        // if there is search and it has results, the bring those chats, otherwise just bring all the chats in the redux store
        const arrToMap = query.length && filteredChat.length ? filteredChat : store.chats

        // array to map over is dynamic basic on if search or not, lastest message is previewed by length -1, active condition if the active state matches current looping chat for css
        return arrToMap.map((chat, index) => {
          const currentUserId = organisation.id
          const guestArray = chat.chatParticipants.filter(user => user.user_id !== currentUserId)
          const guest = guestArray[0]
          const lastMessage = chat.chatMessages[chat.chatMessages.length - 1]
          const activeCondition = active !== null && active.id === chat.id && active.type === 'chat'

          // in return everything is wrapped in a listitem button, show details from chat, creates initials based avatar if non exists
          return (
            <ListItem key={index} disablePadding sx={{ '&:not(:last-child)': { mb: 1.5 } }}>
              <ListItemButton
                disableRipple
                onClick={() => handleChatClick('chat', chat.id, chat, guest)}
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
                          color: `${statusObj[chat.status]}.main`,
                          backgroundColor: `${statusObj[chat.status]}.main`,
                          boxShadow: theme =>
                            `0 0 0 2px ${
                              !activeCondition ? theme.palette.background.paper : theme.palette.common.white
                            }`
                        }}
                      />
                    }
                  >
                    {chat.avatar ? (
                      <MuiAvatar
                        src={chat.avatar}
                        alt={chat.fullName ?? 'sample test'}
                        sx={{
                          width: 40,
                          height: 40,
                          outline: theme => `2px solid ${activeCondition ? theme.palette.common.white : 'transparent'}`
                        }}
                      />
                    ) : (
                      <CustomAvatar
                        color={chat.avatarColor}
                        skin={activeCondition ? 'light-static' : 'light'}
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: '1rem',
                          outline: theme => `2px solid ${activeCondition ? theme.palette.common.white : 'transparent'}`
                        }}
                      >
                        {getInitials(guest?.name ?? 'Van Winkle')}
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
                      {guest?.name ? guest?.name : 'name dosnt exists'}
                    </Typography>
                  }
                  secondary={
                    <Typography noWrap variant='body2' sx={{ ...(!activeCondition && { color: 'text.disabled' }) }}>
                      {lastMessage
                        ? updateMessage && updateMessage.chat_id == chat.id
                          ? updateMessage.message
                          : lastMessage?.message
                        : 'no messages'}
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
                        ? formatDateToMonthShort(lastMessage.created_at, true)
                        : formatDateToMonthShort(new Date(), true)}
                    </>
                  </Typography>
                  {chat?.chat?.unseenMsgs && chat?.chat?.unseenMsgs > 0 ? (
                    <Chip
                      color='error'
                      label={chat.chat.unseenMsgs}
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
        const arrToMap = query.length && filteredContacts.length ? filteredContacts : store.contacts

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
                          alt={contact.username ?? 'sample test'}
                          src={contact.avatar_url ?? 'sample test'}
                          sx={{
                            width: 40,
                            height: 40,
                            outline: theme =>
                              `2px solid ${activeCondition ? theme.palette.common.white : 'transparent'}`
                          }}
                        />
                      ) : (
                        <CustomAvatar
                          color={contact?.avatarColor}
                          skin={activeCondition ? 'light-static' : 'light'}
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: '1rem',
                            outline: theme =>
                              `2px solid ${activeCondition ? theme.palette.common.white : 'transparent'}`
                          }}
                        >
                          {getInitials(contact.fullName ?? 'John Doe')}
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
                          {contact.organisation_name ? 'organisation exists' : 'organisation doesnt exist'}
                        </Typography>
                      }
                      secondary={
                        <Typography noWrap variant='body2' sx={{ ...(!activeCondition && { color: 'text.disabled' }) }}>
                          {contact.about ? 'about exists' : 'about doesnt exists'}
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
    if (store.chats !== null /*&& store.contacts !== null*/) {
      const searchFilterFunction = contact => console.log(contact, store.chats)
      // contact?.chatParticipants[0].name.toLowerCase().includes(e.target.value.toLowerCase())
      const filteredChatsArr = store.chats?.filter(contact =>
        contact?.chatParticipants[0]?.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
      // const filteredContactsArr = store.contacts.filter(searchFilterFunction) when contact are available need to activate
      setFilteredChat(filteredChatsArr)
      // setFilteredContacts(filteredContactsArr)
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
