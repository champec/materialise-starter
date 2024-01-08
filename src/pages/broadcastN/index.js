// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import withReducer from 'src/@core/HOC/withReducer'
import conversationsSlice from 'src/store/apps/email/conversationsSlice'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import axios from 'axios'

// ** Demo Imports
import FAQS from 'src/views/pages/faq/Faqs'
import FaqHeader from 'src/views/pages/faq/FaqHeader'
import FaqFooter from 'src/views/pages/faq/FaqFooter'

const FAQ = ({ apiData }) => {
  // ** States
  const [data, setData] = useState(data2)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('tab2')

  const handleChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const renderNoResult = (
    <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', '& svg': { mr: 2 } }}>
      <Icon icon='mdi:alert-circle-outline' />
      <Typography variant='h6'>No Results Found!!</Typography>
    </Box>
  )

  return (
    <Fragment>
      {/* <FaqHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}
      {data !== null ? <FAQS data={data} activeTab={activeTab} handleChange={handleChange} /> : renderNoResult}
      {/* <FaqFooter /> */}
    </Fragment>
  )
}

const data2 = {
  faqData: {
    tab1: {
      id: 'tab1',
      icon: 'iconName1',
      title: 'Broadcast Composer',
      subtitle: 'Create a structured Broadcast',
      qandA: [
        {
          id: 'question1',
          question: 'Question 1',
          answer: 'Answer 1'
        },
        {
          id: 'question2',
          question: 'Question 2',
          answer: 'Answer 2'
        }
      ]
    },
    tab2: {
      id: 'tab2',
      icon: 'iconName2',
      title: 'Inbox',
      subtitle: 'Broadcast Inbox',
      qandA: [
        {
          id: 'question1',
          question: 'Question 1',
          answer: 'Answer 1'
        }
      ]
    },
    tab3: {
      id: 'tab3',
      icon: 'iconName2',
      title: 'My Broadcasts',
      subtitle: 'My Broadcasts',
      qandA: [
        {
          id: 'question1',
          question: 'Question 1',
          answer: 'Answer 1'
        }
      ]
    }
  }
}

export default withReducer('conversations', conversationsSlice)(FAQ)
