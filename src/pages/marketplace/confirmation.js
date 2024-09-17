import { useState, useEffect } from 'react' // Corrected 'use' to 'useState'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { fetchFullOrderDetails } from 'src/store/apps/shop/checkoutSlice'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import checkoutSlice from 'src/store/apps/shop/checkoutSlice'
import withReducer from 'src/@core/HOC/withReducer'

function Confirmation() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { orderId } = router.query

  const loggedInUser = useSelector(state => state.organisation.organisation.id)
  const status = useSelector(state => state.checkoutSlice.status)
  const error = useSelector(state => state.checkoutSlice.error)
  const [order, setOrder] = useState()

  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (orderId) {
      // Check if the order belongs to the logged-in user
      const checkOrderAssociation = async () => {
        const { data, error } = await supabase
          .from('shop_orders')
          .select('id')
          .eq('id', orderId)
          .eq('organisation_id', loggedInUser)

        if (error) {
          console.log(error)
          throw Error('Failed to fetch order details', error.message)
        }

        console.log({ data })

        if (data && data.length > 0) {
          setIsAuthorized(true)
          const orderDetails = await dispatch(fetchFullOrderDetails(orderId))
          setOrder(orderDetails.payload)
        } else {
          setIsAuthorized(false)
          // Optionally, handle unauthorized access here
        }
      }
      checkOrderAssociation()
    }
  }, [orderId, loggedInUser, dispatch])

  console.log(order)

  if (!isAuthorized) return <div>Unauthorized access or order not found.</div>
  if (status === 'loading' || !order) return <div>Loading...</div>
  if (status === 'failed') return <div>Error: {error}</div>
  if (!orderId) return <div>No order details available</div>

  return (
    <div>
      <h1>Order Confirmation</h1>
      <p>Order ID: {orderId}</p>
      {order.map(item => (
        <div key={item.product_id}>
          <h2>{item.shop_products.name}</h2>
          <p>Price: £{item.unit_price}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Brand: {item.shop_products.brand}</p>
          <p>Description: {item.shop_products.description}</p>
          <p>Seller: {item.shop_products.profiles.organisation_name}</p>
          {/* ... Add more details as necessary */}
        </div>
      ))}
    </div>
  )
}

// export default Confirmation
export default withReducer('checkoutSlice', checkoutSlice)(Confirmation)
