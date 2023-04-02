// ** React Imports
import { useRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Imports
import { getInitials } from 'src/@core/utils/get-initials'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { supabaseOrg } from 'src/configs/supabase'
import { useUserAuth } from 'src/hooks/useAuth'

const PerfectScrollbar = styled(PerfectScrollbarComponent)(({ theme }) => ({
  padding: theme.spacing(5)
}))

const ChatLog = props => {
  const [messages, setMessages] = useState(props.data[0]?.chatMessages)

  // ** Props

  const { data, hidden, id } = props

  //** realtime Chat Messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabaseOrg
        .from('chatMessages')
        .select('*')
        .eq('chat_id', props.data[2])
        .order('created_at', { ascending: true })

      setMessages(data)
    }

    fetchMessages()

    // const channel = supabaseOrg
    //   .channel('*')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chatMessages' }, payload => {
    //     const newMessage = payload.new
    //     if (!messages.find(message => message.id == newMessage.id)) {
    //       setMessages([...messages, newMessage])
    //     } else {
    //       console.log({ newMessage })
    //     }
    //   })
    //   .subscribe()
    // return () => {
    //   supabaseOrg.removeChannel(channel)
    // }
  }, [data])

  // ** Ref
  const chatArea = useRef(null)
  //! DONt need to useOrg - the information is contained in the props.data - username and organisation name // auth.uid() sb function with check user_id = auth.uid()
  const { organisation } = useOrgAuth()

  // ** Scroll to chat bottom
  const scrollToBottom = () => {
    if (chatArea.current) {
      if (hidden) {
        // @ts-ignore
        chatArea.current.scrollTop = Number.MAX_SAFE_INTEGER
      } else {
        // @ts-ignore
        chatArea.current._container.scrollTop = Number.MAX_SAFE_INTEGER
      }
    }
  }

  // ** Formats chat data based on sender
  const formattedChatData = () => {
    let chatLog = []
    if (messages) {
      chatLog = messages
    }
    const formattedChatLog = []
    let chatMessageSenderId = organisation.id //chatLog[0] ? chatLog[0].senderId : 11

    let msgGroup = {
      senderId: chatMessageSenderId,
      messages: []
    }
    chatLog.forEach((msg, index) => {
      const feedback = { isSent: msg.isSent, isSeen: msg.isSeen, isDelivered: msg.isDelivered }
      if (chatMessageSenderId === msg.sender_id) {
        msgGroup.messages.push({
          time: msg.created_at,
          msg: msg.message,
          feedback: feedback
        })
      } else {
        chatMessageSenderId = msg.sender_id
        formattedChatLog.push(msgGroup)
        msgGroup = {
          senderId: msg.sender_id,
          messages: [
            {
              time: msg.created_at,
              msg: msg.message,
              feedback: msg?.feedback
            }
          ]
        }
      }
      if (index === chatLog.length - 1) formattedChatLog.push(msgGroup)
    })

    return formattedChatLog
  }

  const renderMsgFeedback = (isSender, chat) => {
    if (isSender) {
      const feedback = { isSent: chat.isSent, isSeen: chat.isSeen, isDelivered: chat.isDelivered }
      if (feedback.isSent && !feedback.isDelivered) {
        return (
          <Box component='span' sx={{ display: 'inline-flex', '& svg': { mr: 2, color: 'text.secondary' } }}>
            <Icon icon='mdi:check' fontSize='1rem' />
          </Box>
        )
      } else if (feedback.isSent && feedback.isDelivered) {
        return (
          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              '& svg': { mr: 2, color: feedback.isSeen ? 'success.main' : 'text.secondary' }
            }}
          >
            <Icon icon='mdi:check-all' fontSize='1rem' />
          </Box>
        )
      } else {
        return null
      }
    }
  }
  useEffect(() => {
    if (messages && messages.length) {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  // ** Renders user chat
  const renderChats = () => {
    return formattedChatData().map((item, index) => {
      const isSender = item.senderId !== organisation.id

      return (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: !isSender ? 'row' : 'row-reverse',
            mb: index !== formattedChatData().length - 1 ? 9.75 : undefined
          }}
        >
          <div>
            <CustomAvatar
              skin='light'
              color={data?.contact?.avatarColor ? data?.contact?.avatarColor : undefined}
              sx={{
                width: '2rem',
                height: '2rem',
                fontSize: '0.875rem',
                ml: isSender ? 4 : undefined,
                mr: !isSender ? 4 : undefined
              }}
              {...(data?.contact?.avatar && !isSender
                ? {
                    src: data?.contact?.avatar,
                    alt: data.contact.fullName
                  }
                : {})}
              {...(isSender
                ? {
                    src: data?.userContact?.avatar,
                    alt: data?.userContact?.fullName
                  }
                : {})}
            >
              {isSender ? getInitials(organisation.organisation_name) : getInitials(data[1].name)}
            </CustomAvatar>
          </div>

          <Box className='chat-body' sx={{ maxWidth: ['calc(100% - 5.75rem)', '75%', '65%'] }}>
            {item.messages.map((chat, index, { length }) => {
              return (
                <Box key={index} sx={{ '&:not(:last-of-type)': { mb: 3.5 } }}>
                  <div>
                    <Typography
                      sx={{
                        boxShadow: 1,
                        borderRadius: 1,
                        width: 'fit-content',
                        fontSize: '0.875rem',
                        p: theme => theme.spacing(3, 4),
                        ml: isSender ? 'auto' : undefined,
                        borderTopLeftRadius: !isSender ? 0 : undefined,
                        borderTopRightRadius: isSender ? 0 : undefined,
                        color: isSender ? 'common.white' : 'text.primary',
                        backgroundColor: isSender ? 'primary.main' : 'background.paper'
                      }}
                    >
                      {chat.msg}
                    </Typography>
                  </div>
                  {index + 1 === length ? (
                    <Box
                      sx={{
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isSender ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {renderMsgFeedback(isSender, chat)}
                      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                        {chat.time
                          ? new Date(chat.time).toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true
                            })
                          : null}
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              )
            })}
          </Box>
        </Box>
      )
    })
  }

  const ScrollWrapper = ({ children }) => {
    if (hidden) {
      return (
        <Box ref={chatArea} sx={{ p: 5, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </Box>
      )
    } else {
      return (
        <PerfectScrollbar ref={chatArea} options={{ wheelPropagation: false }}>
          {children}
        </PerfectScrollbar>
      )
    }
  }

  return (
    <Box sx={{ height: 'calc(100% - 8.4375rem)' }}>
      <ScrollWrapper>{renderChats()}</ScrollWrapper>
    </Box>
  )
}

export default ChatLog
