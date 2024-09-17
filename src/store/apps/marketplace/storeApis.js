import { supabaseOrg } from 'src/configs/supabase'

const supabase = supabaseOrg

const fetchOrderDetails = async orderId => {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
           *,
            buyer_id(organisation_name, id),
            seller_id(organisation_name, id),
            items(*),
            job_pipeline(*)
          `
    )
    .eq('id', orderId)
    .single()
  if (error) {
    console.error('Error fetching order details:', error)
  }
  if (data) return data
  // setOrderData(data)
}

const fetchOrderTasks = async orderId => {
  const { data, error } = await supabase.from('tasks').select(`*`).eq('entity_id', orderId)
  if (error) {
    console.error('Error fetching order tasks:', error)
  }
  if (data) return data
  // setCurrentOrderTasks(data)
}

const fetchOrderData = async id => {
  try {
    // Fetch order data from Supabase
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
          id,
          order_status,
          quantity,
          order_date,
          buyer_id(organisation_name, id),
          seller_id(organisation_name, id),
          items(name)
        `
      )
      .or(`buyer_id.eq.${id},seller_id.eq.${id}`)

    if (error) {
      console.error('Error fetching order data:', error)
      return [] // Return an empty array or handle the error as needed
    }

    // Set the fetched order data to the state
    return data
  } catch (error) {
    console.error('Error fetching order data:', error)
    return [] // Return an empty array or handle the error as needed
  }
}

const fetchInvoice = async invoiceId => {
  console.log('fetch invoice for', invoiceId)
  const { data, error } = await supabase.from('invoice').select('*').eq('id', invoiceId).single()

  if (error) {
    console.log(error)
  }
  if (data) {
    return data
  }
}

export { fetchOrderData, fetchOrderTasks, fetchOrderDetails, fetchInvoice }
