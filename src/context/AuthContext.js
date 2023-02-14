// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios' //wont be using axios to fetch data will use supabase

// ** Config
import authConfig from 'src/configs/auth' // this has the auth endpoint and the storage keys for tokens

// ** Defaults provides default values to context if not provided init value also for type safety, can draw from default with dot notation
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider) // pass default object to AuthContext provider

const AuthProvider = ({ children }) => {
  // define auth provider that will be used to pass value down component tree
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    // this runs automatically without to login users who have already logged in
    const initAuth = async () => {
      // defines fetch function from async if it has token, then search jwt end points for login info based on stored Token
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        setLoading(true)
        await axios
          .get(authConfig.meEndpoint, {
            headers: {
              Authorization: storedToken
            }
          })
          .then(async response => {
            setLoading(false)
            setUser({ ...response.data.userData })
          })
          .catch(() => {
            localStorage.removeItem('userData') // if there is an error fetching data based on stored token, then remove all data store in local storage
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('accessToken')
            setUser(null)
            setLoading(false)
            if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
              router.replace('/login') // if the instructions are to logout on expired token and they are not on login page, then go to login page. "replace" blocks history stack
            }
          })
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params, errorCallback) => {
    //function is fired when user tries pressed login button after submitting login in info
    axios
      .post(authConfig.loginEndpoint, params) // req sent to login end point with params
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
          : null
        const returnUrl = router.query.returnUrl
        console.log(returnUrl)
        setUser({ ...response.data.userData })
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.data.userData)) : null
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/' //return to the return url or go to the homepage
        router.replace(redirectURL)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err) //return an error to a call back function provide by parent component
      })
  }

  const handleLogout = () => {
    // function just removes user info from local state - need to refactor to access params and also use supabse kill session
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const handleRegister = (params, errorCallback) => {
    //create a user and log them in immediately based on given values if no errors
    axios
      .post(authConfig.registerEndpoint, params)
      .then(res => {
        if (res.data.error) {
          if (errorCallback) errorCallback(res.data.error)
        } else {
          handleLogin({ email: params.email, password: params.password })
        }
      })
      .catch(err => (errorCallback ? errorCallback(err) : null))
  }

  const values = {
    // update the values with user and loading from state and update the default functions with newly defined functions above
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
