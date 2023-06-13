import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'

function QuantityControl({ item, cartItem, onUpdate, onRemove }) {
  const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 0)

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity)
    }
  }, [cartItem])

  const handleIncrement = () => {
    if (quantity < item.stock) {
      const newQuantity = quantity + 1
      setQuantity(newQuantity)
      onUpdate(item, newQuantity)
    }
  }

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1
      setQuantity(newQuantity)

      if (newQuantity === 0) {
        onRemove(item)
      } else {
        onUpdate(item, newQuantity)
      }
    }
  }

  const handleChange = event => {
    const newQuantity = Number(event.target.value)
    if (newQuantity >= 0 && newQuantity <= item.quantity) {
      setQuantity(newQuantity)
      onUpdate(item, newQuantity)
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
