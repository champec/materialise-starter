import React, { useEffect } from 'react'
import DailyIframe from '@daily-co/daily-js'
import { useCallFrame } from '@daily-co/daily-react'

const VideoCallComponent = ({
  containerRef,
  url,
  handleBookingButton,
  handleScrButton,
  handleNotesButton,
  handlePrescriptionButton
}) => {
  const callFrame = useCallFrame({
    parentElRef: containerRef,
    options: {
      iframeStyle: {
        position: 'relative',
        width: '100%',
        height: '100%',
        border: 'none'
      }
    },
    shouldCreateInstance: () => containerRef.current
  })
  useEffect(() => {
    if (!containerRef.current || !callFrame) return
    // const callFrame = DailyIframe.createFrame(containerRef.current, {
    //   iframeStyle: {
    //     position: 'relative',
    //     width: '100%',
    //     height: '100%',
    //     border: 'none'
    //   }
    // })

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
        bookingButton: {
          iconPath: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/bookinglight.png',
          iconPathDarkMode: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/bookingdark.png',
          label: 'Booking Info',
          tooltip: 'View Booking Information'
        },
        scrButton: {
          iconPath: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/scrlight.png',
          iconPathDarkMode: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/scrdark.png',
          label: 'SCR',
          tooltip: 'Open SCR'
        },
        prescriptionButton: {
          iconPath: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/prescriptionlight.png',
          iconPathDarkMode:
            'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/prescriptiondark.png',
          label: 'Prescription',
          tooltip: 'Write prescriptions here'
        },
        notesButton: {
          iconPath: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/noteslight.png',
          iconPathDarkMode: 'https://xsqwpmqfbirqdncoephf.supabase.co/storage/v1/object/public/icons/notesdark.png',
          label: 'Notes',
          tooltip: 'Write notes here'
        }
      }
    })

    callFrame.on('custom-button-click', event => {
      if (event.button_id === 'bookingButton') {
        console.log('bookingButton')
        handleBookingButton()
      } else if (event.button_id === 'scrButton') {
        console.log('customButtonTwo')
        handleScrButton()
      } else if (event.button_id === 'prescriptionButton') {
        console.log('customButtonThree')
        handlePrescriptionButton()
      } else if (event.button_id === 'notesButton') {
        console.log('customButtonFour')
        handleNotesButton()
      }
    })

    return () => callFrame.destroy()
  }, [containerRef, callFrame])

  return null // The iframe is attached to the ref's current element
}

export default VideoCallComponent
