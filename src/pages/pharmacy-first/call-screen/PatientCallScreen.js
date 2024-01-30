import React, { useEffect } from 'react'
import DailyIframe from '@daily-co/daily-js'

const PatientCallScreen = ({ containerRef, url, joinedMeeting }) => {
  useEffect(() => {
    if (!containerRef.current) return
    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        position: 'relative',
        width: '100%',
        height: '100%',
        border: 'none'
      }
    })

    callFrame.join({
      url: url ? url : null,
      theme: {
        colors: {
          accent: '#1AA1FB',
          background: '#282A42',
          mainAreaBg: '#282A42',
          backgroundAccent: '#282A42',
          baseText: '#FFFFFF'
        }
      },
      customTrayButtons: {
        leaveButton: {
          iconPath: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/leaveLight.png',
          iconPathDarkMode: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/leaveDark.png',
          label: 'Leave',
          tooltip: 'Leave the call'
        }
      }
    })

    callFrame.on('custom-button-click', event => {
      if (event.button_id === 'leaveButton') {
        callFrame.leave()
      }
    })

    callFrame.on('joined-meeting', () => {
      joinedMeeting()
    })

    return () => {
      callFrame.destroy()
    }
  }, [containerRef])

  return null // The iframe is attached to the ref's current element
}

PatientCallScreen.authGuard = false
PatientCallScreen.orgGuard = false

export default PatientCallScreen
