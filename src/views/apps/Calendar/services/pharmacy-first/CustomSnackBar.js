import { Fragment, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

const CustomSnackbar = ({ open, setOpen, message, severity, vertical, horizontal, duration }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false)
      }, duration || 3000)

      return () => clearTimeout(timer)
    }
  }, [open, setOpen])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <Fragment>
      <Snackbar
        open={open}
        onClose={handleClose}
        TransitionProps={{ onExited: () => setOpen(false) }}
        autoHideDuration={duration || 3000}
        anchorOrigin={{ vertical: vertical || 'bottom', horizontal: horizontal || 'left' }}
        className='your-snackbar-class' // Add your class name here
      >
        <Alert
          elevation={6}
          variant='filled'
          onClose={handleClose}
          severity={severity}
          className='your-alert-class' // Add your class name here
        >
          {message}
        </Alert>
      </Snackbar>
    </Fragment>
  )
}

export default CustomSnackbar
