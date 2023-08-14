// checkoutSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Thunk for handling the checkout process
export const handleCheckout = createAsyncThunk('checkout/process', async (_, thunkAPI) => {
  const { getState } = thunkAPI
  const cartItems = getState().cart.items

  try {
    // Create an entry in the shop_orders table
    const orderResponse = await supabase.from('shop_orders').insert([
      {
        org_id: getState().organisation.organisation.id,
        total_price: cartItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)
      }
    ])

    const order = orderResponse.data[0]

    // Create entries in the shop_order_items table for each product
    const orderItemsPayload = cartItems.map(item => ({
      order_id: order.order_id,
      product_id: item.id,
      seller_org_id: item.pharmacy_id,
      quantity: item.quantity,
      price_at_time_of_purchase: item.unit_price,
      shipping_status: 'Pending'
    }))

    const orderItemsResponse = await supabase.from('shop_order_items').insert(orderItemsPayload)

    // Notifications creation logic...

    return { order, orderItems: orderItemsResponse.data }
  } catch (error) {
    throw Error('Checkout failed')
  }
})

export const fetchOrders = createAsyncThunk('checkout/fetchOrders', async (_, thunkAPI) => {
  const org_id = thunkAPI.getState().organisation.organisation.id
  const response = await supabase.from('shop_orders').select('*').eq('org_id', org_id)
  return response.data
})

export const fetchOrderItems = createAsyncThunk('checkout/fetchOrderItems', async orderId => {
  const { data, error } = await supabase
    .from('shop_order_items')
    .select(
      `
        product_id,
        quantity,
        unit_price,
        shop_products (title)
      `
    )
    .eq('order_id', orderId)

  if (error) {
    console.log(error)
    throw new Error('Failed to fetch order items')
  }

  return data
})

export const fetchFullOrderDetails = createAsyncThunk('checkout/fetchFullOrderDetails', async (orderId, thunkAPI) => {
  const { data, error } = await supabase
    .from('shop_order_items')
    .select(
      `
        product_id,
        quantity,
        unit_price,
        shop_products (
          *,
          organisations (
            *,
            pharmacies (
              *
            )
          )
        )
      `
    )
    .eq('order_id', orderId)

  if (error) {
    console.log(error)
    throw new Error('Failed to fetch order details')
  }

  return data
})

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {
    orders: [], // Array of orders
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(handleCheckout.pending, state => {
        state.status = 'loading'
      })
      .addCase(handleCheckout.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.orders.push({
          order: action.payload.order,
          orderItems: action.payload.orderItems,
          status: 'Pending'
        })
      })
      .addCase(handleCheckout.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      // Fetch Orders Thunk
      .addCase(fetchOrders.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      // Fetch Order Items Thunk
      .addCase(fetchOrderItems.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchOrderItems.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const foundOrder = state.orders.find(order => order.order.order_id === action.meta.arg)
        if (foundOrder) {
          foundOrder.orderItems = action.payload
        }
      })
      .addCase(fetchOrderItems.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      // Fetch Full Order Details Thunk
      .addCase(fetchFullOrderDetails.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchFullOrderDetails.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const foundOrder = state.orders.find(order => order.order.order_id === action.meta.arg)
        if (foundOrder) {
          foundOrder.fullDetails = action.payload
        }
      })
      .addCase(fetchFullOrderDetails.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export default checkoutSlice.reducer
