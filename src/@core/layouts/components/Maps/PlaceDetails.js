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

  async function handleContactButton(place) {
    //Extract organisation code from NHS digital
    const ODS = place.NACSCode
    //search and see if there exists a profile with ODS code
    const { data, error } = await supabaseOrg
      .from('profiles')
      .select('ODS, id, chatParticipants(chat_id)')
      .eq('ODS', ODS)
      .single()
    if (data) {
      //It exist now search and see if a chat between the two already exists
      const targetId = data.id
      const userId = user.organisation.id
      const props = await supabaseOrg.from('chats').select('id').contains(`participants`, [userId, targetId])
      if (props.data) {
        //conversation already exists so navigate to the required conversation
        const chatID = props.data[0].id
        navigateToChat(ODS, chatID)
      } else {
        //conversation doesn't exists, now create a chat between the two parties and navigate to it
        console.log('ODS EXISTS BUT CHAT WITH USER DOESNT EXISTS')
        //ODS exists but there is no chat - so its time to create one between the two parties
        let chatID = 'bfef0f4d-72a1-401e-ad27-bd1d2647de61'
        navigateToChat(ODS, chatID)
      }
    } else {
      //ODS doesn't exists - create a profile from the information, then create a chat from the information, then navigate to the chat
      console.log('ODS DOESNT EXIST')
      console.log(place)
      const orgName = place.OrganisationName
      const ODS = place.NACSCode
      const role = 'admin'
      const unfilteredContacts = JSON.parse(place.Contacts)
      let contacts = []
      unfilteredContacts.map(type =>
        contacts.push({ [type.OrganisationContactMethodType]: type.OrganisationContactValue })
      )

      // create a profile - required fields = email, org name, role, ODS
      supabaseOrg
        .from('profiles')
        .insert({ ODS: ODS, email: `${orgName}.pharmex.com`, organisation_name: orgName, role: role })
        .select()
        .single()
        .then(async ({ data }) => {
          console.log(data)
          // profile created successful with organisaiton - now create a chat with no participants and extract its ID
          const result = await supabaseOrg.from('chats').insert({ type: 'b2b' }).select('id').single()

          return { ...result, ...data }
        })
        .then(async res => {
          console.log('CHATID and new userInfo', res)
          // chat ID made now create participants
          // console.log('USEEER ID', user)
          const result = await supabaseOrg.from('chatParticipants').insert([
            { chat_id: res.data.id, user_id: res.id, name: res.organisation_name },
            { chat_id: res.data.id, user_id: user.organisation.id, name: user.organisation.organisation_name }
          ])
          // console.log('ERROR IN PARTICIPANS', result)
          return res.id
        })
        .then(res => {
          console.log('Now navgate to chat with', res)
          navigateToChat('ODS', res)
        })
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
        <TabList onChange={handleChange} aria-label='card navigation example'>
          <Tab value='1' label='Info' />
          <Tab value='2' label='Item Two' />
          <Tab value='3' label='Item Three' />
        </TabList>
        <CardContent>
          <TabPanel value='1' sx={{ p: 0 }}>
            <Typography variant='p' sx={{ mb: 2 }}>
              {place.OrganisationName}
            </Typography>
            <Typography variant='body2' sx={{ mb: 4 }}>
              {place.NACSCode} Pudding tiramisu caramels. Gingerbread gummies danish chocolate bar toffee marzipan.
              Wafer wafer cake powder danish oat cake.
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
