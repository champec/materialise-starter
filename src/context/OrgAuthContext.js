// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** SupaBase
import { supabaseOrg, supabaseUser } from '../configs/supabase'

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
  // define auth provider that will be used to pass value down component tre e
  // ** States
  const [organisation, setOrganisation] = useState(defaultProvider)
  const [loading, setLoading] = useState(defaultProvider.loading)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(null)
  const [userMadeChange, setUserMadeChange] = useState(false)

  const handleUserMadeChange = value => {
    console.log('handle user made change firing')
    setUserMadeChange(value)
  }

  // ** authentication status
  useEffect(() => {
    if (organisation?.id) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [organisation])

  const getProfileData = async () => {
    setLoading(true)
    const { data, error } = await supabaseOrg.auth.getSession()

    if (data.session) {
      let { data: profiles, error } = await supabaseOrg
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single()
      setOrganisation({ ...profiles })
      error ? setError(error) : null
      setLoading(false)
    } else {
      setLoading(false)
    }

    if (error) {
      setError(error)
      setLoading(false)
    }
  }

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    setLoading(true)
    getProfileData()
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
      setOrganisation({ ...data, ...profiles })

      setLoading(false)
    } else if (error) errorCallback(error)
    setLoading(false) //return an error to a call back function provide by parent component
  }

  const handleLogout = async () => {
    // function just removes organisation info from local state - need to refactor to access params and also use supabse kill session
    setLoading(true)
    setOrganisation(null)
    window.localStorage.removeItem('organisationData')

    const { error } = await supabaseOrg.auth.signOut()
    setLoading(true)
    if (error) errorCallback(error)
    window.localStorage.removeItem('localUsers')
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

    supabaseUser.signOut
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
    isAuthenticated,
    setOrganisation,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    userMadeChange,
    handleUserMadeChange,
    refreshOrgData: getProfileData
  }

  return <OrgAuthContext.Provider value={values}>{children}</OrgAuthContext.Provider>
}

export { OrgAuthContext, AuthOrgProvider }
