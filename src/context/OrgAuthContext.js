// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** SupaBase
import { supabaseOrg } from '../configs/supabase'

// ** Config - to remove
import authConfig from 'src/configs/auth'

// ** Defaults provides default values to context if not provided init value also for type safety, can draw from default with dot notation
const defaultProvider = {
  organisation: null,
  loading: true,
  setOrganisation: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
}

const OrgAuthContext = createContext(defaultProvider) // pass default object to AuthContext provider

const AuthOrgProvider = ({ children }) => {
  // define auth provider that will be used to pass value down component tree
  // ** States
  const [organisation, setOrganisation] = useState(defaultProvider.organisation)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    // this runs automatically without to login organisation who have already logged in
    const initAuth = async () => {
      // check if a current session exists and fetch the data - store in context object (supabaseOrg.auth.user)
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
            setOrganisation({ ...response.data.user })
          })
          .catch(() => {
            localStorage.removeItem('organisationData') // if there is an error fetching data based on stored token, then remove all data store in local storage
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('accessToken')
            setOrganisation(null)
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
    //function is fired when organisation tries pressed login button after submitting login in info
    setLoading(true)
    const { data, error } = await supabaseOrg.auth.signInWithPassword({
      email: params.email,
      password: params.password
    })
    if (data.user) {
      //do some logic when remember me is ticked - maybe store the user in local storage with cookies and pass?

      const returnUrl = router.query.returnUrl
      setOrganisation({ ...data })
      params.rememberMe ? window.localStorage.setItem('organisationData', JSON.stringify(data)) : null
      // const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/' //return to the return url or go to the homepage
      // router.replace(redirectURL)
      let { data: profiles, error } = await supabaseOrg.from('profiles').select('*').eq('id', data.user.id).single()
      setOrganisation({ ...profiles })

      setLoading(false)
    } else if (error) errorCallback(error)
    setLoading(false) //return an error to a call back function provide by parent component
  }

  const handleLogout = async () => {
    // function just removes organisation info from local state - need to refactor to access params and also use supabse kill session
    setLoading(true)
    setOrganisation(null)
    window.localStorage.removeItem('organisationData')

    setLoading(true)
    const { error } = await supabaseOrg.auth.signOut()
    if (error) errorCallback(error)
    setLoading(false) //return an error to a call back function provide by parent component

    router.push('/login')
  }

  const handleRegister = (params, errorCallback) => {
    //create a organisation and log them in immediately based on given values if no errors
    supabaseOrg.auth
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
    // update the values with organisation and loading from state and update the default functions with newly defined functions above
    organisation: organisation,
    loading,
    setOrganisation,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  return <OrgAuthContext.Provider value={values}>{children}</OrgAuthContext.Provider>
}

export { OrgAuthContext, AuthOrgProvider }
