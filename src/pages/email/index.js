// ** React Imports
import { useState, useEffect } from 'react'

// ** Supabase Client Import
import { supabase } from 'src/configs/supabase'

// ** MUI and Other Component Imports (same as before)
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useSettings } from 'src/@core/hooks/useSettings'
import MailLog from 'src/views/apps/mail/MailLog'
import SidebarLeft from 'src/views/apps/mail/SidebarLeft'
import ComposePopup from 'src/views/apps/mail/ComposePopup'

import withReducer from 'src/@core/HOC/withReducer'
import servicesSlice from 'src/store/apps/services'
import network from 'src/store/network'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'

// ** Actions

import {
  fetchMails,
  updateMail,
  paginateMail,
  getCurrentMail,
  updateMailLabel,
  handleSelectMail,
  handleSelectAllMail
} from 'src/store/apps/mail'

import appMailSlice  from 'src/store/apps/mail'

// ** Email App Layout Component
const EmailAppLayout = () => {
  // ** States
  const [emails, setEmails] = useState([])
  const [query, setQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [mailDetailsOpen, setMailDetailsOpen] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const [currentLabel, setCurrentLabel] = useState('')
  const dispatch = useDispatch()
  const store = useSelector(state => state.mail)

  console.log('store', store)

  // ** Hooks and Variables
  const theme = useTheme()
  const { settings } = useSettings()
  const lgAbove = useMediaQuery(theme.breakpoints.up('lg'))
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))
  const smAbove = useMediaQuery(theme.breakpoints.up('sm'))
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))

  // ** Vars
  const leftSidebarWidth = 260
  const { skin, direction } = settings
  const composePopupWidth = mdAbove ? 754 : smAbove ? 520 : '100%'

  // ** Fetch Emails from Supabase
  useEffect(() => {
    const fetchEmails = async () => {
      let queryBuilder = supabase.from('emails').select('*')

      if (currentFolder) {
        queryBuilder = queryBuilder.eq('folder', currentFolder)
      }

      if (currentLabel) {
        queryBuilder = queryBuilder.eq('label', currentLabel)
      }

      if (query) {
        queryBuilder = queryBuilder.ilike('content', `%${query}%`)
      }

      const { data, error } = await queryBuilder

      if (!error && data) {
        setEmails(data)
      }
    }

    fetchEmails()
  }, [query, currentFolder, currentLabel])

  // ** Variables
  const labelColors = {
    private: 'error',
    personal: 'success',
    company: 'primary',
    important: 'warning'
  }

  // ** UI Handlers
  const toggleComposeOpen = () => setComposeOpen(!composeOpen)
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  // ** Render
  return (
    <Box
      sx={
        {
          /* styles as before */
        }
      }
    >
      <SidebarLeft
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
      />
      <MailLog
        query={query}
        store={store}
        hidden={hidden}
        lgAbove={lgAbove}
        dispatch={dispatch}
        setQuery={setQuery}
        direction={direction}
        updateMail={updateMail}
        emails={emails}
        labelColors={labelColors}
        paginateMail={paginateMail}
        getCurrentMail={getCurrentMail}
        updateMailLabel={updateMailLabel}
        mailDetailsOpen={mailDetailsOpen}
        handleSelectMail={handleSelectMail}
        setMailDetailsOpen={setMailDetailsOpen}
        handleSelectAllMail={handleSelectAllMail}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
      />
      <ComposePopup
        mdAbove={mdAbove}
        composeOpen={composeOpen}
        composePopupWidth={composePopupWidth}
        toggleComposeOpen={toggleComposeOpen}
      />
    </Box>
  )
}

// export default EmailAppLayout
export default withReducer({ services: servicesSlice, network: network, mail: appMailSlice })(EmailAppLayout)
