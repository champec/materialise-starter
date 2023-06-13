// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useOrgAuth } from 'src/hooks/useOrgAuth'

const OrgGuard = props => {
  const { children, fallback } = props //destructure received props, children (content in between), also provided a fallback
  const auth = useOrgAuth() //get auth values
  const router = useRouter() // get router methods
  console.log(auth.isAuthenticated, 'auth.isAuthenticated')
  useEffect(
    //this use effect only runs when you change routes, so check if router is ready if not, don't run the code underneath
    () => {
      if (!router.isReady || auth.loading) {
        return
      }
      if (auth.isAuthenticated === false) {
        console.log('REPLACING ROUTER in orguard 1')
        // if there is no user or any data in local storage
        if (router.asPath !== '/') {
          //router as path is the route without the base-path, take them back to the homepage unless they were trying to access the login page already
          console.log('REPLACING ROUTER in orguard 2')
          router.replace({
            pathname: '/login/organisation', //if organisation is not logged into the direct user to organisation login page
            query: { returnUrl: router.asPath } //return url is  the page the user tried to reach before being redirected
          })
        } else {
          console.log('REPLACING ROUTER in orguard 3')
          router.replace('/login/organisation')
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route]
  )
  if (auth.loading || auth.isAuthenticated === false) {
    return fallback
  }

  return <>{children}</>
}

export default OrgGuard
