import { useContext } from 'react'
import { UserAuthContext } from 'src/context/UserAuthContext'
import { AuthContext } from 'src/context/supabaseContext'

export const useUserAuth = () => useContext(UserAuthContext) // an abstraction to allow to extract our context values from createContext - values = login info and methods
export const useAuth = () => useContext(AuthContext) // an abstraction to allow to extract our context values from createContext - values = login info and methods
