import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { distanceInMiles } from 'src/@core/utils/distanceInMiles'
import Marker2 from 'src/@core/components/Map/Marker'

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
  const handleMoveEnd = evt => {
    const newCoordinates = { lat: evt.viewState.latitude, lng: evt.viewState.longitude }
    const movedDistance = distanceInMiles(coordinates.lat, coordinates.lng, newCoordinates.lat, newCoordinates.lng)

    if (movedDistance > 0.5) {
      console.log('map set coords', newCoordinates)
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
