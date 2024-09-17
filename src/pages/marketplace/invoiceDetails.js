import React from 'react'
import { AppBar, Toolbar, Button, Typography, CircularProgress, Box } from '@mui/material'
import Icon from 'src/@core/components/icon'
import AppBarWithBackButton from 'src/@core/components/appwide-components/AppBarWithBackButton'
import InvoicePreview from './invoiceUtils/Preview'

function invoiceDetails({ onBackClick, invoice, id }) {
  console.log(invoice)
  if (!invoice) {
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
      <AppBarWithBackButton
        title={`Invoice ${invoice?.invoicenumber ? invoice.invoicenumber : ''} Details`}
        onBackClick={onBackClick}
      />
      {!invoice ? (
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
      ) : (
        <InvoicePreview invoice={invoice} id={id} />
      )}
    </div>
  )
}

export default invoiceDetails
