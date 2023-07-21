// ordersSlice.js

import { createSlice } from '@reduxjs/toolkit'

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: []
  },
  reducers: {
    addOrder(state, action) {
      state.items.push(action.payload)
    },
    updateOrderStatus(state, action) {
      const { id, status } = action.payload
      const order = state.items.find(o => o.id === id)
      order.status = status
    }
  }
})

export const { addOrder, updateOrderStatus } = ordersSlice.actions
export default ordersSlice.reducer
