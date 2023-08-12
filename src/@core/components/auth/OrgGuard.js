import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'

const OrgGuard = props => {
  const { children, fallback } = props
  const auth = useSelector(state => state.organisation)
  const router = useRouter()

  console.log('ORG', { auth })

  useEffect(() => {
    // If router or authentication is still loading, return early
    if (!router.isReady || auth.loading) return

    // If organisation is null or undefined, the user is not authenticated
    if (!auth.organisation) {
      if (router.asPath !== '/') {
        router.replace({
          pathname: '/login',
          query: { returnUrl: router.asPath }
        })
      } else {
        router.replace('/login')
      }
    }
  }, [router.isReady, auth.loading, auth.organisation])

  // If still loading or user is not authenticated, return the fallback component
  if (auth.loading || !auth.organisation) {
    return fallback
  }

  return <>{children}</>
}

export default OrgGuard
