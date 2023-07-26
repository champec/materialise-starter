// productsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg } from 'src/configs/supabase'

export const fetchProducts = createAsyncThunk('productsSlice/fetchProducts', async () => {
  const { data: products } = await supabaseOrg.from('shop_products').select('*')
  return products
})

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    totalCount: 0,
    page: 0,
    pageSize: 8,
    sort: null,
    searchTerm: '',
    filters: {},
    status: 'idle',
    error: null
  },
  reducers: {
    updateProduct(state, action) {
      const { id, ...updates } = action.payload
      const product = state.items.find(item => item.id === id)
      Object.assign(product, updates)
    },
    setProducts(state, action) {
      state.items = action.payload
    },
    setFilters(state, action) {
      state.filters = action.payload
    },
    setSort(state, action) {
      state.sort = action.payload
    },
    setPage(state, action) {
      state.page = action.payload
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export const selectSortedProducts = state => {
  let items = state.items

  // Sort logic
  if (state.sort) {
    items = items.sort((a, b) => {
      // Sort implementation
    })
  }

  return items
}

export const selectFilteredProducts = state => {
  let items = state.items

  // Filter logic
  if (state.filters) {
    items = items.filter(item => {
      // Filter implementation
    })
  }

  return items
}

export const selectPaginatedProducts = state => {
  // Pagination logic
  return items.slice(state.page * state.pageSize, (state.page + 1) * state.pageSize)
}

export const { updateProduct, setProducts, setFilters, setSort, setPage, setSearchTerm } = productsSlice.actions
export default productsSlice.reducer
