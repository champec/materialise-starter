import React from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

//* time line imports
import TimelineCenter from './timelines/BuyandSell'

function OrderDetails({ onBackClick, orderData, tasks }) {
  const router = useRouter()
  console.log({ orderData, tasks })
  if (!orderData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div>
      <AppBar position='static'>
        <Toolbar>
          <Button color='inherit' onClick={onBackClick}>
            <Icon icon='mdi:arrow-left' />
          </Button>
          <Typography variant='h6' style={{ flexGrow: 1 }}>
            Order Details
          </Typography>
        </Toolbar>
      </AppBar>
      <Box p={2}>
        <Card>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              {orderData.order_status}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Order Date: {new Date(orderData.order_date).toLocaleDateString()}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Buyer: {orderData.buyer_id.organisation_name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Seller: {orderData.seller_id.organisation_name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Item: {orderData.items?.name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Job Pipeline: {orderData.job_pipeline?.order_status}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Tracking Number: {orderData.tracking_number}
            </Typography>
          </CardContent>
        </Card>
        <TimelineCenter orderData={orderData} tasks={tasks} />
      </Box>
    </div>
  )
}

export default OrderDetails
