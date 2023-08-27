// checkoutSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { clearCart } from './cartSlice'

// Thunk for handling the checkout process
export const handleCheckout = createAsyncThunk('checkout/process', async (_, thunkAPI) => {
  const { getState } = thunkAPI
  const cartItems = getState().cart.items
  const buyer_profile = getState().organisation.organisation

  console.log({ buyer_profile })

  console.log('checkout cartitems', cartItems)

  try {
    // Create an entry in the shop_orders table
    const orderResponse = await supabase
      .from('shop_orders')
      .insert([
        {
          organisation_id: getState().organisation.organisation.id,
          total_price: cartItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)
        }
      ])
      .select('id')

    if (orderResponse.error) {
      console.log(orderResponse.error)
      throw Error('Failed to create order', orderResponse.error.message)
    }

    const order = orderResponse.data[0]

    // Create entries in the shop_order_items table for each product
    const orderItemsPayload = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      seller_id: item.shop_products.pharmacy_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      buyer_id: getState().organisation.organisation.id,
      transaction_type: 1
      // shipping_status: 'Pending'
    }))

    const orderItemsResponse = await supabase.from('shop_order_items').insert(orderItemsPayload)

    // Notifications creation logic...
    if (orderItemsResponse.error) {
      console.log(orderItemsResponse.error)
      throw Error('Failed to create order items', orderItemsResponse.error.message)
    }
    //! crearte invoice and invoice items for each seller

    // Step 1: Retrieve unique seller IDs
    const uniqueSellerIds = [...new Set(cartItems.map(item => item.shop_products.pharmacy_id))]

    // Step 2: Fetch all seller profiles at once (adjust based on your DB structure)
    const { data: sellerProfiles, error } = await supabase.rpc('fetch_seller_profiles', { ids: uniqueSellerIds })

    if (error) {
      console.error('Error fetching seller profiles:', error)
      throw error
    }

    console.log('RPC RETURNED', sellerProfiles)

    // For each unique seller, create an invoice
    for (let sellerId of uniqueSellerIds) {
      const seller_profile = sellerProfiles.find(profile => profile.id === sellerId)

      if (!seller_profile) {
        console.error(`No profile found for sellerId: ${sellerId}`)
        continue // Skip this iteration
      }

      const itemsForThisSeller = cartItems.filter(item => item.shop_products.pharmacy_id === sellerId)

      // Calculate total for this seller
      const invoiceTotalForSeller = itemsForThisSeller.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)

      // Create invoice for this seller
      const invoiceResponse = await supabase
        .from('invoice')
        .insert([
          {
            invoicetype: 'Receivable',
            invoicestatus: 'Draft',
            invoicedate: new Date(),
            companyreceivablename: seller_profile.organisation_name,
            companyreceivableaddress: seller_profile.address,
            companyreceivablecontactnumber: seller_profile.phone_number,
            companyreceivableemail: seller_profile.email,
            dateissued: new Date(),
            datedue: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Adjusted for one month
            customername: buyer_profile.organisation_name,
            customeraddress: buyer_profile.pharmacies.address1,
            customercontactnumber: buyer_profile.pharmacies.contact,
            customeremailaddress: buyer_profile.pharmacies.email,
            totalamount: invoiceTotalForSeller,
            bankname: 'Natwest',
            accountnumber: '12345678',
            sortcode: '45-45-45',
            hmrccompanynumber: 'HMRC_company_number',
            discount: 0,
            tax: 0,
            subtotal: invoiceTotalForSeller,
            salespersonname: 'sales person',
            salespersonmessage: 'We wish the best with your business, sales person message here',
            salespersoncontactnumber: '0121 5255 378',
            thankyounote: 'Thank you for your business!',
            pharmexmessage: 'PharmEx Message Here'
          }
        ])
        .select('id')

      if (invoiceResponse.error) {
        console.log(invoiceResponse.error)
        throw Error('Failed to create invoice', invoiceResponse.error.message)
      }

      const invoice = invoiceResponse.data[0]

      // Create entries in the invoice_items table for each product for this seller
      const invoiceItemsPayload = itemsForThisSeller.map(item => {
        const item_info = item.shop_products // Getting product-specific info for each item
        return {
          invoice_id: invoice.id,
          product_name: item_info.name, // Changed from item.title for clarity
          product_description: item_info.description,
          quantity: item.quantity,
          unit_price: item_info.price,
          subtotal: item_info.price * item.quantity
        }
      })

      const invoiceItemsResponse = await supabase.from('invoice_items').insert(invoiceItemsPayload)

      if (invoiceItemsResponse.error) {
        console.log(invoiceItemsResponse.error)
        throw Error('Failed to create invoice items', invoiceItemsResponse.error.message)
      }
    }
    thunkAPI.dispatch(clearCart())
    return { order, orderItems: orderItemsResponse.data }
  } catch (error) {
    console.log(error.message)
    throw Error('Checkout failed with error: ', error.message)
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
    throw new Error('Failed to fetch order items', error.message)
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
    throw new Error('Failed to fetch order details', error.message)
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
