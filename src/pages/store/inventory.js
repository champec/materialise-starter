import React from 'react'
import InventoryTable from 'src/views/apps/store/ItemsTable'
import { supabaseOrg } from 'src/configs/supabase'

function Inventory({ initialData, initialTotal }) {
  return (
    <div>
      <InventoryTable initialData={initialData} initialTotal={initialTotal} />
    </div>
  )
}

export default Inventory

export async function getServerSideProps(context) {
  const supabase = supabaseOrg

  const page = 0
  const pageSize = 7
  const sort = 'asc'
  const sortColumn = 'name'
  const searchValue = ''

  const query = supabase
    .from('items')
    .select('*', { count: 'exact' })
    .ilike(sortColumn, `%${searchValue}%`)
    .order(sortColumn, { ascending: sort === 'asc' })

  const { data, error, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1)
  console.log('hello', data)
  if (error) {
    console.log(error)
  }

  return {
    props: {
      initialData: data,
      initialTotal: count
    }
  }
}
