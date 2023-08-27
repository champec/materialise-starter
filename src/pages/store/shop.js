import React, { useState, useEffect } from 'react'
import { supabaseOrg } from 'src/configs/supabase'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useRouter } from 'next/router'

// Import your components here
import ShopTable from 'src/views/apps/store/ShopTable'
import ProductDetails from 'src/views/apps/store/ProductDetails'
import Checkout from 'src/views/apps/store/Checkout'
import Confirmation from 'src/views/apps/store/Confirmation'
import Cart from 'src/views/apps/store/Cart'
import { useDispatch, useSelector } from 'react-redux'
import productsSlice from 'src/store/apps/shop/productsSlice'
import { setProducts } from 'src/store/apps/shop/productsSlice'

// RTK imports
import ChangeNotifier from 'src/@core/components/ChangeNotifier'
import { fetchProducts } from 'src/store/apps/shop/productsSlice'
import { fetchCart } from 'src/store/apps/shop/cartSlice'

import { set } from 'nprogress'

export const getStaticProps = async () => {
  const { data: products } = await supabaseOrg.from('shop_products').select()
  return {
    props: { products }
  }
}

const Shop = () => {
  const [view, setView] = useState('main')
  const [selectedItem, setSelectedItem] = useState(null)
  const [cart, setCart] = useState([])
  const [initialCart, setInitialCart] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [orderSummaries, setOrderSummaries] = useState([])
  const productsRTK = useSelector(state => state.productsSlice.items)
  const [loading, setLoading] = useState(true)
  const [rowIds, setRowIds] = useState(productsRTK.map(item => item.id)) // Pass in the row ids here [1, 2, 3, 4, 5, 6, 7]
  const router = useRouter()
  const supabase = supabaseOrg
  const organisationId = useOrgAuth()?.organisation?.id

  const dispatch = useDispatch()

  // useEffect(() => {
  //   dispatch(setProducts(products))
  // }, [products, dispatch])

  useEffect(() => {
    Promise.all([dispatch(fetchProducts()), dispatch(fetchCart())])
      .then(() => {
        setLoading(false)
      })
      .catch(error => {
        // handle any errors
        console.error('An error occurred:', error)
        setLoading(false)
      })
  }, [dispatch])

  // useEffect(() => {
  //   fetchCartData()
  // }, [organisationId])

  useEffect(() => {
    const handleRouteChange = url => {
      const isCartChanged = JSON.stringify(cart) !== JSON.stringify(initialCart)
      if (isCartChanged) {
        if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
          router.events.emit('routeChangeError')
          // Needed to prevent Next.js rendering the Router change.
          throw 'routeChange aborted.'
        }
      }
    }
    const handleBeforeUnload = e => {
      const isCartChanged = JSON.stringify(cart) !== JSON.stringify(initialCart)
      if (isCartChanged) {
        e.preventDefault()
        e.returnValue = '' // This is required for the event to take effect.
      }
    }

    router.events.on('routeChangeStart', handleRouteChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup function
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      window.addEventListener('beforeunload', handleBeforeUnload)
    }
  }, [cart, initialCart, router.events])

  const resetCart = async () => {
    const { error } = await supabase.from('carts').upsert(
      {
        pharmacy_id: organisationId,
        items: [], // Empty array
        last_modified: new Date()
      },
      {
        onConflict: 'pharmacy_id'
      }
    )

    if (error) console.log('Error resetting cart:', error)

    setCart([])
    setInitialCart([])
  }

  const sendOrder = async () => {
    setIsSending(true)

    let newOrderSummaries = []

    for (const item of cart) {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            item_id: item.id,
            quantity: item.quantity,
            seller_id: item.pharmacy_id,
            order_date: new Date(),
            order_status: 'pending',
            buyer_id: organisationId // replace with actual buyer id
            // include other fields if necessary
          }
        ])
        .select('*')

      if (error) console.log('Error creating order:', error)

      const order = data[0] // Get the created order
      newOrderSummaries.push({
        id: order.id,
        product: item.name, // item name from cart
        seller: item.pharmacy_id, // seller name from cart
        quantity: order.quantity
        // add any other details you want to display in the confirmation view
      })
    }

    setOrderSummaries(newOrderSummaries)
    await resetCart()
    setIsSending(false)
    handleConfirmation() // Navigate to the confirmation view.
  }

  const fetchCartData = async () => {
    const { data, error } = await supabase.from('carts').select('*').eq('pharmacy_id', organisationId).single()

    if (data) {
      setCart(data.items)
      setInitialCart(data.items)
    }
  }

  const isCartChanged = JSON.stringify(cart) !== JSON.stringify(initialCart) // Compare cart and initialCart

  const updateCartInDb = async () => {
    const { error } = await supabase.from('carts').upsert(
      {
        pharmacy_id: organisationId,
        items: cart,
        last_modified: new Date()
      },
      {
        onConflict: 'pharmacy_id'
      }
    )

    if (error) console.log('Error updating cart:', error)
  }

  const handleViewItemDetails = item => {
    setSelectedItem(item)
    setView('details')
  }

  const handleViewCheckout = () => {
    setView('checkout')
  }

  const handleConfirmation = () => {
    setView('confirmation')
  }

  const handleCartClick = () => {
    setView('cart')
  }

  const handleShopClick = () => {
    setView('main')
  }

  const handleRefresh = () => {
    dispatch(fetchProducts()) // Pass in the correct page number
  }

  const handleSaveCart = async () => {
    setIsSaving(true) // Start save operation
    await updateCartInDb()
    setIsSaving(false) // End save operation
    setInitialCart(cart) // Set new initial cart state
  }

  useEffect(() => {
    // handle side effects here
  }, [view, selectedItem])

  if (loading) return <div>Loading...</div>
  return (
    <div>
      {view === 'main' && (
        <ShopTable
          viewItemDetails={handleViewItemDetails}
          handleCartClick={handleCartClick}
          cart={cart}
          setCart={setCart}
          handleSaveCart={handleSaveCart}
          isCartChanged={isCartChanged}
          isSaving={isSaving}
          products={productsRTK}
        />
      )}
      {view === 'details' && <ProductDetails cart={cart} viewCheckout={handleViewCheckout} />}
      {view === 'checkout' && <Checkout item={selectedItem} viewConfirmation={handleConfirmation} />}
      {view === 'cart' && (
        <Cart handleShopClick={handleShopClick} cart={cart} sendOrder={sendOrder} isSending={isSending} />
      )}
      {view === 'confirmation' && (
        <Confirmation item={selectedItem} handleShopClick={handleShopClick} orderSummaries={orderSummaries} />
      )}
      <ChangeNotifier rowIds={rowIds} fetchAction={() => handleRefresh()} table='shop_products' />
    </div>
  )
}

export default Shop
