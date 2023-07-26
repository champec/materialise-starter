// useChangedDataNotifier.js

import { useState, useEffect } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { useOrgAuth } from './useOrgAuth'

export function useChangedDataNotifier(rowIds, table, onDataChanged) {
  const { userMadeChange } = useOrgAuth()

  console.log('component mounted change hook')
  useEffect(() => {
    const channel = supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: table }, handleChange)
      .subscribe()

    function handleChange(payload) {
      console.log({ userMadeChange })
      if (userMadeChange) {
        return
      }
      if (rowIds.includes(payload.new.id)) {
        onDataChanged(true)
      }
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rowIds, table, onDataChanged])
}
