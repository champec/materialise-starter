// ** React Imports
import { useState, useEffect } from 'react'
import Inbox from 'src/pages/broadcast/inbox'
import Sent from 'src/pages/broadcast/sent'
import Draft from 'src/pages/broadcast/draft'
import BroadCastComposer from '../broadcast/BroadCastComposer'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { dummyData, getBroadcasts } from './BroadcastAPI'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Email App Component Imports
import MailLog from 'src/views/apps/email/MailLog'
import SidebarLeft from 'src/views/apps/email/SidebarLeft'
import ComposePopup from 'src/views/apps/email/ComposePopup'

// ** Actions
import {
  fetchMails,
  updateMail,
  paginateMail,
  getCurrentMail,
  updateMailLabel,
  handleSelectMail,
  handleSelectAllMail
} from 'src/store/apps/email'

// ** Variables
const labelColors = {
  private: 'error',
  personal: 'success',
  company: 'primary',
  important: 'warning'
}

const EmailAppLayout = ({ folder, label }) => {
  // ** States
  const [query, setQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [mailDetailsOpen, setMailDetailsOpen] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('inbox')
  const [unreadInbox, setUnreadInbox] = useState(0)
  const [store, setStore] = useState(dummyData)
  useEffect(() => {
    getBroadcasts()
      .then(data => {
        if (data) {
          console.log(data)
          setStore(prevStore => ({
            ...prevStore,
            mails: data
          }))
        }
      })
      .catch(error => {
        console.error('Error fetching broadcasts', error)
      })
  }, [])

  useEffect(() => {
    let inbox = 0
    // let sent = 0;
    // similar for each category

    store.mails.forEach(mail => {
      if (mail.folder === 'inbox' && !mail.isRead) inbox++
      // if (mail.folder === 'sent' && mail.unread) sent++;
      // similar for each category
    })
    console.log(inbox)
    setUnreadInbox(inbox)
    // setUnreadSent(sent);
    // similar for each category
  }, [store.mails])

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const lgAbove = useMediaQuery(theme.breakpoints.up('lg'))
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))
  const smAbove = useMediaQuery(theme.breakpoints.up('sm'))
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  // const store = useSelector(state => state.email)
  console.log(dummyData)

  // ** Vars
  const leftSidebarWidth = 260
  const { skin, direction } = settings
  const composePopupWidth = mdAbove ? 754 : smAbove ? 520 : '100%'

  const routeParams = {
    label: label || '',
    folder: folder || 'inbox'
  }
  useEffect(() => {
    // @ts-ignore
    dispatch(fetchMails({ q: query || '', folder: routeParams.folder, label: routeParams.label }))
  }, [dispatch, query, routeParams.folder, routeParams.label])
  const toggleComposeOpen = () => setComposeOpen(!composeOpen)
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const viewProps = {
    query,
    store,
    hidden,
    lgAbove,
    dispatch,
    setQuery,
    direction,
    updateMail,
    routeParams,
    labelColors,
    paginateMail,
    getCurrentMail,
    updateMailLabel,
    mailDetailsOpen,
    handleSelectMail,
    setMailDetailsOpen,
    handleSelectAllMail,
    handleLeftSidebarToggle
  }

  const selectView = view => {
    const filteredMails = store.mails.filter(mail => mail.folder === view)
    console.log({ filteredMails })
    switch (view) {
      case 'inbox':
        return <Inbox mails={filteredMails} {...viewProps} />
      case 'sent':
        return <Sent mails={filteredMails} {...viewProps} />
      case 'draft':
        return <Draft mails={filteredMails} {...viewProps} />
      case 'openBroadcast':
        return <BroadCastComposer {...viewProps} />
      default:
        return <Inbox mails={filteredMails} {...viewProps} />
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
      }}
    >
      <SidebarLeft
        unreadInbox={unreadInbox}
        store={store}
        hidden={hidden}
        lgAbove={lgAbove}
        dispatch={dispatch}
        mailDetailsOpen={mailDetailsOpen}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        toggleComposeOpen={toggleComposeOpen}
        setMailDetailsOpen={setMailDetailsOpen}
        handleSelectAllMail={handleSelectAllMail}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        setView={setCurrentView}
        currentView={currentView}
      />
      {selectView(currentView)}

      <ComposePopup
        mdAbove={mdAbove}
        composeOpen={composeOpen}
        composePopupWidth={composePopupWidth}
        toggleComposeOpen={toggleComposeOpen}
      />
    </Box>
  )
}

export default EmailAppLayout
