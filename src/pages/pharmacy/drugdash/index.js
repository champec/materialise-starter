import React, { useState, useEffect } from 'react'
import { Container, AppBar, Toolbar, Typography, Button, Paper, Box } from '@mui/material'
import DDLane from './lowerdashboard/ddlanes'
import DDCard from './lowerdashboard/ddCards'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBags, fetchCollections } from '../../../store/apps/drugdash/ddThunks'
import { selectBagsByStatus, selectAllCollections } from '../../../store/apps/drugdash'
import { styled, useTheme } from '@mui/material/styles'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import ModalManager from 'src/views/apps/drugdash/ModalManager'
import { openModal } from 'src/store/apps/drugdash/ddModals'
import withReducer from 'src/@core/HOC/withReducer'
import drugDash from '../../../store/apps/drugdash'
import modalSlice from '../../../store/apps/drugdash/ddModals'

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
    height: 6
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
  const theme = useTheme()

  const inPharmacyBags = useSelector(state => selectBagsByStatus(state, 'in_pharmacy'))
  const inGroupBags = useSelector(state => selectBagsByStatus(state, 'in_group'))
  const inTransitBags = useSelector(state => selectBagsByStatus(state, 'in_transit'))
  const deliveredBags = useSelector(state => selectBagsByStatus(state, 'delivered'))
  const collections = useSelector(selectAllCollections)

  useEffect(() => {
    dispatch(fetchBags())
    dispatch(fetchCollections())
  }, [dispatch])

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const handleWheel = e => {
    if (e.deltaY !== 0 && e.target.closest('.LanePaper')) {
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

  const handleOpenCollectionModal = () => {
    dispatch(openModal('newCollection'))
  }

  const lanes = [
    { key: 'in_pharmacy', title: 'In Pharmacy', data: inPharmacyBags },
    { key: 'collections', title: 'Collections', data: collections },
    { key: 'in_transit', title: 'In Transit', data: inTransitBags },
    { key: 'delivered', title: 'Delivered', data: deliveredBags }
  ]

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
          <Button color='inherit' onClick={handleOpenCollectionModal}>
            Add New Collection
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
              <DDLane key={lane.key} title={lane.title}>
                {lane.data.map(item => (
                  <DDCard key={item.id} title={item.title} data={item} />
                ))}
              </DDLane>
            ))}
          </Box>
        )}
      </StyledContainer>
      <ModalManager />
    </Container>
  )
}

export default withReducer({ drugDash, ddModals: modalSlice })(Index)
