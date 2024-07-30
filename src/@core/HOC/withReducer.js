import React, { useState, useEffect } from 'react'
import { injectReducer } from 'src/store'

const withReducer = (key, reducer) => WrappedComponent => {
  return props => {
    const [isReducerReady, setIsReducerReady] = useState(false)

    useEffect(() => {
      const addReducer = async () => {
        if (typeof key === 'object') {
          await injectReducer(key) // Multiple reducers
        } else {
          await injectReducer(key, reducer) // Single reducer
        }
        setIsReducerReady(true)
      }

      addReducer()
    }, [])

    if (!isReducerReady) {
      return <div>Loading...</div> // Or any loading component
    }

    return <WrappedComponent {...props} />
  }
}

export default withReducer
