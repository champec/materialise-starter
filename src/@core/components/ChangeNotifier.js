// ChangeNotifier.js

import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useChangedDataNotifier } from 'src/hooks/useChangedDataNotifier'

import Snackbar from '@mui/material/Snackbar'
import Button from '@mui/material/Button' // Ensure Button is imported

function ChangeNotifier({ rowIds, fetchAction, table }) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()

  const onDataChanged = useCallback(changed => {
    setOpen(changed)
  }, [])

  const dataChanged = useChangedDataNotifier(rowIds, table, onDataChanged)

  useEffect(() => {
    if (dataChanged) {
      dispatch(fetchAction(rowIds))
    }
  }, [dataChanged, rowIds, fetchAction, dispatch])

  const handleClose = () => setOpen(false)

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      message='Data changed, please reload'
      action={
        <Button
          onClick={() => {
            fetchAction()
            handleClose()
          }}
        >
          Reload
        </Button>
      }
    />
  )
}

export default ChangeNotifier
