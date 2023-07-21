// ChangeNotifier.js

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useChangedDataNotifier } from 'src/hooks/useChangedDataNotifier'

import Snackbar from '@mui/material/Snackbar'

function ChangeNotifier({ rowIds, fetchAction }) {
  const dispatch = useDispatch()
  const dataChanged = useChangedDataNotifier(rowIds)

  useEffect(() => {
    if (dataChanged) {
      dispatch(fetchAction(rowIds))
    }
  }, [dataChanged, rowIds, fetchAction, dispatch])

  if (dataChanged) {
    return (
      <Snackbar
        open={true}
        message='Data changed, please reload'
        action={<Button onClick={() => dispatch(fetchAction())}>Reload</Button>}
      />
    )
  }

  return null
}

export default ChangeNotifier
