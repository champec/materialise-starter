// ** React Imports
import { useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

const Home = () => {
  // The useRouter hook from Next.js is used to get the router instance.
  const router = useRouter()

  useEffect(() => {
    // If the router is not ready yet, return early.
    if (!router.isReady) {
      return
    }

    // If the user is authenticated, redirect them to the home page.

    router.replace('/home')

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // While the redirection is taking place, render a spinner.
  return <Spinner />
}

export default Home
