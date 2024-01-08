// ** React Imports
import { useEffect, useState } from 'react'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { supabaseOrg } from 'src/configs/supabase'
// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import {
  sendMsg,
  fetchUserProfile,
  fetchChatsContacts,
  removeSelectedChat,
  updateSelectedChat
} from 'src/store/apps/chat'
import { fetchUserChats, selectChat } from 'src/store/apps/chat'

import withReducer from 'src/@core/HOC/withReducer'
import chat from 'src/store/apps/chat'
import network from 'src/store/network'
// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'

// ** Utils Imports
import { getInitials } from 'src/@core/utils/get-initials'
import { formatDateToMonthShort } from 'src/@core/utils/format'
// import { fetchUserChats } from './supabaseActions'

// ** Chat App Components Imports
import SidebarLeft from 'src/views/apps/chat/SidebarLeft'
import ChatContent from 'src/views/apps/chat/ChatContent'

const AppChat = () => {
  // ** States
  const [userStatus, setUserStatus] = useState('online')
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [userProfileLeftOpen, setUserProfileLeftOpen] = useState(false)
  const [userProfileRightOpen, setUserProfileRightOpen] = useState(false)
  const [active, setActive] = useState(null)

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const store = useSelector(state => state.chat)

  // ** Vars
  const { skin } = settings
  const smAbove = useMediaQuery(theme.breakpoints.up('sm'))
  const sidebarWidth = smAbove ? 370 : 300
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))

  const router = useRouter()
  const { mapChatID } = router.query

  const statusObj = {
    busy: 'error',
    away: 'warning',
    online: 'success',
    offline: 'secondary'
  }

  // const { organisation } = useOrgAuth()
  const organisation = useSelector(state => state.organisation.organisation)
  const contacts = useSelector(state => state.network.contacts.network)

  useEffect(() => {
    dispatch(fetchUserChats(organisation.id))
  }, [dispatch, organisation])

  useEffect(() => {
    if (store.chats && mapChatID) {
      const chatToSelect = store?.chats?.find(chat => chat.id === mapChatID)
      if (chatToSelect) {
        dispatch(selectChat(chatToSelect))
        setActive({ id: chatToSelect.id, type: 'chat' })
      }
    }
  }, [dispatch, mapChatID, store.chats])

  // Inside the AppChat component
  useEffect(() => {
    if (store) {
      // Set up a listener for new chat messages
      const chatMessageListener = supabaseOrg
        .channel('any')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chatMessages' }, async payload => {
          // Check if the new message is for the current user
          if (payload.new.organisation_id === organisation.id) {
            // Refetch the user chats when a new message is received
            dispatch(fetchUserChats(organisation.id))

            // If the new message is for the selected chat, update the selectedChat in the store
            if (store.selectedChat && payload.new.chat_id === store.selectedChat.id) {
              const updatedChat = {
                ...store.selectedChat,
                chatMessages: [...store.selectedChat.chatMessages, payload.new]
              }
              // Dispatch the action to update the selectedChat
              console.log({ updatedChat })
              dispatch(updateSelectedChat(updatedChat))
            }
          }
        })

      const subscription = chatMessageListener.subscribe()

      // Clean up the listener when the component unmounts
      return () => {
        supabaseOrg.removeChannel(subscription)
      }
    }
  }, [store, dispatch])

  // chat/actions/index.js

  // useEffect(() => {
  //   dispatch(fetchUserProfile())
  //   dispatch(fetchChatsContacts())
  // }, [dispatch])
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleUserProfileLeftSidebarToggle = () => setUserProfileLeftOpen(!userProfileLeftOpen)
  const handleUserProfileRightSidebarToggle = () => setUserProfileRightOpen(!userProfileRightOpen)

  if (!store) return <p>Loading...</p>
  return (
    <Box
      className='app-chat'
      sx={{
        width: '100%',
        display: 'flex',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'background.paper',
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
      }}
    >
      <SidebarLeft
        store={store}
        hidden={hidden}
        mdAbove={mdAbove}
        dispatch={dispatch}
        statusObj={statusObj}
        userStatus={userStatus}
        selectChat={selectChat}
        getInitials={getInitials}
        sidebarWidth={sidebarWidth}
        setUserStatus={setUserStatus}
        leftSidebarOpen={leftSidebarOpen}
        removeSelectedChat={removeSelectedChat}
        userProfileLeftOpen={userProfileLeftOpen}
        formatDateToMonthShort={formatDateToMonthShort}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleUserProfileLeftSidebarToggle={handleUserProfileLeftSidebarToggle}
        active={active}
        setActive={setActive}
        organisation={organisation}
        contacts={contacts}
      />
      <ChatContent
        store={store}
        hidden={hidden}
        sendMsg={sendMsg}
        mdAbove={mdAbove}
        dispatch={dispatch}
        statusObj={statusObj}
        getInitials={getInitials}
        sidebarWidth={sidebarWidth}
        organisation={organisation}
        userProfileRightOpen={userProfileRightOpen}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleUserProfileRightSidebarToggle={handleUserProfileRightSidebarToggle}
      />
    </Box>
  )
}
AppChat.contentHeightFixed = true

export default withReducer({
  chat: chat,
  network: network
})(AppChat)
