import { useEffect } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'

const Mail = () => {
  useEffect(() => {
    window.location.href = 'https://mail.zoho.eu' // Change to your specific Zoho inbox URL
  }, [])

  return <div>Redirecting to mail...</div>
}

Mail.getLayout = page => <BlankLayout>{page}</BlankLayout>
Mail.authGuard = false
Mail.orgGuard = false

export default Mail
