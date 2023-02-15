import { useContext } from 'react'
import { UserAuthContext } from 'src/context/UserAuthContext'

export const useAuth = () => useContext(UserAuthContext) // an abstraction to allow to extract our context values from createContext - values = login info and methods
