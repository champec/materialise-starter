// ** React Imports
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import {
  sendMsg,
  selectChat,
  fetchUserProfile,
  fetchChatsContacts,
  removeSelectedChat,
  currentProfile,
  fetchChatsChats
} from 'src/store/apps/chat'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Utils Imports
import { getInitials } from 'src/@core/utils/get-initials'
import { formatDateToMonthShort } from 'src/@core/utils/format'

// ** Chat App Components Imports
import SidebarLeft from 'src/views/apps/chat/SidebarLeft'
import ChatContent from 'src/views/apps/chat/ChatContent'
import { useUserAuth } from 'src/hooks/useAuth'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { supabaseOrg } from 'src/configs/supabase'

const AppChat = () => {
  // ** States
  const [userStatus, setUserStatus] = useState('online')
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [userProfileLeftOpen, setUserProfileLeftOpen] = useState(false)
  const [userProfileRightOpen, setUserProfileRightOpen] = useState(false)
  const [userChatIDs, setUserChatIDs] = useState()
  const [newMessage, setNewMessages] = useState()
  const [triggerRender, setTriggerRender] = useState(false)

  //** useEffects to fetch realtime data
  useEffect(() => {
    const channel = supabaseOrg
      .channel('*')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chatMessages' }, payload => {
        const newMessage = payload.new
        setNewMessages(newMessage)
      })
      .subscribe()

    return () => {
      supabaseOrg.removeChannel(channel)
    }
  }, [])

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const store = useSelector(state => state.chat)
  const { user } = useUserAuth()
  const { organisation } = useOrgAuth()
  const router = useRouter()
  const { ODS, mapChatID } = router?.query

  //profile

  const profileUser = {
    id: user.id,
    orgID: organisation.id,
    orgName: organisation.organisation_name,
    avatar: '/images/avatars/1.png',
    UserName: user.username,
    role: user.role,
    about:
      'Dessert chocolate cake lemon drops jujubes. Biscuit cupcake ice cream bear claw brownie brownie marshmallow.',
    status: 'online',
    settings: {
      isTwoStepAuthVerificationEnabled: true,
      isNotificationsOn: false
    }
  }

  // ** Vars
  const { skin } = settings
  const smAbove = useMediaQuery(theme.breakpoints.up('sm'))
  const sidebarWidth = smAbove ? 370 : 300
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))

  const statusObj = {
    // will go and be replaced
    busy: 'error',
    away: 'warning',
    online: 'success',
    offline: 'secondary'
  }

  // ** initial chat data
  useEffect(() => {
    dispatch(currentProfile(profileUser))
    // dispatch(fetchChatsContacts(organisation && organisation.Network))
    dispatch(fetchChatsChats(organisation.id))
  }, [dispatch])

  //** handle side bar toggles
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleUserProfileLeftSidebarToggle = () => setUserProfileLeftOpen(!userProfileLeftOpen)
  const handleUserProfileRightSidebarToggle = () => setUserProfileRightOpen(!userProfileRightOpen)

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
        newMessage={newMessage}
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
        mapChatID={mapChatID}
        setTriggerRender={setTriggerRender}
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
        userProfileRightOpen={userProfileRightOpen}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleUserProfileRightSidebarToggle={handleUserProfileRightSidebarToggle}
      />
    </Box>
  )
}
AppChat.contentHeightFixed = true

export default AppChat
