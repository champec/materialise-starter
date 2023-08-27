import React from 'react'
import Header from './Header'
import { useRouter } from 'next/router'

// ** RTK imports

import { useSelector, useDispatch } from 'react-redux'
import { fetchCart, removeCartItem, updateCartItemQuantity } from 'src/store/apps/shop/cartSlice'
import { handleCheckout } from 'src/store/apps/shop/checkoutSlice'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { CircularProgress } from '@mui/material'

function Cart({ handleShopClick, cart, isSending, sendOrder }) {
  const dispatch = useDispatch()
  const cartItems = useSelector(state => state.cart.items)
  const checkoutStatus = useSelector(state => state.checkout.status)
  const checkoutError = useSelector(state => state.checkout.error)
  const status = useSelector(state => state.cart.status)

  const router = useRouter()

  const TAX_RATE = 0.07

  const ccyFormat = num => {
    return `${num.toFixed(2)}`
  }

  const priceRow = (qty, unit) => {
    return qty * unit
  }

  const createRow = (desc, qty, unit) => {
    const price = priceRow(qty, unit)

    return { desc, qty, unit, price }
  }

  const subtotal = items => {
    return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0)
  }

  const rows = cartItems.map(item => createRow(item.shop_products.name, item.quantity, item.shop_products.price))
  const invoiceSubtotal = subtotal(rows)
  const invoiceTaxes = TAX_RATE * invoiceSubtotal
  const invoiceTotal = invoiceTaxes + invoiceSubtotal

  const handleSendOrder = async () => {
    const actionResult = await dispatch(handleCheckout())
    console.log('actionResult', actionResult.payload)
    router.push(`/store/confirmation?orderId=${actionResult.payload.order.id}`)
  }

  return (
    <TableContainer component={Paper}>
      <Header handleShopClick={handleShopClick} />
      <Table sx={{ minWidth: 700 }} aria-label='spanning table'>
        <TableHead>
          <TableRow>
            <TableCell align='center' colSpan={3}>
              Details
            </TableCell>
            <TableCell align='right'>Price</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Desc</TableCell>
            <TableCell align='right'>Qty.</TableCell>
            <TableCell align='right'>Unit</TableCell>
            <TableCell align='right'>Sum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.desc}>
              <TableCell>{row.desc}</TableCell>
              <TableCell align='right'>{row.qty}</TableCell>
              <TableCell align='right'>{row.unit}</TableCell>
              <TableCell align='right'>{ccyFormat(row.price)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell rowSpan={3} />
            <TableCell colSpan={2}>Subtotal</TableCell>
            <TableCell align='right'>{ccyFormat(invoiceSubtotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tax</TableCell>
            <TableCell align='right'>{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
            <TableCell align='right'>{ccyFormat(invoiceTaxes)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell align='right'>{ccyFormat(invoiceTotal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          onClick={handleSendOrder}
          color='primary'
          variant='contained'
          disabled={isSending}
          sx={{ marginRight: 1 }} // add margin to the right of the button
        >
          {isSending ? 'Sending...' : 'Send Order'}
        </Button>
        {checkoutStatus === 'loading' && <p>Processing order...</p>}
        {checkoutStatus === 'succeeded' && <p>Order placed successfully!</p>}
        {checkoutStatus === 'failed' && <p>{checkoutError}</p>}
      </Box>
    </TableContainer>
  )
}

export default Cart
