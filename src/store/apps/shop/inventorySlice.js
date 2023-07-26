// features/inventory/inventorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg } from 'src/configs/supabase'

const initialState = {
  items: [],
  currentPage: 1,
  pageSize: 7,
  sortColumn: 'name',
  sort: 'asc',
  searchValue: '',
  status: 'idle',
  error: null,
  total: 0
}

export const fetchInventory = createAsyncThunk('inventory/fetchInventory', async (page, thunkAPI) => {
  const { pageSize, sortColumn, sort, searchValue } = thunkAPI.getState().inventorySlice

  console.log('fetchInventory')

  const query = supabaseOrg
    .from('shop_products')
    .select('*', { count: 'exact' })
    .ilike(sortColumn, `%${searchValue}%`)
    .order(sortColumn, { ascending: sort === 'asc' })

  const { data, error, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) {
    throw Error(error)
  }
  console.log(data, count)
  return { data, total: count }
})

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Add reducers if needed
    setInventory(state, action) {
      state.items = action.payload.items
      state.total = action.payload.total
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchInventory.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data
        state.total = action.payload.total
        // Extract rowIds from the items

        console.log(action.payload.data, 'action.payload.data')
        state.rowIds = action.payload.data.map(item => item.id)
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export const { setInventory } = inventorySlice.actions
export default inventorySlice.reducer
