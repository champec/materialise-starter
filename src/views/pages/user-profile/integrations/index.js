import React from 'react'
import Link from 'next/link'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper
} from '@mui/material'

// Updated dummy data
const integrationData = [
  {
    id: 1,
    name: 'NHS Mail',
    status: 'Active',
    configureUrl: 'mypharmacy/integratemail'
  }
  // Add more integrations as needed
]

const IntegrationsTable = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant='h6' sx={{ mb: 4 }}>
        Integrations
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>Integration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Configure</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {integrationData.map(row => (
              <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component='th' scope='row'>
                  {row.name}
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                  <Link href={row.configureUrl} passHref>
                    <Button variant='contained' color='primary' component='a' target='_blank'>
                      Configure
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default IntegrationsTable
