import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Divider,
  IconButton,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Box
} from '@mui/material'
import { useDispatch } from 'react-redux'
import { openModal } from '../../../../store/apps/drugdash/ddModals'

import Icon from 'src/@core/components/icon'

const DDCard = ({ data }) => {
  console.log(data, 'data')
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const getIconByType = type => {
    switch (type) {
      case 'rx_bag':
        return 'solar:bag-2-bold-duotone'
      case 'delivery_box':
        return 'solar:box-bold-duotone'
      case 'shop_order':
        return 'solar:shop-bold-duotone'
      case 'pharmacy_exchange':
        return 'icon-park-twotone:exchange-four'
      default:
        return ''
    }
  }

  const handleCardClick = () => {
    console.log('CLICKED ON EDIT BAG', data)

    if (data.is_bag == true) {
      dispatch(openModal({ modalName: 'newBag', props: { bagId: data.id } }))

      // case 'delivery_box':
      //   dispatch(openModal({ modalName: 'addEditCollection', props: { collectionId: data.id } }))
      //   break
      // Add more cases as needed
    } else if (data.is_collection == true && data.status === 'pending') {
      dispatch(openModal({ modalName: 'addEditCollection', props: { collectionId: data.id } }))
    } else if (data.is_collection == true && data.status === 'in_transit') {
      dispatch(openModal({ modalName: 'transitStops', props: { collectionId: data.id } }))
    }
  }

  const renderMiddleSection = () => {
    switch (data.type) {
      case 'rx_bag':
        return (
          <Box>
            <Box sx={{ flexDirection: 'row' }}>
              <Box className='Name'>
                <Typography variant='caption'>{`${data.patient.first_name} ${data.patient.last_name}`}</Typography>
              </Box>
              <Box className='Menu'>
                <IconButton onClick={handleMenuClick} size='small' sx={{ position: 'absolute', right: 4, top: 4 }}>
                  <Icon icon={'gg:more-vertical'} />
                </IconButton>
                <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
                  <MenuItem onClick={handleMenuClose}>Make Ready</MenuItem>
                  <MenuItem onClick={handleMenuClose}>Add to Delivery</MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>
          // <List>
          //   <ListItem>
          //     <ListItemText primary={`${data.patient.first_name} ${data.patient.last_name}`} />
          //   </ListItem>
          //   <ListItem>
          //     <ListItemText primary={`Address: ${data.patient.address}, ${data.patient.city}`} />
          //   </ListItem>
          //   <ListItem>
          //     <ListItemText primary={`Items: ${data.medications.length}, in bag`} />
          //   </ListItem>
          //   {data.medications.map((med, i) => (
          //     <ListItem key={i}>
          //       <ListItemText primary={`${med.name} (${med.quantity})`} />
          //     </ListItem>
          //   ))}
          // </List>
        )

      case 'delivery_box':
        return (
          <List>
            <ListItem>
              <ListItemText primary={`Driver: ${data.driver.name}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Phone: ${data.driver.phone}`} />
            </ListItem>
            {data.bags.map((bag, i) => (
              <ListItem key={i}>
                <ListItemText primary={`${bag.patientName} - Status: ${bag.status}`} />
              </ListItem>
            ))}
          </List>
        )
      // Add more cases for 'shop_order' and 'pharmacy_exchange'
      default:
        return null
    }
  }

  const formatDate = dateStr => {
    const date = new Date(dateStr)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMenuClick = event => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <Card elevation={3} sx={{ minWidth: 240, marginBottom: 1, border: '1px solid #ccc', padding: '4px' }}>
      {/* Top Section */}
      <CardContent sx={{ padding: '2px' }}>
        <Grid container alignItems='center' spacing={1}>
          <Grid item xs={2}>
            <Icon icon={getIconByType(data.type)} width='20' height='20' />
          </Grid>
          <Grid item xs={4}>
            <Typography variant='caption'>{data.title}</Typography>
          </Grid>
          <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'row' }}>
            <IconButton size='small' onClick={handleCardClick}>
              <Icon icon={'ep:edit'} />
            </IconButton>
            <IconButton size='small'>
              <Icon icon={'carbon:map'} />
            </IconButton>
            <IconButton size='small'>
              <Icon icon={'tdesign:call-1'} />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
      <Divider sx={{ margin: '2px 0' }} />

      {/* Middle Section */}
      <CardContent sx={{ padding: '2px' }}>{renderMiddleSection()}</CardContent>
      <Divider sx={{ margin: '2px 0' }} />

      {/* Bottom Section */}
      <CardContent sx={{ padding: '2px' }}>
        <Typography variant='body2'>{`Loc: ${data.location_status}, Status: ${data.operational_status}`}</Typography>
        <Typography variant='caption'>{`Created: ${formatDate(data.created_at)}`}</Typography>
      </CardContent>
    </Card>
  )
}

export default DDCard
