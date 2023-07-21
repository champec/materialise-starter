// productsSlice.js

import { createSlice } from '@reduxjs/toolkit'

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: []
  },
  reducers: {
    updateProduct(state, action) {
      const { id, ...updates } = action.payload
      const product = state.items.find(item => item.id === id)
      Object.assign(product, updates)
    }
  }
})

export const { updateProduct, setProducts } = productsSlice.actions
export default productsSlice.reducer
