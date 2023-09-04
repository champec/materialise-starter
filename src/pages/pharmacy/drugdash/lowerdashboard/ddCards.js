import React from 'react'
import { Card, CardContent, Divider, IconButton, Typography, Grid, List, ListItem, ListItemText } from '@mui/material'

import Icon from 'src/@core/components/icon'

const DDCard = ({ data }) => {
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
  const renderMiddleSection = () => {
    switch (data.type) {
      case 'rx_bag':
        return (
          <List>
            <ListItem>
              <ListItemText primary={`${data.patient.firstName} ${data.patient.lastName}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Address: ${data.patient.address}, ${data.patient.city}`} />
            </ListItem>
            {data.medications.map((med, i) => (
              <ListItem key={i}>
                <ListItemText primary={`${med.name} (${med.quantity})`} />
              </ListItem>
            ))}
          </List>
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

  return (
    <Card elevation={3} sx={{ minWidth: 275, marginBottom: 2, border: '1px solid #ccc' }}>
      {/* Top Section */}
      <CardContent sx={{ padding: '8px' }}>
        <Grid container alignItems='center' spacing={1}>
          <Grid item xs={2}>
            <IconButton>
              <Icon icon={getIconByType(data.type)} />
            </IconButton>
            <Typography variant='caption'>{data.type}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='subtitle1' noWrap>
              {data.title}
            </Typography>
          </Grid>
          <Grid item xs={4} style={{ textAlign: 'right' }}>
            <IconButton>
              <Icon icon={'ep:edit'} />
            </IconButton>
            <IconButton>
              <Icon icon={'carbon:map'} />
            </IconButton>
            <IconButton>
              <Icon icon={'tdesign:call-1'} />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />

      {/* Middle Section */}
      <CardContent>{renderMiddleSection()}</CardContent>
      <Divider />

      {/* Bottom Section */}
      <CardContent>
        {/* Add the status details here */}
        <Typography variant='body2'>{`Status: ${data.status}`}</Typography>
        <Typography variant='caption'>{`Created at: ${data.createdAt}`}</Typography>
      </CardContent>
    </Card>
  )
}

export default DDCard
