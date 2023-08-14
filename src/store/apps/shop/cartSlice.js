import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

const fetchOrCreateCart = async orgId => {
  const { data: cart } = await supabase.from('shop_cart').select('*').eq('organisation_id', orgId).single()

  if (!cart) {
    const { data: newCart } = await supabase.from('shop_cart').insert([{ organisation_id: orgId }])
    return newCart[0].id
  }

  return cart.id
}

export const addCartItem = createAsyncThunk('cart/addCartItem', async (product, thunkAPI) => {
  thunkAPI.dispatch(optimisticAddToCart(product))

  const state = thunkAPI.getState()
  const orgId = state.organisation.organisation.id
  let cartId = state.cart.cartId

  if (!cartId) {
    cartId = await fetchOrCreateCart(orgId)
  }

  const { data } = await supabase
    .from('shop_cart_items')
    .insert([{ shop_cart_id: cartId, product_id: product.id, quantity: 1 }])
  return data[0]
})

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (itemId, thunkAPI) => {
  thunkAPI.dispatch(optimisticRemoveFromCart(itemId))
  const orgId = thunkAPI.getState().organisation.organisation.id
  await supabase.from('shop_cart_items').delete().eq('id', itemId).eq('organisation_id', orgId)
  return itemId
})

export const fetchFullCartContents = createAsyncThunk('cart/fetchFullCartContents', async (_, thunkAPI) => {
  const state = thunkAPI.getState()
  const orgId = state.organisation.organisation.id
  let cartId = state.cart.cartId

  if (!cartId) {
    cartId = await fetchOrCreateCart(orgId)
  }

  const { data } = await supabase
    .from('shop_cart_items')
    .select('id, quantity, shop_products(*)')
    .eq('shop_cart_id', cartId)
  return data
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartId: null,
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    optimisticAddToCart: (state, action) => {
      state.items.push(action.payload)
    },
    optimisticRemoveFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload.id)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(addCartItem.fulfilled, (state, action) => {
        if (!state.cartId) {
          state.cartId = action.payload.shop_cart_id
        }
        // No need to add the item again, as it was optimistically added

        //old code below
        // if (!state.cartId) {
        //   state.cartId = action.payload.shop_cart_id
        // }
        // state.items.push(action.payload)
      })
      .addCase(addCartItem.rejected, (state, action) => {
        // Rollback the optimistic addition
        state.items = state.items.filter(item => item.id !== action.meta.arg.id)
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        // do nothing as it was optimistaclly removed
        console.log('removeCartItem.fulfilled')
        // old code below
        // state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        // Rollback the optimistic removal
        state.items.push(action.meta.arg)

        console.log('removeCartItem.rejected')

        // old code below
        // state.items.push(action.meta.arg)
      })
      .addCase(fetchFullCartContents.fulfilled, (state, action) => {
        state.items = action.payload
      })
  }
})

export default cartSlice.reducer
