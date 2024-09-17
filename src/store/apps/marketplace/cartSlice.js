import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { remove } from 'nprogress'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { v4 } from 'uuid'

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, newQuantity, cartItem }, thunkAPI) => {
    console.log('updateCartItemQuantity', productId, newQuantity)
    try {
      const state = thunkAPI.getState()

      if (!cartItem) throw new Error('Product not found in cart')

      // Check against stock
      const product = state.productsSlice.items.find(item => item.id === productId)
      if (newQuantity > product.stock || newQuantity < 0) throw new Error('Invalid quantity update, not enough stock')

      // Optimistically update
      thunkAPI.dispatch(optimisticUpdateQuantity({ productId, newQuantity }))

      if (newQuantity === 0) {
        // Delete from cart if quantity is zero
        thunkAPI.dispatch(removeCartItem({ productId, cartItemId: cartItem.id }))
      } else {
        // Update the quantity in the database
        await supabase.from('shop_cart_items').update({ quantity: newQuantity }).eq('id', cartItem.id)
      }

      return { productId, newQuantity }
    } catch (error) {
      console.error('Error in updateCartItemQuantity:', error)
      throw error
    }
  }
)

const fetchOrCreateCart = async orgId => {
  const { data: cart, error } = await supabase
    .from('shop_cart')
    .select('*')
    .eq('organisation_id', orgId)
    .select('*')
    .maybeSingle()

  if (!cart) {
    const { data: newCart } = await supabase
      .from('shop_cart')
      .insert([{ organisation_id: orgId }])
      .select('*')
    console.log('newCart', newCart)
    return newCart[0].id
  }

  return cart.id
}

export const addCartItem = createAsyncThunk('cart/addCartItem', async (product, thunkAPI) => {
  const itemId = v4() // Generate a UUID

  // Construct an item to match the desired format
  const newItem = {
    id: itemId,
    quantity: 1,
    product_id: product.id,
    unit_price: product.price,
    shop_products: product
  }

  // Optimistically add the constructed item
  thunkAPI.dispatch(optimisticAddToCart(newItem))

  const state = thunkAPI.getState()
  const orgId = state.organisation.organisation.id
  let cartId = state.cartSlice.cartId

  // Insert to the database
  const { data } = await supabase
    .from('shop_cart_items')
    .insert([{ id: itemId, cart_id: cartId, product_id: product.id, unit_price: product.price, quantity: 1 }])
    .select('*')

  return data[0]
})

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async ({ productId, cartItemId }, thunkAPI) => {
  console.log('REMOVING CART IT WITH', productId, cartItemId)
  thunkAPI.dispatch(optimisticRemoveFromCart(cartItemId))
  const { error } = await supabase.from('shop_cart_items').delete().eq('id', cartItemId)
  if (error) {
    console.log('Error deleting cart item:', error)
    throw error // throw the error to reject the thunk
  }

  return cartItemId // return the cartItemId or whatever you intended
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

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  const state = thunkAPI.getState()
  const orgId = state.organisation.organisation.id

  // Get cart ID
  const cartId = await fetchOrCreateCart(orgId)

  // Fetch the items of the cart
  const { data, error } = await supabase
    .from('shop_cart_items')
    .select('id, product_id, quantity, shop_products(*)')
    .eq('cart_id', cartId)

  return { cartId, items: data }
})

export const clearCart = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState()
    const cartId = state.cartSlice.cartId

    if (cartId) {
      // Delete all cart items associated with the current cartId in the backend
      const { error } = await supabase.from('shop_cart_items').delete().eq('cart_id', cartId)
      if (error) {
        console.log('Error clearing cart:', error)
        throw error
      }
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
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
      console.log('optimisticAddToCart reducer', action.payload)
      state.items.push(action.payload)
    },
    optimisticRemoveFromCart: (state, action) => {
      console.log('optimisticRemoveFromCart reducer', action.payload)
      const items = state.items.filter(item => item.id !== action.payload)
      console.log(items)
      state.items = items
    },
    optimisticUpdateQuantity: (state, action) => {
      const cartItem = state.items.find(item => item.product_id === action.payload.productId)
      if (cartItem) {
        cartItem.quantity = action.payload.newQuantity
      }
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
      .addCase(fetchFullCartContents.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        // Update the quantity in the cart
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        // Rollback the optimistic update
        const cartItem = state.items.find(item => item.product_id === action.meta.arg.productId)
        if (cartItem) {
          cartItem.quantity -= action.meta.arg.quantityChange
        }
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartId = action.payload.cartId
        state.items = action.payload.items
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(clearCart.fulfilled, state => {
        // Reset the cart items
        state.items = []
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.error.message
      })
  }
})

export const { optimisticAddToCart, optimisticRemoveFromCart, optimisticUpdateQuantity } = cartSlice.actions
export default cartSlice.reducer
