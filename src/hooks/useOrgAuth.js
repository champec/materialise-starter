import { useContext } from 'react'
import { OrgAuthContext } from 'src/context/OrgAuthContext'

export const useOrgAuth = () => useContext(OrgAuthContext) // an abstraction to allow to extract our context values from createContext - values = login info and methods
