//** React imports
import { useRef, useEffect, useState } from 'react'

//** Component Imports
import Header from 'src/@core/layouts/components/Maps/Header'
import List from 'src/@core/layouts/components/Maps/List'
import PlaceDetails from 'src/@core/layouts/components/Maps/PlaceDetails'
import Map from 'src/@core/layouts/components/Maps/Map'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import { getPlacesData } from 'src/API'

const Finder = () => {
  const refContainer = useRef(null)
  const [places, setPlaces] = useState([])
  const [coordinates, setCoordinates] = useState({ lat: -2.24, lng: 53.47 })
  const [childClicked, setChildClicked] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPlacesData(coordinates).then(res => {
      setPlaces(res)
      setLoading(false)
    })
  }, [coordinates])

  useEffect(() => {
    refContainer.current.scrollIntoView({ behavior: 'smooth' })
  }, [])

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
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <List places={places} childClicked={childClicked} loading={loading} />
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
