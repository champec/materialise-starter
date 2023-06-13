import axios from 'axios'
import { supabaseOrg } from 'src/configs/supabase'

// const getPlacesData = async () => {
//   var config = {
//     method: 'GET',
//     url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=52.4969353,-2.0258233&radius=1500&type=pharmacy&key=AIzaSyCZMa6ce0vMD7mZghlcfeFHr7m6PwDQKKQ',
//     headers: { googleMapsApiKey: 'AIzaSyCZMa6ce0vMD7mZghlcfeFHr7m6PwDQKKQ' }
//   }

//   axios(config)
//     .then(function (response) {
//       console.log(JSON.stringify(response.data))
//     })
//     .catch(function (error) {
//       console.log(error)
//     })
// }

const supabase = supabaseOrg

const getPlacesData = async coordinates => {
  var myHeaders = new Headers()
  myHeaders.append('subscription-key', '6962cbaffb4b44ed9163179d027afccc')
  myHeaders.append('content-type', 'application/json')

  //   console.log('ORIGINAL', "geo.distance(Geocode, geography'POINT(-2.24 53.47)')")
  console.log('TEMPLATE', `geo.distance(Geocode, geography'POINT(${coordinates?.lat} ${coordinates?.lng})')')`)

  var raw = JSON.stringify({
    filter: "OrganisationTypeID eq 'PHA'",
    orderby: `geo.distance(Geocode, geography'POINT(${coordinates?.lng} ${coordinates?.lat})')`,
    select:
      'OrganisationName, NACSCode, OpeningTimes, Latitude,Longitude, Contacts, Address1, City, County, Postcode, ServicesProvided ',
    top: 5,
    skip: 0,
    count: true
  })

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  }

  const { value } =
    (await fetch('https://api.nhs.uk/service-search/search?api-version=1', requestOptions)
      .then(response => response.text())
      .then(result => {
        return JSON.parse(result)
      })
      .catch(error => console.log('error', error))) || {}

  return value
}

const getNHSServiceData = async (coordinates, radius = 1500) => {
  const { data, error } = await supabase.rpc('get_nearby_pharmacies', {
    lat: coordinates.lat,
    lon: coordinates.lng,
    radius: radius // adjust the radius according to your needs
  })

  if (error) {
    console.error('Error fetching nearby pharmacies:', error)
    return []
  }

  return data
  // console.log(data)
  // Transform the data to match the format expected by your application
  // return data.map(pharmacy => ({
  //   name: pharmacy.name,
  //   location: {
  //     lat: pharmacy.location.y, // PostGIS returns the coordinates as (x, y), where x is longitude and y is latitude
  //     lng: pharmacy.location.x
  //   }
  //   // add other fields as needed
  // }))
}

export { getPlacesData, getNHSServiceData }
