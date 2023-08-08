import React, { useState, useEffect } from 'react'
import InventoryTable from 'src/views/apps/store/ItemsTable'
import { supabaseOrg } from 'src/configs/supabase'
import ChangeNotifier from 'src/@core/components/ChangeNotifier'
import { fetchInventory, setInventory } from 'src/store/apps/shop/inventorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@mui/material'

function Inventory({ initialData, initialTotal }) {
  const { items, currentPage, pageSize, status, error } = useSelector(state => state.inventorySlice)
  const dispatch = useDispatch()

  // Fetch inventory when the component mounts
  useEffect(() => {
    dispatch(fetchInventory(currentPage))
  }, [dispatch, currentPage])

  // Function to handle refresh
  const handleRefresh = () => {
    dispatch(fetchInventory(currentPage))
  }

  return (
    <div>
      <Button onClick={() => handleRefresh()}>Refresh</Button>
      <InventoryTable page={currentPage} items={items} pageSize={pageSize} />
    </div>
  )
}

export default Inventory

export async function getStaticProps() {
  const supabase = supabaseOrg

  const page = 0
  const pageSize = 7
  const sort = 'asc'
  const sortColumn = 'name'
  const searchValue = ''

  const query = supabase
    .from('shop_products')
    .select('*', { count: 'exact' })
    .ilike(sortColumn, `%${searchValue}%`)
    .order(sortColumn, { ascending: sort === 'asc' })

  const { data, error, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) {
    console.log(error)
    return {
      notFound: true
    }
  }

  return {
    props: {
      initialData: data,
      initialTotal: count
    },
    revalidate: 60 // add revalidate key to enable ISR, value is in seconds
  }
}
