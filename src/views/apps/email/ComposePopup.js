// ** React Imports
import { useState, useRef, useEffect, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import Menu from '@mui/material/Menu'
import Input from '@mui/material/Input'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import MenuItem from '@mui/material/MenuItem'
import ListItem from '@mui/material/ListItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import ButtonGroup from '@mui/material/ButtonGroup'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import { EditorState, convertToRaw } from 'draft-js'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'

// ** Styled Component Imports
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import debounce from 'lodash/debounce'

// ** RTK imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchNetworkAndNearby, searchPharmacies } from 'src/store/network'
import { createConversation } from 'src/store/apps/email/conversationsSlice'
import { appendMessage } from 'src/store/apps/email/messagesSlice'

// ** Styles
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

const menuItemsArr = [
  {
    name: 'Ross Geller',
    value: 'ross',
    src: '/images/avatars/1.png'
  },
  {
    name: 'Pheobe Buffay',
    value: 'pheobe',
    src: '/images/avatars/2.png'
  },
  {
    name: 'Joey Tribbiani',
    value: 'joey',
    src: '/images/avatars/3.png'
  },
  {
    name: 'Rachel Green',
    value: 'rachel',
    src: '/images/avatars/4.png'
  },
  {
    name: 'Chandler Bing',
    value: 'chandler',
    src: '/images/avatars/5.png'
  },
  {
    name: 'Monica Geller',
    value: 'monica',
    src: '/images/avatars/8.png'
  }
]
const filter = createFilterOptions()

const ComposePopup = props => {
  // ** Props
  const { mdAbove, composeOpen, composePopupWidth, toggleComposeOpen } = props

  const dispatch = useDispatch()

  // ** States
  const [emailTo, setEmailTo] = useState([])
  const [ccValue, setccValue] = useState([])
  const [subjectValue, setSubjectValue] = useState('')
  const [bccValue, setbccValue] = useState([])
  const [sendBtnOpen, setSendBtnOpen] = useState(false)
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty())
  const networkStatuses = useSelector(state => state.network.status)
  const userId = useSelector(state => state.organisation.organisation.id)

  // Accessing specific statuses
  const fetchNetworkAndNearbyStatus = networkStatuses.fetchNetworkAndNearby
  const searchPharmaciesStatus = networkStatuses.searchPharmacies

  const [visibility, setVisibility] = useState({
    cc: false,
    bcc: false
  })

  const contacts = useSelector(state => state.network.contacts)

  console.log({ contacts })

  const handleSearch = debounce(value => {
    dispatch(searchPharmacies({ searchQuery: value }))
  }, 300)

  useEffect(() => {
    dispatch(fetchNetworkAndNearby())
  }, [])

  // ** Ref
  const anchorRefSendBtn = useRef(null)
  const toggleVisibility = value => setVisibility({ ...visibility, [value]: !visibility[value] })

  const handleSendMenuItemClick = () => {
    setSendBtnOpen(false)
  }

  const handleSendBtnToggle = () => {
    setSendBtnOpen(prevOpen => !prevOpen)
  }

  const handleMailDelete = (value, state, setState) => {
    const arr = state
    const index = arr.findIndex(i => i.value === value)
    arr.splice(index, 1)
    setState([...arr])
  }

  const startNewConversation = async (recipients, isGroupChat) => {
    console.log('start new conversation')
    const resultAction = await dispatch(
      createConversation({
        subject: subjectValue, // can be empty or any meta-information
        recipients,
        groupChat: false
      })
    )

    if (createConversation.fulfilled.match(resultAction)) {
      // If the payload is an array, return it as is. If not, wrap it in an array.
      const payload = resultAction.payload
      console.log(payload)
      return payload
    } else {
      // Handle error if needed
      console.error('Failed to create conversation:', resultAction.error)
    }
  }

  const addMessagesToConversations = async (conversations, messageContent) => {
    const results = []

    for (const conversation of conversations) {
      console.log('APPEND', conversation)
      const resultAction = await dispatch(
        appendMessage({
          conversationId: conversation.id,
          content: messageContent
        })
      )

      if (appendMessage.fulfilled.match(resultAction)) {
        results.push(resultAction.payload)
      } else {
        console.error('Failed to append message:', resultAction.error)
      }
    }
    console.log(results, 'and message to conversations')
    return results // This will be an array of results from each message append operation
  }

  const handleSend = async () => {
    // Create new conversations
    console.log('handle send')
    const recipients = emailTo.map(item => item.value)
    const groupChat = false
    const payload = await startNewConversation(recipients, groupChat)
    const conversations = payload.conversations

    console.log('handlesend', conversations)

    if (conversations && conversations.length > 0) {
      // Get the content from your EditorState
      const rawContent = convertToRaw(messageValue.getCurrentContent())
      const messageContent = JSON.stringify(rawContent)

      // Add messages to the conversations
      const results = await addMessagesToConversations(conversations, messageContent)

      if (results && results.length === conversations.length) {
        // This is just a check to ensure all messages were successfully appended.
        // You can expand on this if you have more specific error handling in mind.
        // Clear your states after sending the message
        // handlePopupClose()
      } else {
        // Handle the case where not all messages were appended successfully
      }
    } else {
      // Handle case where conversations weren't created successfully
    }
  }

  const handlePopupClose = () => {
    toggleComposeOpen()
    setEmailTo([])
    setccValue([])
    setbccValue([])
    setSubjectValue('')
    setMessageValue(EditorState.createEmpty())
    setVisibility({
      cc: false,
      bcc: false
    })
  }

  const transformedData = useMemo(() => {
    const groups = ['recent', 'network', 'nearby', 'others']
    const result = []

    groups.forEach(group => {
      contacts[group].forEach(item => {
        result.push({
          group,
          name: item.organisation_name,
          value: item.id,
          email: item.organisation_email,
          ods: item.ods_code,
          address: item.address1
        })
      })
    })

    return result
  }, [contacts])

  const handleMinimize = () => {
    toggleComposeOpen()
    setEmailTo(emailTo)
    setccValue(ccValue)
    setbccValue(bccValue)
    setVisibility(visibility)
    setMessageValue(messageValue)
    setSubjectValue(subjectValue)
  }

  const renderCustomChips = (array, getTagProps, state, setState) => {
    return array.map((item, index) => (
      <Chip
        size='small'
        key={item.value}
        label={item.name}
        {...getTagProps({ index })}
        deleteIcon={<Icon icon='mdi:close' />}
        onDelete={() => handleMailDelete(item.value, state, setState)}
      />
    ))
  }

  const renderListItem = (props, option, array, setState) => {
    console.log('emailTO', option)
    return (
      <ListItem key={option.value} sx={{ cursor: 'pointer' }} onClick={() => setState([...array, option])}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {option?.src?.length ? (
            <CustomAvatar src={option?.src} alt={option.name} sx={{ mr: 3, width: 22, height: 22 }} />
          ) : (
            <CustomAvatar skin='light' color='primary' sx={{ mr: 3, width: 22, height: 22, fontSize: '.75rem' }}>
              {getInitials(option.name || 'removethis')}
            </CustomAvatar>
          )}
          <Typography sx={{ fontSize: '0.875rem' }}>{option.name}</Typography>
        </Box>
      </ListItem>
    )
  }

  const addNewOption = (options, params) => {
    const filtered = filter(options, params)
    const { inputValue } = params
    const isExisting = options.some(option => inputValue === option.name)
    if (inputValue !== '' && !isExisting) {
      filtered.push({
        name: inputValue,
        value: inputValue,
        src: ''
      })
    }

    // @ts-ignore
    return filtered
  }

  return (
    <Drawer
      hideBackdrop
      anchor='bottom'
      open={composeOpen}
      variant='temporary'
      onClose={toggleComposeOpen}
      sx={{
        top: 'auto',
        left: 'auto',
        right: mdAbove ? '1.5rem' : '1rem',
        bottom: '1.5rem',
        display: 'block',
        zIndex: theme => `${theme.zIndex.drawer} + 1`,
        '& .MuiDrawer-paper': {
          borderRadius: 1,
          position: 'static',
          width: composePopupWidth
        }
      }}
    >
      <Box
        sx={{
          px: 4,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.08)`
        }}
      >
        <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Compose Mail</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton sx={{ p: 1, mr: 2, color: 'action.active' }} onClick={handleMinimize}>
            <Icon icon='mdi:minus' fontSize={20} />
          </IconButton>
          <IconButton
            sx={{ p: 1, color: 'action.active' }}
            onClick={handlePopupClose}
            // onClick={handleSend}
          >
            <Icon icon='mdi:close' fontSize={20} />
          </IconButton>
        </Box>
      </Box>
      <Box
        sx={{
          py: 1,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          <div>
            <InputLabel sx={{ mr: 3, color: 'text.disabled' }} htmlFor='email-to-select'>
              To:
            </InputLabel>
          </div>
          <Autocomplete
            multiple
            freeSolo
            value={emailTo} // Assuming emailTo is a state variable in your component
            id='email-to-select'
            filterSelectedOptions
            options={transformedData}
            groupBy={option => option.group}
            ListboxComponent={List}
            filterOptions={addNewOption}
            getOptionLabel={option => option.name}
            renderOption={(props, option) => renderListItem(props, option, emailTo, setEmailTo)}
            renderTags={(array, getTagProps) => renderCustomChips(array, getTagProps, emailTo, setEmailTo)}
            renderGroup={params => {
              if (!params.children.length) return null
              if (params.group === 'others' && searchPharmaciesStatus === 'loading') {
                return (
                  <div>
                    <Typography variant='caption'>Others loading</Typography>
                    {/* Display loading spinner here */}
                  </div>
                )
              }

              return (
                <div>
                  <Typography variant='caption'>{params.group}</Typography>
                  {params.children}
                </div>
              )
            }}
            onInputChange={(event, value, reason) => {
              if (reason === 'input') {
                handleSearch(value)
              }
            }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': { p: 2 },
              '& .MuiAutocomplete-endAdornment': { display: 'none' }
            }}
            renderInput={params => (
              <TextField
                {...params}
                autoComplete='new-password'
                sx={{
                  border: 0,
                  '& fieldset': { border: '0 !important' },
                  '& .MuiOutlinedInput-root': { p: '0 !important' }
                }}
              />
            )}
          />
        </Box>
        <Typography sx={{ color: 'text.secondary' }}>
          <Box component='span' sx={{ cursor: 'pointer' }} onClick={() => toggleVisibility('cc')}>
            Cc
          </Box>
          <Box component='span' sx={{ mx: 2 }}>
            |
          </Box>
          <Box component='span' sx={{ cursor: 'pointer' }} onClick={() => toggleVisibility('bcc')}>
            Bcc
          </Box>
        </Typography>
      </Box>
      {visibility.cc ? (
        <Box
          sx={{
            py: 1,
            px: 4,
            display: 'flex',
            alignItems: 'center',
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <div>
            <InputLabel sx={{ mr: 3, color: 'text.disabled' }} htmlFor='email-cc-select'>
              Cc:
            </InputLabel>
          </div>
          <TextField
            fullWidth
            size='small'
            sx={{
              border: 0,
              '& fieldset': { border: '0 !important' },
              '& .MuiOutlinedInput-root': { p: '0 !important' }
            }}
          />
        </Box>
      ) : null}
      {visibility.bcc ? (
        <Box
          sx={{
            py: 1,
            px: 4,
            display: 'flex',
            alignItems: 'center',
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <div>
            <InputLabel sx={{ mr: 3, color: 'text.disabled' }} htmlFor='email-bcc-select'>
              Bcc:
            </InputLabel>
          </div>
          <TextField
            fullWidth
            size='small'
            sx={{
              border: 0,
              '& fieldset': { border: '0 !important' },
              '& .MuiOutlinedInput-root': { p: '0 !important' }
            }}
          />
        </Box>
      ) : null}
      <Box
        sx={{
          py: 1,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <div>
          <InputLabel sx={{ mr: 3, color: 'text.disabled' }} htmlFor='email-subject-input'>
            Subject:
          </InputLabel>
        </div>
        <Input
          fullWidth
          value={subjectValue}
          id='email-subject-input'
          onChange={e => setSubjectValue(e.target.value)}
          sx={{ '&:before, &:after': { display: 'none' }, '& .MuiInput-input': { py: 1.875 } }}
        />
      </Box>
      <EditorWrapper
        sx={{
          '& .rdw-editor-wrapper': {
            border: '0 !important'
          },
          '& .rdw-editor-toolbar': {
            p: '0.35rem 1rem !important',
            '& .rdw-option-wrapper': {
              minWidth: '1.25rem',
              borderRadius: '4px !important'
            },
            '& .rdw-inline-wrapper, & .rdw-text-align-wrapper': {
              mb: 0
            }
          },
          '& .rdw-editor-main': {
            px: '1.25rem'
          }
        }}
      >
        <ReactDraftWysiwyg
          editorState={messageValue}
          onEditorStateChange={editorState => setMessageValue(editorState)}
          placeholder='Message'
          toolbar={{
            options: ['inline', 'textAlign'],
            inline: {
              inDropdown: false,
              options: ['bold', 'italic', 'underline', 'strikethrough']
            }
          }}
        />
      </EditorWrapper>
      <Box
        sx={{
          px: 4,
          py: 3.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ButtonGroup variant='contained' ref={anchorRefSendBtn} aria-label='split button'>
            <Button onClick={handleSend}>Send</Button>
            <Button
              size='small'
              aria-haspopup='true'
              onClick={handleSendBtnToggle}
              aria-label='select merge strategy'
              aria-expanded={sendBtnOpen ? 'true' : undefined}
              aria-controls={sendBtnOpen ? 'email-send-menu' : undefined}
            >
              <Icon icon='mdi:chevron-up' fontSize='1.25rem' />
            </Button>
          </ButtonGroup>
          <Menu
            keepMounted
            open={sendBtnOpen}
            id='email-send-menu'
            onClose={handleSendMenuItemClick}
            anchorEl={anchorRefSendBtn.current}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
          >
            <MenuItem onClick={handleSendMenuItemClick}>Schedule Send</MenuItem>
            <MenuItem onClick={handleSendMenuItemClick}>Save as Draft</MenuItem>
          </Menu>
          <IconButton size='small' sx={{ ml: 3.5 }}>
            <Icon icon='mdi:attachment' fontSize='1.25rem' />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <OptionsMenu
            iconButtonProps={{ size: 'small' }}
            iconProps={{ fontSize: '1.25rem' }}
            options={['Print', 'Check spelling', 'Plain text mode']}
            menuProps={{
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              transformOrigin: { vertical: 'bottom', horizontal: 'right' }
            }}
          />
          <IconButton size='small' onClick={handlePopupClose}>
            <Icon icon='mdi:delete-outline' fontSize='1.25rem' />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ComposePopup
