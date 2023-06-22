import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import OrderTable from './OrderTable'
import OrderDetails from './OrderDetails'
import OrderInvoice from './OrderInvoice'
import { supabaseOrg } from 'src/configs/supabase'
import { useOrgAuth } from 'src/hooks/useOrgAuth'

import { fetchOrderData, fetchOrderDetails, fetchOrderTasks } from './storeApis'

function OrderPage() {
  const router = useRouter()
  const { orderId, view } = router.query
  const [orderData, setOrderData] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [currentOrderTasks, setCurrentOrderTasks] = useState([])
  const [orders, setOrders] = useState([])
  const supabase = supabaseOrg
  const organisationId = useOrgAuth()?.organisation?.id

  useEffect(() => {
    fetchOrderData(organisationId).then(fetchedOrders => {
      setOrders(fetchedOrders)
      console.log(fetchedOrders)
    })
  }, [])

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
