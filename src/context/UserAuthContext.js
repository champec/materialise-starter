// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** SupaBase
import { supabaseUser } from '../configs/supabase'

// ** Defaults provides default values to context if not provided init value also for type safety, can draw from default with dot notation

const defaultProvider = {
  user: null,
  loading: true,
  activeUser: false,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
}

const UserAuthContext = createContext(defaultProvider) // pass default object to AuthContext provider

const AuthUserProvider = ({ children }) => {
  // ** States - loading state is false by defualt and true when fetching, user state will contian the profiles table data in supabase
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)
  const [error, setError] = useState()
  const [activeUser, setActiveUser] = useState(false)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    setLoading(true)
    //this methods gets session data if any and is called when auth statechanges and when component first mounts hence why is if fired in two seperate locations bellow
    const getProfileData = async () => {
      //await the data frin supabase
      const { data, error } = await supabaseUser.auth.getSession()
      //if a session is available then get the data froom the profiles tabale and spread it into user state, if an error then present in error state
      if (data.session) {
        let { data: profiles, error } = await supabaseUser
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single()
        setUser({ ...profiles })
        error ? setError(error) : null
        setLoading(false)
      } else {
        // if a session doesnt exists then just the loadingstate to false and allow the page to load
        //! edge case to be tested
        setLoading(false)
      }
      // this is if there is an error from the initial getsession from supabase
      if (error) {
        setError(error)
        setLoading(false)
      }
    }

    // call the getprofileData funciton when component first mounts, auth state might have not changed
    getProfileData()

    // call it again when the authstate changes, component may have not remounted
    //! to be tested. quite unlikely this is necessary because all auth related methods are called from this file
    supabaseUser.auth.onAuthStateChange(() => {
      getProfileData()
    })
  }, [])

  const handleSwitch = async (info, errorCallback) => {
    // info contains local storage refreshToken and Access token required to fetch a session - only if remember was ticked on sign in
    setLoading(true)
    const { data, error } = await supabaseUser.auth.setSession({
      refresh_token: info.refreshToken,
      access_token: info.accessToken
    })

    // if a session exists, the fetch data and upload it to the userState, set the loading false
    if (data.user) {
      const returnUrl = router.query.returnUrl
      let { data: profiles, error } = await supabaseUser.from('profiles').select('*').eq('id', data.user.id).single()
      setUser({ ...data, ...profiles })

      setLoading(false)
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
      router.replace(redirectURL)
      //! this may not work becuase errorCallback is undefined, set the error to error state or send a function through params from executing compnent, see login method below
    } else if (error) errorCallback(error)
    setLoading(false)
  }

  const handleLogin = async (params, errorCallback) => {
    setLoading(true)
    const { data, error } = await supabaseUser.auth.signInWithPassword({
      email: params.email,
      password: params.password
    })

    if (data.user) {
      const returnUrl = router.query.returnUrl
      let { data: profiles, error } = await supabaseUser.from('profiles').select('*').eq('id', data.user.id).single()
      setUser({ ...data, ...profiles })

      //** 1. create a storage object with authkeys and username as key if remember me selected, then store else return null */
      //keystore is the email which will be the key:(to the object) i.e some@aol.com:{pros:values}
      const keyStore = profiles.email
      const storageObject = {
        username: profiles?.username,
        email: profiles.email,
        refreshToken: data.session.refresh_token,
        accessToken: data.session.access_token
      }
      //fetch local storeage object if one exists
      let storedObject = JSON.parse(window.localStorage.getItem('localUsers'))
      if (storedObject && params.rememberMe) {
        // if it does then add new key:object at the end and spread previous data infront
        const newObject = { ...storedObject, [keyStore]: storageObject }
        window.localStorage.setItem('localUsers', JSON.stringify(newObject))
      } else if (!storedObject && params.rememberMe) {
        //if no new object exists then create one
        //!might have been easier to just use an array of objects, possible refactor in future - would prevent advanced conversion into array in component
        const newObject = { [keyStore]: storageObject }
        window.localStorage.setItem('localUsers', JSON.stringify(newObject))
      }

      setLoading(false)

      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
      router.replace(redirectURL)
    } else if (error) errorCallback(error)
    setLoading(false) //return an error to a call back function provide by parent component
  }

  const handleLogout = async (email, errorCallback) => {
    setLoading(true)
    // function deleted user from local storage then signout of supabase session - then pushed to login screen
    const store = JSON.parse(window.localStorage.getItem('localUsers'))
    store
    delete store[email]
    window.localStorage.setItem('localUsers', JSON.stringify(store))
    await supabaseUser.auth
      .signOut()
      .then(() => {
        router.push('/login')
        setLoading(false)
      })
      .catch(error => errorCallback(error))

    //return an error to a call back function provide by parent component
  }

  const handleRegister = (params, errorCallback) => {
    //! TO BE DONE! junk code below
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
  //store session details in local storage
  const values = {
    // update the values with use and loading from state and update the default functions with newly defined functions above
    user: user,
    loading,
    activeUser: activeUser,
    error: error,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    switchU: handleSwitch
  }

  return <UserAuthContext.Provider value={values}>{children}</UserAuthContext.Provider>
}

export { UserAuthContext, AuthUserProvider }
