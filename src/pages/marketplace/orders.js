import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import OrderTable from './OrderTable'
import OrderDetails from './OrderDetails'
import OrderInvoice from './OrderInvoice'
import { supabase } from 'src/configs/supabase'
import { useSelector } from 'react-redux'

import { fetchOrderData, fetchOrderDetails, fetchOrderTasks } from '../../@core/utils/supabase/storeApis'

function OrderPage() {
  const router = useRouter()
  const { orderId, view } = router.query
  const [orderData, setOrderData] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [currentOrderTasks, setCurrentOrderTasks] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const organisationId = useSelector(state => state.organisation.organisation.id)

  console.log('orderId', orderId)

  // const fetchOrderData = async id => {
  //   try {
  //     // Fetch order data from Supabase
  //     console.log('fetching orders begins')
  //     const { data, error } = await supabase
  //       .from('orders')
  //       .select(
  //         `
  //         id,
  //         order_status,
  //         quantity,
  //         order_date,
  //         buyer_id(organisation_name, id),
  //         seller_id(organisation_name, id),
  //         items(name)
  //       `
  //       )
  //       .or(`buyer_id.eq.${id},seller_id.eq.${id}`)

  //     console.log('fetching orders begins')

  //     if (error) {
  //       console.error('Error fetching order data:', error)
  //       return [] // Return an empty array or handle the error as needed
  //     }

  //     // Set the fetched order data to the state
  //     console.log('fetchOrderData', data)
  //     setOrders(data)
  //     return data
  //   } catch (error) {
  //     console.error('Error fetching order data:', error)
  //     return [] // Return an empty array or handle the error as needed
  //   }
  // }

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('shop_order_items')
      .select(
        `
                id,
                order_status,
                quantity,
                order_date,
                buyer_id(organisation_name, id),
                seller_id(organisation_name, id),
                product_id(name),
                job_pipeline(order_status)
              `
      )
      .or(`buyer_id.eq.${organisationId},seller_id.eq.${organisationId}`)
    if (error) {
      console.log(error)
      setLoading(false)
      return {
        notFound: true
      }
    }

    console.log('fetchInvoices', data)
    setOrders(data)
  }

  useEffect(() => {
    if (organisationId) {
      fetchInvoices()
    }
  }, [organisationId])

  useEffect(() => {
    if (orderId && view === 'details') {
      fetchOrderDetails(orderId)
        .then(fetchedOrderDetails => {
          setOrderData(fetchedOrderDetails)
          return fetchOrderTasks(orderId)
        })
        .then(fetchedOrderTasks => {
          setCurrentOrderTasks(fetchedOrderTasks)
        })
    }
  }, [orderId])

  useEffect(() => {
    if (orderId && view === 'details') {
      setCurrentOrder(orderId)
    }
  }, [orderId, view])

  const handleOrderClick = orderId => {
    console.log('handleOrderClick', orderId)
    setCurrentOrder(orderId)
    router.push({ query: { orderId, view: 'details' } })
  }

  const handleBackClick = () => {
    setCurrentOrder(null)
    router.push({ query: { orderId: null, view: null } })
  }

  return (
    <div>
      {view === 'details' && currentOrder === orderId ? (
        <OrderDetails orderData={orderData} orderId={orderId} onBackClick={handleBackClick} tasks={currentOrderTasks} />
      ) : view === 'invoice' && currentOrder === orderId ? (
        <OrderInvoice orderData={orderData} orderId={orderId} />
      ) : (
        <OrderTable
          onOrderClick={handleOrderClick}
          setCurrentOrder={setCurrentOrder}
          orders={orders}
          orgId={organisationId}
        />
      )}
    </div>
  )
}

export default OrderPage
