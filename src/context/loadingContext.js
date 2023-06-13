import React, { createContext, useState, useContext } from 'react'
import { CircularProgress, Snackbar, Alert } from '@mui/material'
import Slide from '@mui/material/Slide'

const TransitionUp = props => {
  return <Slide {...props} direction='up' />
}

const LoadingContext = createContext({
  loading: false,
  message: { text: '', severity: undefined },
  setLoading: () => {},
  setMessage: () => {}
})

export const useLoading = () => useContext(LoadingContext)

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', severity: undefined })

  return (
    <LoadingContext.Provider value={{ loading, message, setLoading, setMessage }}>
      {children}
      {loading && <CircularProgress />}
      <Snackbar open={loading} autoHideDuration={6000} TransitionComponent={TransitionUp}>
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </LoadingContext.Provider>
  )
}

// usage

// import { useLoading } from './LoadingContext'

// const MyComponent = () => {
//   const { setLoading, setMessage } = useLoading()

//   const handleClick = () => {
//     setLoading(true)
//     setMessage({ text: 'Loading data...', severity: 'info' })
//     // Do some async operation...
//     // After the operation is done, hide the loading indicator and snackbar:
//     setLoading(false)
//   }

//   return <button onClick={handleClick}>Load data</button>
// }
