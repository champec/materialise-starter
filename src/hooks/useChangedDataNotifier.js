// useChangedDataNotifier.js

import { useState, useEffect } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'

export function useChangedDataNotifier(rowIds) {
  const [dataChanged, setDataChanged] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('*')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, handleChange)
      .subscribe()

    function handleChange(change) {
      if (rowIds.includes(change.new.id)) {
        setDataChanged(true)
      }
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rowIds])

  return dataChanged
}
