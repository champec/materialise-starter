// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useUserAuth } from 'src/hooks/useAuth'

const AuthGuard = props => {
  const { children, fallback } = props //destructure received props, children (content in between), also provided a fallback spinner
  const auth = useUserAuth() //get auth values
  const router = useRouter() // get router methods

  useEffect(
    //this use effect only runs when you change routes, so check if router is ready if not, don't run the code underneath
    () => {
      if (!router.isReady || auth.loading) {
        return
      }

      if (
        auth.user === null
        //{/*&& !window.localStorage.getItem('userData')*/}
      ) {
        // if there is no user or any data in local storage
        if (router.asPath !== '/') {
          //router as path is the route without the base-path, take them back to the homepage unless they were trying to access the login page already
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath } //return url is the page the user tried to reach before being redirected
          })
        } else {
          router.replace('/login')
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, auth.user, auth.loading]
  )
  if (auth.loading || !router.isReady || auth.user === null) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
