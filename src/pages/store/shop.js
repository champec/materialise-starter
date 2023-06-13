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

const Shop = () => {
  const [view, setView] = useState('main')
  const [selectedItem, setSelectedItem] = useState(null)
  const [cart, setCart] = useState([])
  const [initialCart, setInitialCart] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [orderSummaries, setOrderSummaries] = useState([])
  const router = useRouter()
  const supabase = supabaseOrg
  const organisationId = useOrgAuth()?.organisation?.id

  console.log(organisationId)

  useEffect(() => {
    fetchCartData()
  }, [organisationId])

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
      console.log('Cart data:', data)
      setCart(data.items)
      setInitialCart(data.items)
    }
  }

  const isCartChanged = JSON.stringify(cart) !== JSON.stringify(initialCart) // Compare cart and initialCart
  console.log({ isCartChanged })

  // useEffect(() => {
  //   const updateSubscription = supabase
  //     .channel('any')
  //     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'carts' }, payload => {
  //       console.log('Update received!', payload)
  //       setCart(payload.new.items)
  //     })
  //     .subscribe()

  //   const insertSubscription = supabase
  //     .channel('any')
  //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'carts' }, payload => {
  //       console.log('Insert received!', payload)
  //       setCart(payload.new.items)
  //     })
  //     .subscribe()

  //   return () => {
  //     supabase.removeChannel(updateSubscription)
  //     supabase.removeChannel(insertSubscription)
  //   }
  // }, [])

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

  const handleSaveCart = async () => {
    setIsSaving(true) // Start save operation
    await updateCartInDb()
    setIsSaving(false) // End save operation
    setInitialCart(cart) // Set new initial cart state
  }

  useEffect(() => {
    // handle side effects here
  }, [view, selectedItem])
  console.log({ cart })
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
    </div>
  )
}

export default Shop
