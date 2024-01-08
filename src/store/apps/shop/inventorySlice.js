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
  total: 0,
  previousItem: undefined // Added to keep track of previous state for rollback
}

export const fetchInventory = createAsyncThunk('inventory/fetchInventory', async (args, thunkAPI) => {
  const { sortModel = [], searchValue = '', searchField = 'name' } = args
  const { pageSize, currentPage } = thunkAPI.getState().inventorySlice
  const userId = thunkAPI.getState().organisation.organisation.id

  // Set defaults if sortModel is not provided or empty
  const sortField = sortModel.length > 0 ? sortModel[0].field : 'name'
  const sortOrder = sortModel.length > 0 ? sortModel[0].sort === 'asc' : true

  console.log('we are sorting by', sortField, sortOrder)
  try {
    // Construct the query with sorting, searching, and pagination
    let query = supabaseOrg
      .from('shop_products')
      .select('*', { count: 'exact' })
      .eq('pharmacy_id', userId)
      .ilike(searchField, `%${searchValue}%`)
      .order(sortField, { ascending: sortOrder })

    // Execute the query for all items to get total count
    const { data, error, count } = await query.range(0, -1)
    if (error) throw error

    // Calculate the correct pagination range
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1
    const { data: paginatedData, error: paginationError } = await query.range(start, end)
    if (paginationError) throw paginationError

    console.log('fetchInventory', paginatedData)
    // Return the paginated data and total count
    return { data: paginatedData, total: count }
  } catch (error) {
    // Handle errors like network issues, etc.
    console.error('Error fetching inventory:', error)
    return thunkAPI.rejectWithValue(error.message || 'Error fetching inventory')
  }
})

export const createItem = createAsyncThunk('inventory/createItem', async (item, thunkAPI) => {
  const userId = thunkAPI.getState().organisation.organisation.id
  item.pharmacy_id = userId
  const { data, error } = await supabaseOrg.from('shop_products').insert([item]).select('*')

  if (error) {
    console.log(error)
    throw Error(error)
  }

  console.log('new product added', data)
  return data[0]
})

export const deleteItem = createAsyncThunk('inventory/deleteItem', async (id, thunkAPI) => {
  const { error } = await supabaseOrg.from('shop_products').delete().eq('id', id)
  if (error) {
    console.log(error)
    throw Error(error)
  }
  return id
})

export const editItem = createAsyncThunk('inventory/editItem', async ({ id, changes }, thunkAPI) => {
  const { data, error } = await supabaseOrg.from('shop_products').update(changes).eq('id', id).select('*')
  if (error) {
    console.log(error)
    throw Error(error)
  }

  console.log('product updated', data)
  return data[0]
})

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
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
        state.rowIds = action.payload.data.map(item => item.id)
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(createItem.pending, (state, action) => {
        // Optionally, handle optimistic update here
      })
      .addCase(editItem.pending, (state, action) => {
        state.previousItem = state.items.find(item => item.id === action.meta.arg.id)
      })
      .addCase(deleteItem.pending, (state, action) => {
        state.previousItem = state.items.find(item => item.id === action.meta.arg)
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(editItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index >= 0) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload)
        if (index >= 0) {
          state.items.splice(index, 1)
        }
      })
      .addCase(editItem.rejected, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.meta.arg.id)
        if (index >= 0) {
          state.items[index] = state.previousItem
        }
        state.previousItem = undefined
      })
      .addCase(createItem.rejected, (state, action) => {
        state.items.pop()
      })
      .addCase(deleteItem.rejected, (state, action) => {
        if (state.previousItem) {
          state.items.push(state.previousItem)
        }
        state.previousItem = undefined
      })
  }
})

export const { setInventory } = inventorySlice.actions
export default inventorySlice.reducer
