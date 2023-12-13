import React from 'react'
import { useRouter } from 'next/router'
import PatientCallScreen from '../../call-screen/PatientCallScreen'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { supabase } from 'src/configs/supabase'

function PatientCall() {
  const router = useRouter()
  const { id } = router.query || {}
  const containerRef = React.useRef()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [consultation, setConsultation] = React.useState(null)

  const fetchConsultation = async () => {
    const { data, error } = await supabase.from('consultations').select('*').eq('id', id).single()
    if (error) {
      setError(error)
      setLoading(false)
    }
    if (data) {
      setConsultation(data)
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (!id) {
      console.log('No id', id)
      return
    }
    fetchConsultation()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }

  console.log({ consultation })
  let url = consultation?.url
  if (consultation?.patient_token) {
    url = `${url}?token=${consultation?.patient_token}`
  }

  console.log({ url })
  return (
    <div ref={containerRef} style={{ height: '100vh' }}>
      <h1>Video Call</h1>
      <PatientCallScreen url={url} containerRef={containerRef} />
    </div>
  )
}

PatientCall.getLayout = page => <BlankLayout>{page}</BlankLayout>
PatientCall.authGuard = false
PatientCall.orgGuard = false

export default PatientCall
