import React, { useState, useEffect } from 'react'
import InventoryTable from 'src/views/apps/store/ItemsTable'
import { supabaseOrg } from 'src/configs/supabase'
import ChangeNotifier from 'src/@core/components/ChangeNotifier'
import { fetchInventory, setInventory } from 'src/store/apps/shop/inventorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@mui/material'

function Inventory() {
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
