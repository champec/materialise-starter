// ** React Imports
import React, { useState } from 'react'
// ** MUI Imports
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Button from '@mui/material/Button'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'

//** Next Imports
import { useRouter } from 'next/router'
import { supabaseOrg } from 'src/configs/supabase'
import { useOrgAuth } from 'src/hooks/useOrgAuth'

function PlaceDetails({ place, selected, refProp }) {
  // ** State
  const [value, setValue] = useState('1')
  const router = useRouter()
  const user = useOrgAuth()

  if (selected) refProp?.current?.scrollIntoView({ behavior: 'smooth', black: 'start' })

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const findOrCreateProfile = async (ODS, orgName, role) => {
    // Check if a profile with the given ODS code already exists
    const { data, error } = await supabaseOrg
      .from('profiles')
      .select('ODS, id, chatParticipants(chat_id)')
      .eq('ODS', ODS)
      .maybeSingle()
    if (error) {
      console.log(error, 'find or create profile error')
    }
    if (data) {
      // If the profile exists, return it
      return data
    } else {
      // If the profile does not exist, create and return it
      const { data: createdProfile, error: createError } = await supabaseOrg
        .from('profiles')
        .insert({ ODS: ODS, email: `${orgName + ODS}.pharmex.com`, organisation_name: orgName, role: role })
        .single()

      if (createError) {
        console.log(createError.message, 'find or create profile error')
        throw new Error(createError.message, 'find or create profile error')
      }

      return createdProfile
    }
  }

  const findOrCreateChat = async (userId, targetId) => {
    // Fetch all chats where the userId is a participant
    const { data: userChats, error } = await supabaseOrg
      .from('chatParticipants')
      .select('chat_id')
      .eq('user_id', userId)

    if (error) {
      console.log(error.message, 'find user chats error', user)
      throw new Error(error.message)
    }

    // Fetch all chats where the targetId is a participant
    const { data: targetChats, error: targetError } = await supabaseOrg
      .from('chatParticipants')
      .select('chat_id')
      .eq('user_id', targetId)

    if (targetError) {
      console.log(targetError.message, 'find target chats error')
      throw new Error(targetError.message)
    }
    console.log({ userChats, targetChats }, 'user and target chats')
    // Find the common chat_id between the userChats and targetChats
    const commonChat = userChats.find(userChat =>
      targetChats.some(targetChat => targetChat.chat_id === userChat.chat_id)
    )

    if (commonChat) {
      // If a chat exists, return it along with a flag indicating it was not newly created
      const { data: chat, error: chatError } = await supabaseOrg
        .from('chats')
        .select('*')
        .eq('id', commonChat.chat_id)
        .single()

      if (chatError) {
        console.log(chatError.message, 'find chat error')
        throw new Error(chatError.message)
      }

      return { chat, isNew: false }
    } else {
      // If a chat does not exist, create and return it along with a flag indicating it was newly created
      const { data: createdChat, error: createError } = await supabaseOrg
        .from('chats')
        .insert({ type: 'b2b' })
        .select()
        .single()

      if (createError) {
        console.log(createError.message, 'create chat error')
        throw new Error(createError.message)
      }

      return { chat: createdChat, isNew: true }
    }
  }

  const createParticipantsAndNavigate = async (chatId, userProfile, targetProfile, isNew) => {
    if (isNew) {
      // Create participants for the chat only if it's a new chat
      await supabaseOrg.from('chatParticipants').insert([
        { chat_id: chatId, user_id: userProfile.id, name: userProfile.organisation_name },
        { chat_id: chatId, user_id: targetProfile.id, name: targetProfile.organisation_name }
      ])
    }

    // Navigate to the chat
    router.push(
      {
        pathname: '/chat',
        query: { ODS: targetProfile.ODS, mapChatID: chatId }
      },
      '/chat'
    )
  }

  const handleContactButton = async place => {
    // Extract organization code from NHS digital
    const ODS = place.ods_code

    try {
      const targetProfile = await findOrCreateProfile(ODS, place.organisation_name, 'admin')
      const { chat, isNew } = await findOrCreateChat(user.organisation.id, targetProfile.id)
      console.log(chat, isNew, 'chat and is new')
      await createParticipantsAndNavigate(chat.id, user.organisation, targetProfile, isNew)
    } catch (error) {
      console.error('Error handling contact button:', error)
    }
  }

  const navigateToChat = (code, chatID) => {
    router.push(
      {
        pathname: '/chat',
        query: { ODS: code, mapChatID: chatID }
      },
      '/chat'
    )
  }

  return (
    <Card style={{ marginTop: '10px' }}>
      <TabContext value={value}>
        <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <TabList onChange={handleChange} aria-label='card navigation example'>
            <Tab value='1' label='Info' />
            <Tab value='2' label='Item Two' />
            <Tab value='3' label='Item Three' />
          </TabList>
        </Box>
        <CardContent>
          <TabPanel value='1' sx={{ p: 0 }}>
            <Typography variant='p' sx={{ mb: 2 }}>
              {place.organisation_name}
            </Typography>
            <Typography variant='body2' sx={{ mb: 4 }}>
              {place?.address1}
              <br />
              {place?.ods_code}
            </Typography>
            <Button variant='contained' onClick={() => handleContactButton(place)}>
              Contact
            </Button>
          </TabPanel>
          <TabPanel value='2' sx={{ p: 0 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Header Two
            </Typography>
            <Typography variant='body2' sx={{ mb: 4 }}>
              Dragée chupa chups soufflé cheesecake jelly tootsie roll cupcake marzipan. Carrot cake sweet roll gummi
              bears caramels jelly beans.
            </Typography>
            <Button variant='contained'>Button Two</Button>
          </TabPanel>
          <TabPanel value='3' sx={{ p: 0 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Header Three
            </Typography>
            <Typography variant='body2' sx={{ mb: 4 }}>
              Icing cake macaroon macaroon jelly chocolate bar. Chupa chups dessert dessert soufflé chocolate bar
              jujubes gummi bears lollipop.
            </Typography>
            <Button variant='contained'>Button Three</Button>
          </TabPanel>
        </CardContent>
      </TabContext>
    </Card>
  )
}

export default PlaceDetails
