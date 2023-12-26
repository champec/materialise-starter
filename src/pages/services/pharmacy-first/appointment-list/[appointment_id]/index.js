import React from 'react'
import { useRouter } from 'next/router'

function index() {
  const router = useRouter()
  const { appointment_id } = router.query

  return <div>index{appointment_id}</div>
}

export default index
