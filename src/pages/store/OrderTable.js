import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

function OrdersTable({ orders, onOrderClick, orgId }) {
  const isCurrentUserBuyer = order => order.buyer_id?.id === orgId
  const isCurrentUserSeller = order => order.seller_id?.id === orgId

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Buyer/Seller</TableCell>
            <TableCell>Order Date</TableCell>
            <TableCell>Item</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell>
                {isCurrentUserBuyer(order) ? 'Buying' : isCurrentUserSeller(order) ? 'Selling' : ''}
              </TableCell>
              <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
              <TableCell>{order.items?.name}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{order.order_status}</TableCell>
              <TableCell>{order.seller_id?.organisation_name}</TableCell>
              <TableCell>
                <button onClick={() => onOrderClick(order.id)}>View Details</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default OrdersTable
