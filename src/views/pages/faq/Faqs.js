// ** MUI Imports
import Tab from '@mui/material/Tab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import Accordion from '@mui/material/Accordion'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import MuiTabList from '@mui/lab/TabList'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import BroadCastComposer from 'src/views/apps/broadcast/BroadCastComposer'
import BroadCastInBox from 'src/views/apps/broadcast/BroadCastInBox'
import BroadCastTracker from 'src/views/apps/broadcast/BroadCastTracker'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// Styled TabList component
const MuiBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(8),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}))

const TabList = styled(MuiTabList)(({ theme }) => ({
  overflow: 'visible',
  '& .MuiTabs-flexContainer': {
    flexDirection: 'column'
  },
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minHeight: 40,
    minWidth: 280,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: theme.shape.borderRadius,
    '& svg': {
      marginBottom: 0,
      marginRight: theme.spacing(1)
    },
    [theme.breakpoints.down('md')]: {
      maxWidth: '100%'
    }
  }
}))

const Faqs = ({ data, activeTab, handleChange }) => {
  const renderTabContent = () => {
    return Object.values(data?.faqData).map(tab => {
      return (
        <TabPanel key={tab.id} value={tab.id} sx={{ p: 6, pt: 0, width: '100%' }}>
          <Box key={tab.id}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CustomAvatar skin='light' variant='rounded' sx={{ height: 42, width: 42 }}>
                <Icon icon={tab.icon} fontSize={28} />
              </CustomAvatar>
              <Box sx={{ ml: 4 }}>
                <Typography variant='h5'>{tab.title}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{tab.subtitle}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 4 }}>
              {activeTab === 'tab1' && <BroadCastComposer />}
              {activeTab === 'tab2' && <BroadCastInBox />}
              {activeTab === 'tab3' && <BroadCastTracker />}
            </Box>
          </Box>
        </TabPanel>
      )
    })
  }

  const renderTabs = () => {
    if (data !== null) {
      return Object.values(data?.faqData).map(tab => {
        if (tab.qandA.length) {
          return <Tab key={tab.id} value={tab.id} label={tab.title} icon={<Icon icon={tab.icon} fontSize={20} />} />
        } else {
          return null
        }
      })
    } else {
      return null
    }
  }

  return (
    <MuiBox>
      <TabContext value={activeTab}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <TabList onChange={handleChange}>{renderTabs()}</TabList>
          <Box
            sx={{
              mt: 12,
              display: 'flex',
              justifyContent: 'center',
              '& img': { maxWidth: '100%', display: { xs: 'none', md: 'block' } }
            }}
          >
            <img height={195} alt='illustration' src='/images/pages/faq-illustration.png' />
          </Box>
        </Box>
        {renderTabContent()}
      </TabContext>
    </MuiBox>
  )
}

export default Faqs
