// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'

// ** Loader Import
import NProgress from 'nprogress'

//** Reduct
import { Provider } from 'react-redux'
import store from 'src/store'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'

// ** Config Imports

import themeConfig from 'src/configs/themeConfig'

// ** RTK imports
import { useDispatch, useSelector } from 'react-redux'
import { initializeSession as initOrg } from 'src/store/auth/organisation'
import { initializeSession as initUser } from 'src/store/auth/user'
import { addNotification, fetchNotifications } from 'src/store/notifications'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// ** Fake-DB Import
import 'src/@fake-db'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'

import ThemeComponent from 'src/@core/theme/ThemeComponent'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'
import OrgGuard from 'src/@core/components/auth/OrgGuard'
import WindowWrapper from 'src/@core/components/window-wrapper'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Contexts
import { AuthUserProvider } from 'src/context/UserAuthContext'
import { AuthOrgProvider } from 'src/context/OrgAuthContext'
import { AuthProvider } from 'src/context/supabaseContext'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'
import { LoadingProvider } from 'src/context/loadingContext'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'src/iconify-bundle/icons-bundle-react'

// ** Global css styles
import '../../styles/globals.css'
import { useEffect } from 'react'

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard, orgGuard }) => {
  // display a page depending on which guard is turned on. gustGuard on, guest only, orgGuard on, org only, authGuard on, users only, all off, show to everyone

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initOrg())
    dispatch(initUser())
    dispatch(fetchNotifications())
  }, [])

  const setupSupabaseListener = () => {
    supabase
      .channel('notifications')
      .on('postgres_changes', { schema: 'public', table: 'notifications' }, payload => {
        console.log('New notification:', payload)
        dispatch(addNotification(payload.new))
      })
      .subscribe()
  }

  // Clean up listener
  const removeSupabaseListener = () => {
    supabase.removeChannel('notifications')
  }

  useEffect(() => {
    setupSupabaseListener()

    return () => {
      removeSupabaseListener()
    }
  }, [])

  if (guestGuard) {
    console.log('GUEST GUARD')
    // default always off, but if on only show to guests
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (orgGuard && !authGuard) {
    console.log('ORG GUARD')
    // if organisation guard is turned on, then show org login screen only and protect other routes - it turned off when you login
    return <OrgGuard fallback={<Spinner />}>{children}</OrgGuard>
  } else if (!guestGuard && !authGuard) {
    console.log('NO GUARD')
    // show to everyone including if logged into organisation
    return <>{children}</>
  } else {
    // by default all pages are user logged in protected
    return (
      <OrgGuard>
        <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
      </OrgGuard>
    )
  }
}

// ** Configure JSS & ClassName
const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false

  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>) //double question mark return right sid left is null/undefined or vice versa
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true // all pages are automatically auth protected unless turned off - only auth user can see content
  const guestGuard = Component.guestGuard ?? false // automatically all users can see all content unless turned on then only guests can see - i.e login, etc
  const orgGuard = Component.orgGuard ?? true // if the component doesn't have a orgGuard prop then the orGuard is false otherwise whatever the component defines it as
  // const aclAbilities = Component.acl ??

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{`${themeConfig.templateName} - The Pharmacy Copilot`}</title>
        <meta
          name='description'
          content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
        />
        <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <AuthProvider>
        <AuthOrgProvider>
          <AuthUserProvider>
            <Provider store={store}>
              <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
                <SettingsConsumer>
                  {({ settings }) => {
                    return (
                      <ThemeComponent settings={settings}>
                        <WindowWrapper>
                          {/*/ this passes down rules for page views depending on user state */}
                          <Guard authGuard={authGuard} orgGuard={orgGuard} guestGuard={guestGuard}>
                            {/*/this is a CRUD guard but can be replaced for RLS in supabase*/}
                            <LoadingProvider>{getLayout(<Component {...pageProps} />)}</LoadingProvider>
                          </Guard>
                        </WindowWrapper>
                        <ReactHotToast>
                          <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
                        </ReactHotToast>
                      </ThemeComponent>
                    )
                  }}
                </SettingsConsumer>
              </SettingsProvider>
            </Provider>
          </AuthUserProvider>
        </AuthOrgProvider>
      </AuthProvider>
    </CacheProvider>
  )
}

export default App
