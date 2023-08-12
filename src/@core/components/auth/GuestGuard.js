// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useUserAuth } from 'src/hooks/useAuth'
import { useSelector } from 'react-redux'

const GuestGuard = props => {
  const { children, fallback } = props
  const auth = useSelector(state => state.user)
  const router = useRouter()

  console.log('GUEST', { auth })
  useEffect(() => {
    if (!router.isReady) {
      return
    }
    if (window.localStorage.getItem('userData')) {
      router.replace('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.route])
  if (auth.loading || auth.user == null) {
    return fallback
  }

  return <>{children}</>
}

export default GuestGuard
