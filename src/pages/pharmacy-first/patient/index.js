import React from 'react'
import { useRouter } from 'next/router'
import VideoCallComponent from '../call-screen/CallScreen'
import BlankLayout from 'src/@core/layouts/BlankLayout'

function PatientCall() {
  const router = useRouter()
  const { url } = router.query || {}
  const containerRef = React.useRef()

  return (
    <div ref={containerRef} style={{ height: '100vh' }}>
      <h1>Video Call</h1>
      <VideoCallComponent url={url} containerRef={containerRef} />
    </div>
  )
}

PatientCall.getLayout = page => <BlankLayout>{page}</BlankLayout>
PatientCall.authGuard = false
PatientCall.orgGuard = false

export default PatientCall
