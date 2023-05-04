// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** SupaBase
import { supabase } from '../configs/supabase'

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

const AuthContext = createContext(defaultProvider) // pass default object to AuthContext provider

const AuthProvider = ({ children }) => {
  // define auth provider that will be used to pass value down component tree
  // ** States
  const [loading, setLoading] = useState(defaultProvider.loading)
  const [user, setUser] = useState(null)
  const [organisation, setOrganisation] = useState(null)
  const [error, setError] = useState(null)
  const [activeSessions, setActiveSessions] = useState([])

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    setLoading(true)

    const getProfileData = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError(error)
        setLoading(false)
        return
      }

      if (data) {
        const storedSessions = window.localStorage.getItem('activeSessions')
        if (storedSessions) {
          setActiveSessions(JSON.parse(storedSessions))
        }

        const activeSession = activeSessions.find(session => session.userId === data.user.id)

        if (activeSession) {
          const { data: organisation, error: orgError } = await supabase
            .from('organisations')
            .select('*')
            .eq('id', activeSession.userId)
            .single()

          if (orgError) {
            setError(orgError)
            console.log(orgError.message)
            setLoading(false)
            return
          }

          if (organisation) {
            setOrganisation(organisation)
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', activeSession.userId)
              .single()

            if (userError) {
              setError(userError)
              console.log(userError.message)
              setLoading(false)
              return
            }

            const allowedRoles = {
              pharmacy: ['locum_pharmacist'],
              surgery: ['locum_doctor']
            }

            const isAllowedRole = allowedRoles[organisation.type]?.includes(authUser.role)

            // Check if the user is registered in the organization_users table
            const { data: orgUser, error } = await supabase
              .from('organisation_users')
              .select('*')
              .eq('user_id', authUser.id)
              .eq('organisation_id', organisation.id)
              .single()

            if (isAllowedRole || orgUser) {
              setUser(authUser)
              setLoading(false)
            } else {
              setError({ message: 'User is not associated with the organisation' })
              setLoading(false)
              return
            }
          }
        }
      }

      setLoading(false)
    }

    getProfileData()

    supabase.auth.onAuthStateChange(() => {
      getProfileData()
    })
  }, [])

  // Add your handleLogin, handleLogout, and handleRegister functions here
  // ...
  const handleLogin = async (params, errorCallback) => {
    setLoading(true)

    // Attempt to sign in the user with the provided email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password
    })
    if (error) {
      console.log(error.message, 'from initial login error')
    }

    if (!data.organisation) {
      alert('Please select an organisation first')
      console.log(data)
      return
    }
    if (data.user) {
      // Fetch the corresponding record from the public.users table
      const { data: authUser, error } = await supabase.from('users').select('*').eq('id', data.user.id).single()

      if (error) {
        errorCallback(error)
        console.log(error.message, 'from fetching corresponding record from public.users table')
        setLoading(false)
        return
      }

      if (authUser) {
        // Check if there is an active organization session
        if (!organisation) {
          errorCallback(new Error('Please log in to an organization first.'))
          setLoading(false)
          return
        }

        // Determine if the user is allowed to log in based on their role and the organization type
        const allowedRoles = {
          pharmacy: ['locum_pharmacist'],
          surgery: ['locum_doctor']
        }

        const isAllowedRole = allowedRoles[organisation.type]?.includes(authUser.role)

        // Check if the user is registered in the organization_users table
        const { data: orgUser, error } = await supabase
          .from('organisation_users')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('organisation_id', organisation.id)
          .single()

        if (error) {
          errorCallback(error)
          console.log(error.message, 'from checking if user is registered in the organization_users table')
          setLoading(false)
          return
        }

        if (isAllowedRole || orgUser) {
          setUser(authUser)

          // Add the new session to activeSessions
          const newSession = { userId: authUser.id, sessionId: data.session.id }
          const updatedSessions = [...activeSessions, newSession]

          // Store the updated active sessions in local storage
          window.localStorage.setItem('activeSessions', JSON.stringify(updatedSessions))

          setActiveSessions(updatedSessions)
          setLoading(false)
        } else {
          errorCallback(new Error('You are not authorized to log in to this organization.'))
          setLoading(false)
        }
      } else {
        errorCallback(new Error('User not found.'))
        setLoading(false)
      }
    } else {
      errorCallback(error)
      setLoading(false)
    }
  }

  const switchUser = async userId => {
    const sessionToSwitch = activeSessions.find(session => session.userId === userId)

    if (sessionToSwitch) {
      // Set the current session to the selected user's session
      await supabase.auth.setSession(sessionToSwitch.session)

      // Fetch user and organization data based on the new session
      // ... (Similar to the handleLogin logic, but without signing in)
    } else {
      console.error('Session not found for the selected user.')
    }
  }

  const logoutUser = userId => {
    const updatedSessions = activeSessions.filter(session => session.userId !== userId)
    setActiveSessions(updatedSessions)

    // If the logged-out user is the currently active user, then switch to another session or log out completely
    if (userId === user.id) {
      if (updatedSessions.length > 0) {
        // Switch to the first session in the updatedSessions array
        switchUser(updatedSessions[0].userId)
      } else {
        // Log out completely
        handleLogout()
      }
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setOrganisation(null)
    setLoading(false)

    if (error) {
      errorCallback(error)
    }

    router.push('/login')
  }

  const handleRegister = async (params, errorCallback) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password
    })

    if (data) {
      handleLogin({ email: params.email, password: params.password }, errorCallback)
    } else if (error) {
      errorCallback(error)
      setLoading(false)
    }
  }

  const values = {
    user,
    organisation,
    loading,
    setUser,
    switchUser,
    setOrganisation,
    logoutUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
