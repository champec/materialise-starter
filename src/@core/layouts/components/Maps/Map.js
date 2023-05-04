import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { distanceInMiles } from 'src/@core/utils/distanceInMiles'
import Marker2 from 'src/@core/components/Map/Marker'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN // Set your mapbox token here

export default function MapComponent({ places, setCoordinates, coordinates, setChildClicked }) {
  const [viewport, setViewport] = useState({
    latitude: null,
    longitude: null,
    zoom: 14
  })

  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null })

  useEffect(() => {
    const location = userLocation
    if (!location.latitude || !location.longitude) return
    setViewport({
      latitude: location.latitude,
      longitude: location.longitude,
      zoom: 14
    })
    setCoordinates({
      lat: location.latitude,
      lng: location.longitude
    })
  }, [userLocation.latitude, userLocation.longitude])

  useEffect(() => {
    const locationOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
    // if successful, user the users location
    const locationSuccess = pos => {
      const location = pos.coords
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude
      })
      console.log({ location })
    }

    const locationErrors = err => {
      console.log(err)
    }
    // check the browser navigator if available for users locaiton and then fire off 3 fucntion depending on out come
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted' || result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(locationSuccess, locationErrors, locationOptions)
        }
      })
    } else {
      alert('Sorry, geolocation is not available!')
    }
  }, [])

  const handleMoveEnd = evt => {
    const newCoordinates = { lat: evt.viewState.latitude, lng: evt.viewState.longitude }
    const movedDistance = distanceInMiles(coordinates.lat, coordinates.lng, newCoordinates.lat, newCoordinates.lng)

    if (movedDistance > 0.5) {
      setCoordinates(newCoordinates)
    }
  }

  if (!viewport.latitude || !viewport.longitude) {
    return <div>Loading...</div>
  }

  return (
    <Map
      {...viewport}
      onMove={evt => setViewport(evt.viewState)}
      onMoveEnd={handleMoveEnd}
      style={{ width: 800, height: 600 }}
      mapStyle='mapbox://styles/mapbox/streets-v11'
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {userLocation.latitude && userLocation.longitude && (
        <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} color='red' />
      )}
      {places &&
        places.length > 0 &&
        places.map((place, index) => {
          console.log({ place })
          if (place.Longitude && place.Latitude) {
            return (
              <Marker key={index} longitude={place.Longitude} latitude={place.Latitude} color='blue'>
                <Marker2 place={place} setChildClicked={() => setChildClicked(index)} />
              </Marker>
            )
          }
          return null
        })}
    </Map>
  )
}
