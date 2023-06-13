//** React imports
import { useRef, useEffect, useState, use } from 'react'

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

const Finder = () => {
  const refContainer = useRef(null)
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

  const [places, setPlaces] = useState([])
  const [coordinates, setCoordinates] = useStableCoordinates({ lat: null, lng: null })
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const [childClicked, setChildClicked] = useState()
  const { setLoading, setMessage, loading } = useLoading()
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null })
  const [viewport, setViewport] = useState({ latitude: null, longitude: null, zoom: 14 })
  const [locationSource, setLocationSource] = useState('browser')

  // const [loading, setLoading] = useState(false)

  const toggleLocationSource = () => {
    setLocationSource(prevSource => (prevSource === 'supabase' ? 'browser' : 'supabase'))
  }

  const fetchServices = async coords => {
    if (!initialDataLoaded) {
      setLoading(true)
      setMessage({ text: 'Loading data...', severity: 'info' })
    }
    const data = await getNHSServiceData(coords)
    console.log('DATA', data)
    setPlaces(data)
    if (!initialDataLoaded) {
      setLoading(false)
      setInitialDataLoaded(true)
    }
  }
  const recenterMap = () => {
    const newViewport = { ...viewport, latitude: userLocation.latitude, longitude: userLocation.longitude }
    setViewport(newViewport)
    fetchServices({ lat: userLocation.latitude, lng: userLocation.longitude })
  }

  useEffect(() => {
    // getPlacesData(coordinates).then(res => {
    //   console.log('RES API', res)
    // setPlaces(res)
    // setLoading(false)
    // })

    fetchServices(coordinates)
  }, [coordinates])

  useEffect(() => {
    refContainer.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  if (!initialDataLoaded) return <CircularProgress />
  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title='Service Finder 🙌'></CardHeader>
            <CardContent>
              <Typography sx={{ mb: 2 }}>This is your second pag.</Typography>
              <Typography>
                Chocolate sesame snaps pie carrot cake pastry pie lollipop muffin. Carrot cake dragée chupa chups
                jujubes. Macaroon liquorice cookie wafer tart marzipan bonbon. Gingerbread jelly-o dragée chocolate.
                <Button variant='contained' onClick={recenterMap}>
                  Recenter Map
                </Button>
                <Button variant='contained' onClick={toggleLocationSource}>
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
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                viewport={viewport}
                setViewport={setViewport}
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
