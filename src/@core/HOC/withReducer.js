import { injectReducer } from 'src/store'

const withReducer = (key, reducer) => WrappedComponent => {
  return props => {
    // Check if the first argument is an object (multiple reducers)
    // or a string (single reducer), and call injectReducer accordingly
    if (typeof key === 'object') {
      injectReducer(key) // Multiple reducers
    } else {
      injectReducer(key, reducer) // Single reducer
    }

    return <WrappedComponent {...props} />
  }
}

export default withReducer
