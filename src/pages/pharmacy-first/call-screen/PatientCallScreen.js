import React, { useEffect } from 'react'
import DailyIframe from '@daily-co/daily-js'

const PatientCallScreen = ({ containerRef, url }) => {
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
      }
    })

    return () => callFrame.destroy()
  }, [containerRef])

  return null // The iframe is attached to the ref's current element
}

export default PatientCallScreen
