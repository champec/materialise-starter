// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** SupaBase
import { supabaseUser } from '../configs/supabase'

// ** Config - to remove
import authConfig from 'src/configs/auth'

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

const UserAuthContext = createContext(defaultProvider) // pass default object to AuthContext provider

const AuthUserProvider = ({ children }) => {
  // define auth provider that will be used to pass value down component tree
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    // this runs automatically without to login use who have already logged in
    const initAuth = async () => {
      // check if a current session exists and fetch the data - store in context object (supabaseUser.auth.user)
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
            setUser({ ...response.data.user })
          })
          .catch(() => {
            localStorage.removeItem('useData') // if there is an error fetching data based on stored token, then remove all data store in local storage
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

  const handleLogin = async (params, errorCallback) => {
    //function is fired when use tries pressed login button after submitting login in info
    console.log('received')
    setLoading(true)
    const { data, error } = await supabaseUser.auth.signInWithPassword({
      email: params.email,
      password: params.password
    })
    if (data.user) {
      //do some logic when remember me is ticked - maybe store the user in local storage with cookies and pass?

      const returnUrl = router.query.returnUrl
      setUser({ ...data })
      params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(data)) : null
      // const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/' //return to the return url or go to the homepage
      // router.replace(redirectURL)
      let { data: profiles, error } = await supabaseUser.from('profiles').select('*').eq('id', data.user.id).single()
      setUser({ ...profiles })

      setLoading(false)
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
      router.replace(redirectURL)
    } else if (error) errorCallback(error)
    setLoading(false) //return an error to a call back function provide by parent component
  }

  const handleLogout = async () => {
    // function just removes use info from local state - need to refactor to access params and also use supabse kill session
    setUser(null)
    window.localStorage.removeItem('useData')

    setLoading(true)
    const { error } = await supabaseUser.auth.signOut()
    if (error) errorCallback(error)
    setLoading(false) //return an error to a call back function provide by parent component

    router.push('/login')
  }

  const handleRegister = (params, errorCallback) => {
    //create a use and log them in immediately based on given values if no errors
    supabaseUser.auth
      .signOut()
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
    // update the values with use and loading from state and update the default functions with newly defined functions above
    user: user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  return <UserAuthContext.Provider value={values}>{children}</UserAuthContext.Provider>
}

export { UserAuthContext, AuthUserProvider }
