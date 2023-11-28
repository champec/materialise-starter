import React, { useState, useEffect } from 'react'
import { Container, AppBar, Toolbar, Typography, Button, Paper, Box } from '@mui/material'
import Lane from './lowerdashboard/ddlanes'
import Card from './lowerdashboard/ddCards'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBags } from 'src/store/apps/drugdash/ddBags'
import { fetchJobs } from 'src/store/apps/drugdash/ddDelivery'
import { styled, useTheme } from '@mui/material/styles'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import ModalManager from 'src/views/apps/drugdash/ModalManager'
import { openModal, closeModal } from 'src/store/apps/drugdash/ddModals'

const Settings = () => {
  return (
    <div>
      <h2>Settings</h2>
    </div>
  )
}

const StyledContainer = styled(Paper)(({ theme }) => ({
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: 6 // This targets the horizontal scrollbar's height
  },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 20,
    background: hexToRGBA(theme.palette.mode === 'light' ? '#BFBFD5' : '#57596C', 0.6)
  },
  '&::-webkit-scrollbar-track': {
    borderRadius: 20,
    background: 'transparent'
  }
}))

const Index = () => {
  const [showSettings, setShowSettings] = useState(false)
  const dispatch = useDispatch()
  // converted to array to map over it
  const lanes = useSelector(state => Object.values(state.drugdash.lanes))
  const theme = useTheme()

  useEffect(() => {
    dispatch(fetchBags())
    dispatch(fetchJobs())
  }, [dispatch])

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const handleWheel = e => {
    if (e.deltaY !== 0 && e.target.closest('.LanePaper')) {
      // check if event target is inside a Lane
      return // Ignore vertical scrolls inside a Lane
    }
    const container = e.currentTarget
    if (e.deltaY !== 0) {
      container.scrollLeft += e.deltaY
      e.preventDefault()
    }
  }

  const handleOpenBagModal = () => {
    dispatch(openModal('newBag'))
  }

  const handleOpenJobModal = () => {
    dispatch(openModal('newJob'))
  }

  return (
    <Container>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6'>DrugDash</Typography>
          <Button color='inherit' onClick={toggleSettings}>
            {showSettings ? 'Dashboard' : 'Settings'}
          </Button>
          <Button color='inherit' onClick={handleOpenBagModal}>
            Add New Bag
          </Button>
          <Button color='inherit' onClick={handleOpenJobModal}>
            Add New Delivery
          </Button>
        </Toolbar>
      </AppBar>
      <StyledContainer
        className='LanePaper'
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: 'calc(100vh - 64px)',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}
      >
        {showSettings ? (
          <Settings />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%', flexWrap: 'nowrap' }} onWheel={handleWheel}>
            {lanes.map(lane => (
              <Lane key={lane.key} title={lane.title}>
                {lane.data.map(item => (
                  <Card key={item.id} title={item.title} data={item} />
                ))}
              </Lane>
            ))}
          </Box>
        )}
      </StyledContainer>
      <ModalManager />
    </Container>
  )
}

export default Index
