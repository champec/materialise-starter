// productsSlice.js

import { createSlice } from '@reduxjs/toolkit'

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    filters: {},
    searchQuery: ''
  },
  reducers: {
    setProducts(state, action) {
      state.items = action.payload
    },
    setProductFilters(state, action) {
      state.filters = action.payload
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload
    }
  }
})

export const { setProducts, setProductFilters, setSearchQuery } = productsSlice.actions
export default productsSlice.reducer
