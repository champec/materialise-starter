import React, { useEffect } from 'react'
import DailyIframe from '@daily-co/daily-js'

const VideoCallComponent = ({ containerRef }) => {
  useEffect(() => {
    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        position: 'relative',
        width: '100%',
        height: '100%',
        border: 'none'
      }
    })

    callFrame.join({
      url: 'https://pharmex.daily.co/0IADVErqAsyP9EmMpbo7',
      theme: {
        colors: {
          accent: '#1AA1FB',
          background: '#282A42',
          mainAreaBg: '#282A42'
        }
      }
    })

    return () => callFrame.destroy()
  }, [containerRef])

  return null // The iframe is attached to the ref's current element
}

export default VideoCallComponent
