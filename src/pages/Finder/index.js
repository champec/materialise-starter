//** React imports
import { useRef, useEffect, useState, use } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'

//** Component Imports
import Header from 'src/@core/layouts/components/Maps/Header'
import List from 'src/@core/layouts/components/Maps/List'
import PlaceDetails from 'src/@core/layouts/components/Maps/PlaceDetails'
import Map from 'src/@core/layouts/components/Maps/Map'

//** Hooks */
import { useLoading } from 'src/context/loadingContext'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Button, CircularProgress } from '@mui/material'

import { getPlacesData, getNHSServiceData } from 'src/API'

// ** RTK imports
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchServicesFromSupabase,
  toggleLocationSource,
  fetchUserLocationFromBrowser,
  setStateLocation,
  updateBrowserLocation,
  setViewport
} from 'src/store/apps/finder'

const Finder = () => {
  const refContainer = useRef(null)
  const dispatch = useDispatch()

  const { coords, locationSource, loading, places, viewport } = useSelector(state => state.finder)
  const { latitude, longitude } = useSelector(state => state.organisation.organisation.pharmacies)

  useEffect(() => {
    dispatch(setStateLocation({ latitude, longitude }))
    dispatch(fetchUserLocationFromBrowser())
      .then(action => {
        if (fetchUserLocationFromBrowser.fulfilled.match(action)) {
          const { latitude, longitude } = action.payload
          dispatch(updateBrowserLocation({ latitude, longitude }))
        }
      })
      .catch(err => {
        console.error(err)
      })
  }, [latitude, longitude, dispatch])

  function useStableCoordinates(initialCoordinates) {
    const coordinatesRef = useRef(initialCoordinates)
    const [coordinates, _setCoordinates] = useState(initialCoordinates)

    const setCoordinates = newCoordinates => {
      if (newCoordinates.lat !== coordinatesRef.current.lat || newCoordinates.lng !== coordinatesRef.current.lng) {
        coordinatesRef.current = newCoordinates
        _setCoordinates(newCoordinates)
      }
    }

    return [coordinates, setCoordinates]
  }

  //custom hook
  const [coordinates, setCoordinates] = useStableCoordinates({ lat: latitude, lng: longitude })
  //states
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const [childClicked, setChildClicked] = useState()
  const [userLocation, setUserLocation] = useState({ latitude: latitude, longitude: longitude })

  const handleToggleSource = () => {
    dispatch(toggleLocationSource())
  }

  const normaliseCoords = coords => {
    if (coords.latitude && coords.longitude) {
      return { lat: coords.latitude, lng: coords.longitude }
    } else if (coords.lat && coords.lng) {
      return { lat: coords.lat, lng: coords.lng }
    }
    return null
  }

  useEffect(() => {
    if (coordinates) {
      const normcoords = normaliseCoords(coordinates)
      dispatch(fetchServicesFromSupabase(normcoords))
    }
  }, [coordinates, dispatch])

  useEffect(() => {
    if (coords) {
      const normcoords = normaliseCoords(coords)
      dispatch(fetchServicesFromSupabase(normcoords))
    }
  }, [coords, dispatch])

  const recenterMap = () => {
    const newViewport = { ...viewport, latitude: userLocation.latitude, longitude: userLocation.longitude }
    setViewport(newViewport)
    fetchServices({ lat: userLocation.latitude, lng: userLocation.longitude })
  }

  const updateViewport = newViewport => {
    dispatch(setViewport(newViewport))
  }

  useEffect(() => {
    refContainer.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  if (loading) return <CircularProgress />
  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title='Service Finder 🙌'></CardHeader>
            <CardContent>
              <Typography sx={{ mb: 2 }}>This is your second page.</Typography>
              <Typography>
                Chocolate sesame snaps pie carrot cake pastry pie lollipop muffin. Carrot cake dragée chupa chups
                jujubes. Macaroon liquorice cookie wafer tart marzipan bonbon. Gingerbread jelly-o dragée chocolate.
                <Button variant='contained' onClick={recenterMap}>
                  Recenter Map
                </Button>
                <Button variant='contained' onClick={handleToggleSource}>
                  Toggle Location Source {locationSource}
                </Button>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <List places={places} childClicked={childClicked} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Map
                setCoordinates={setCoordinates}
                coordinates={coordinates}
                places={places}
                setChildClicked={setChildClicked}
                userLocation={coords}
                setUserLocation={setUserLocation}
                viewport={viewport}
                setViewport={updateViewport}
                locationSource={locationSource}
              />
              <div ref={refContainer}></div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default Finder
