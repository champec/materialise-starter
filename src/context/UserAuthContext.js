// ** React Imports
import { createContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// ** Next Import
import { useRouter } from 'next/router'

// ** SupaBase
import { supabaseUser } from '../configs/supabase'

// ** Config - to remove
import authConfig from 'src/configs/auth'

// ** Defaults provides default values to context if not provided init value also for type safety, can draw from default with dot notation
let usersArraydefault = []
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

usersArraydefault[0] = defaultProvider
const UserAuthContext = createContext(usersArraydefault[0]) // pass default object to AuthContext provider

const AuthUserProvider = ({ children }) => {
  // define auth provider that will be used to pass value down component tree
  // ** States
  const [usersArray, setUsersArray] = useState(usersArraydefault)
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)
  const [activeUser, setActiveUser] = useState(false)
  const [logoutMethod, setLogoutMethod] = useState()
  const [getsessionMethod, setGetSessionMethod] = useState()

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    // this runs automatically without to login use who have already logged in

    //   const accessToken =
    //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjc2NTQzNjg5LCJzdWIiOiIxMGNiYjEzNS02NzRiLTQyNTctYTAwMy1jMTA1YjYzYTI5NWQiLCJlbWFpbCI6ImNocm9uaWMyMTU3QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNjc2NTQwMDg5fV0sInNlc3Npb25faWQiOiI4YmE2MDI4Ny1kOTc5LTQxMzYtYTQ1OS1kYzBlZjIwZjdhNzcifQ.CQcTs5N8zEulp8SdMuLcx95Y2PDZGP-Kgs-FAMJCI2U'
    // const refreshToken = 'rAVKKK281zd9zBe8RfxTQQ'

    // await supabaseUser.auth.setSession({
    //   refresh_token: refreshToken,
    //   access_token: accessToken
    // })
    // const { data, error } = await supabaseUser.auth.getSession()
    // console.log(data)
    // const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)

    const initAuth = async () => {
      // check if a current session exists and fetch the data - store in context object (supabaseUser.auth.user)
      //   const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      //   if (storedToken) {
      //     setLoading(true)
      //     await axios
      //       .get(authConfig.meEndpoint, {
      //         headers: {
      //           Authorization: storedToken
      //         }
      //       })
      //       .then(async response => {
      //         setLoading(false)
      //         setUser({ ...response.data.user })
      //       })
      //       .catch(() => {
      //         localStorage.removeItem('useData') // if there is an error fetching data based on stored token, then remove all data store in local storage
      //         localStorage.removeItem('refreshToken')
      //         localStorage.removeItem('accessToken')
      //         setUser(null)
      //         setLoading(false)
      //         if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
      //           router.replace('/login') // if the instructions are to logout on expired token and they are not on login page, then go to login page. "replace" blocks history stack
      //         }
      //       })
      //   } else {
      //     setLoading(false)
      //   }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSwitch = async info => {
    const { data, error } = await supabaseUser.auth.setSession({
      refresh_token: info.refreshToken,
      access_token: info.accessToken
    })
    // const { data, error } = await supabaseUser.auth.getSession()

    if (data.user) {
      const returnUrl = router.query.returnUrl
      setUser({ ...data })
      console.log('switch', data)
      // 6.fetch the profile data and add using spread operator to user data
      let { data: profiles, error } = await supabaseUser.from('profiles').select('*').eq('id', data.user.id).single()
      setUser({ ...data, ...profiles })

      setLoading(false)
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
      router.replace(redirectURL)
    } else if (error) errorCallback(error)
    setLoading(false) //return an error to a call back function provide by parent component
  }

  const handleLogin = async (params, errorCallback) => {
    setLoading(true)
    const { data, error } = await supabaseUser.auth.signInWithPassword({
      email: params.email,
      password: params.password
    })

    if (data.user) {
      const returnUrl = router.query.returnUrl
      setUser({ ...data })

      // 6.fetch the profile data and add using spread operator to user data
      let { data: profiles, error } = await supabaseUser.from('profiles').select('*').eq('id', data.user.id).single()
      setUser({ ...data, ...profiles })

      //** 1. create a storage object with authkeys and username as key if remember me selected, then store else return null */
      const keyStore = profiles.email
      const storageObject = {
        username: profiles?.username,
        email: profiles.email,
        refreshToken: data.session.refresh_token,
        accessToken: data.session.access_token
      }
      let storedObject = JSON.parse(window.localStorage.getItem('localUsers'))
      if (storedObject && params.rememberMe) {
        const newObject = { ...storedObject, [keyStore]: storageObject }
        window.localStorage.setItem('localUsers', JSON.stringify(newObject))
      } else if (!storedObject && params.rememberMe) {
        const newObject = { [keyStore]: storageObject }
        window.localStorage.setItem('localUsers', JSON.stringify(newObject))
      }

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
  //store session details in local storage
  const values = {
    // update the values with use and loading from state and update the default functions with newly defined functions above
    user: user,
    loading,
    activeUser: activeUser,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    switchU: handleSwitch
  }
  // const oldValues = JSON.parse(window.localStorage.getItem('userData'))
  // if (oldValues) {
  //   const values = [...oldValues, newvalues]
  //   params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(values)) : null
  // } else {
  //   const values = [newvalues]
  //   params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(values)) : null
  // }

  return <UserAuthContext.Provider value={values}>{children}</UserAuthContext.Provider>
}

export { UserAuthContext, AuthUserProvider }
