import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'

// RTK imports
import { useDispatch, useSelector } from 'react-redux'
import cartSlice, { updateCartItemQuantity } from 'src/store/apps/shop/cartSlice'

function QuantityControl({ item, cart }) {
  // Retrieve the current quantity of the item in the cart.
  const dispatch = useDispatch()
  const cartItem = cart.items.find(i => i.product_id === item.id)
  const quantity = cartItem ? cartItem.quantity : 0

  const handleIncrement = () => {
    dispatch(updateCartItemQuantity({ productId: item.id, newQuantity: quantity + 1, cartItem }))
  }

  const handleDecrement = () => {
    dispatch(updateCartItemQuantity({ productId: item.id, newQuantity: quantity - 1, cartItem }))
  }

  const handleChange = event => {
    const inputQuantity = Number(event.target.value)
    if (inputQuantity >= 0) {
      dispatch(updateCartItemQuantity({ productId: item.id, newQuantity: inputQuantity, cartItem }))
    }
  }

  return (
    <Box display='flex' alignItems='center'>
      <Button onClick={handleDecrement} size='small'>
        <Icon icon='mdi:minus' />
      </Button>
      <input value={quantity} onChange={handleChange} type='number' style={{ width: '2rem', textAlign: 'center' }} />
      <Button onClick={handleIncrement} size='small'>
        <Icon icon='mdi:plus' />
      </Button>
    </Box>
  )
}

export default QuantityControl
