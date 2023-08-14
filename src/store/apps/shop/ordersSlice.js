import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Selectors
const selectOrganizationId = state => state.organisation.organisation.id

// Thunks
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, thunkAPI) => {
  const orgId = selectOrganizationId(thunkAPI.getState())
  const response = await supabase.from('shop_orders').select('*').eq('seller_id', orgId)
  return response.data
})

export const fetchOrderItems = createAsyncThunk('orders/fetchOrderItems', async (orderId, thunkAPI) => {
  const orgId = selectOrganizationId(thunkAPI.getState())
  const response = await supabase
    .from('shop_order_items')
    .select(
      `
    *,
    shop_products (title, unit_price)
  `
    )
    .eq('order_id', orderId)
    .eq('seller_id', orgId)
  return response.data
})

export const fetchPurchases = createAsyncThunk('orders/fetchPurchases', async (_, thunkAPI) => {
  const orgId = selectOrganizationId(thunkAPI.getState())
  const response = await supabase.from('shop_orders').select('*').eq('buyer_id', orgId)
  return response.data
})

export const fetchPurchaseItems = createAsyncThunk('orders/fetchPurchaseItems', async (orderId, thunkAPI) => {
  const orgId = selectOrganizationId(thunkAPI.getState())
  const response = await supabase
    .from('shop_order_items')
    .select(
      `
    *,
    shop_products (title, unit_price)
  `
    )
    .eq('order_id', orderId)
    .eq('buyer_id', orgId)
  return response.data
})

export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ itemId, status }) => {
  const response = await supabase.from('shop_order_items').update({ status }).eq('id', itemId)
  return { itemId, status: response.data[0].status }
})

// Slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    orderItems: [],
    purchases: [],
    purchaseItems: [],
    loading: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload
      })
      .addCase(fetchOrderItems.fulfilled, (state, action) => {
        state.orderItems = action.payload
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.purchases = action.payload
      })
      .addCase(fetchPurchaseItems.fulfilled, (state, action) => {
        state.purchaseItems = action.payload
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { itemId, status } = action.payload
        const itemToUpdate =
          state.orderItems.find(item => item.id === itemId) || state.purchaseItems.find(item => item.id === itemId)
        if (itemToUpdate) {
          itemToUpdate.status = status
        }
      })
  }
})

export default ordersSlice.reducer
