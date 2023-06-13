import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { distanceInMiles } from 'src/@core/utils/distanceInMiles'
import Marker2 from 'src/@core/components/Map/Marker'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { supabaseOrg } from 'src/configs/supabase'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN // Set your mapbox token here

export default function MapComponent({
  places,
  setCoordinates,
  coordinates,
  setChildClicked,
  viewport,
  setViewport,
  userLocation,
  setUserLocation,
  locationSource
}) {
  //this is a custom hook to prevent the locaiton object, from rerendering everytime. object are shallow copies, so they will always rerender even if values are the same
  function useStableCoordinates(initialCoordinates) {
    const coordinatesRef = useRef(initialCoordinates)

    const setCoordinates = newCoordinates => {
      if (newCoordinates.lat !== coordinatesRef.current.lat || newCoordinates.lng !== coordinatesRef.current.lng) {
        coordinatesRef.current = newCoordinates
      }
    }

    return [coordinatesRef.current, setCoordinates]
  }

  const supabase = supabaseOrg
  const ODS = useOrgAuth().organisation?.ODS

  // supabase location

  useEffect(() => {
    if (locationSource !== 'supabase') return
    console.log('running fetch useEffect')
    // Fetch location from Supabase
    const fetchLocation = async () => {
      const { data, error } = await supabase.from('pharmacies').select('latitude, longitude').eq('ods_code', ODS)
      console.log(data, error, ODS)
      if (error) {
        console.error('Error fetching location:', error)
      } else if (data && data.length > 0) {
        const location = data[0]
        console.log({ location })
        setViewport({
          latitude: location.latitude,
          longitude: location.longitude,
          zoom: 14
        })
        setCoordinates({
          lat: location.latitude,
          lng: location.longitude
        })
        setUserLocation({
          latitude: location.latitude,
          longitude: location.longitude
        })
      }
    }
    fetchLocation()
  }, [ODS, locationSource])

  // end of supabase location

  // real time location

  useEffect(() => {
    if (locationSource !== 'browser') return
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
    if (locationSource !== 'browser') return
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
  }, [locationSource])

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
          if (place.longitude && place.latitude) {
            return (
              <Marker key={index} longitude={place.longitude} latitude={place.latitude} color='blue'>
                <Marker2 place={place} setChildClicked={() => setChildClicked(index)} />
              </Marker>
            )
          }
          return null
        })}
    </Map>
  )
}
