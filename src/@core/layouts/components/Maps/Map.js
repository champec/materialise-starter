import React, { useEffect, useState } from 'react'
import GoogleMapReact from 'google-map-react'
import Marker from 'src/@core/components/Map/Marker'

//** MUI imports
import { useMediaQuery } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Logo from 'src/@core/components/logo/Logo'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import CardCongratulationsDaisy from 'src/views/ui/gamification/CardCongratulationsDaisy'

function Map({ setCoordinates, coordinates, places, setChildClicked }) {
  const [geoPermission, setGeoPermission] = useState()
  const [location, setLocation] = useState({ latitude: 0, longtitude: 0 })
  const [loading, setLoading] = useState(false)
  const coords = { lat: location.latitude, lng: location.longitude }

  const locationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }

  const locationSuccess = pos => {
    const location = pos.coords
    console.log(location.longitude)
    setLocation(location)
  }

  const locationErrors = err => {
    console.log(err)
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setGeoPermission(result.state)
        const pos = navigator.geolocation.getCurrentPosition(locationSuccess, locationErrors, locationOptions)

        result.onchange = function () {
          console.log(result.state)
          setLoading(false)
        }
      })
    } else {
      alert('Sorry Not available!')
      setLoading(false)
    }
  }, [])
  if (!geoPermission) {
    return <Typography>Location Permission is required to use this app</Typography>
  }
  return (
    <Box style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyCZMa6ce0vMD7mZghlcfeFHr7m6PwDQKKQ' }}
        defaultCenter={{ lat: 52.49272537231445, lng: -2.033581256866455 }}
        center={coords}
        onChange={e => {
          setCoordinates({ lat: e.center.lat, lng: e.center.lng })
        }}
        defaultZoom={18}
        // options={''}
        onChildClick={child => setChildClicked(child)}
      >
        {places?.map((place, i) => {
          return (
            <div
              style={{
                width: '200px',
                height: 'auto',
                textOverflow: 'ellipsis',
                marginTop: '-40px',
                marginLeft: '-40px'
              }}
              lat={place.Latitude}
              lng={place.Longitude}
              key={i}
            >
              <Marker place={place} key={i} />
            </div>
          )
        })}
      </GoogleMapReact>
    </Box>
  )
}

export default Map
