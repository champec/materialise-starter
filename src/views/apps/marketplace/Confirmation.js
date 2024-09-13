import React from 'react'
import Header from './Header'
import Box from '@mui/material/Box'

function Confirmation({ handleShopClick, orderSummaries }) {
  console.log({ orderSummaries })
  return (
    <Box>
      <Header handleShopClick={handleShopClick} />
    </Box>
  )
}

export default Confirmation
