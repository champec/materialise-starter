import { supabaseOrg as supabase } from 'src/configs/supabase'
import questions from './triageQuestions'

export const fetchServices = async () => {
  const { data, error } = await supabase.from('ps_services').select('*')
  if (error) console.error('Error fetching services:', error)
  return data || []
}

export const fetchServiceStages = async () => {
  const { data, error } = await supabase
    .from('ps_service_stages')
    .select(
      `
      id,
      name,
      ps_services (
        id,
        name
      )
    `
    )
    .in('id', [
      'aa0bb38d-a436-4076-88e8-2b9caa704e47',
      'f0d678b9-e776-4e69-908f-a9db1634a9f5',
      'eccd2387-75b9-4acb-802a-133e4d6c161b',
      '8c4420cd-2ffb-4ade-8281-7b4c730b0909',
      '6b1611ef-134c-421f-a736-b7b8c0841515',
      '5957b831-163e-428e-9386-34b093bf0e2b',
      '89421045-4162-4b8d-937d-daddae7256c6',
      '38d450b9-24c3-46fa-a64f-a0a57526a16f',
      '705e97e4-8f2d-420d-b990-cb7bf01a400f'
    ])
  if (error) console.error('Error fetching service stages:', error)
  return data || []
}

// Fetch pharmacies and preselect the first 5
// Fetch pharmacies and preselect the first 5
export const fetchPharmaciesByLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          const { data, error } = await supabase.rpc('get_nearby_pharmacies', {
            lat,
            lon,
            radius: 8047 // 5 miles in meters
          })

          if (error) {
            console.error('Error fetching pharmacies:', error)
            reject([]) // Reject with an empty array or the error, depending on your error handling preference
          } else {
            console.log('Pharmacies found:', data, 'location:', lat, lon)
            const limitedData = data.slice(0, 5) // Limit to first 5 pharmacies
            console.log('Limited data:', limitedData)
            resolve(limitedData) // Resolve with the limited data
          }
        },
        error => {
          console.error('Error getting location:', error)
          alert('Unable to get your current location. Please try using a postcode instead.')
          reject([]) // Reject with an empty array if geolocation fails
        }
      )
    } else {
      alert('Geolocation is not supported by your browser. Please use a postcode instead.')
      reject([]) // Reject with an empty array if geolocation is not supported
    }
  })
}

export const fetchPharmacyByODS = async odsCode => {
  // take the selected odsCode sanitize it and search in the public.pharmacies table for a matching odsCode limit to 5
  const sanitizedODSCode = odsCode.replace(/\s+/g, '').toUpperCase()
  const { data, error } = await supabase.from('pharmacies').select('*').eq('ods_code', sanitizedODSCode).limit(5)

  if (error) console.error('Error fetching pharmacy:', error)
  return data || []
}

export const fetchPharmaciesByPostcode = async postcode => {
  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${postcode}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
  )
  console.log('Geoapify API Response:', response)
  const data = await response.json()
  const lat = data.features[0]?.properties?.lat
  const lon = data.features[0]?.properties?.lon

  console.log('Geoapify API Response:', { postcode, lat, lon })

  const { data: pharmacies, error } = await supabase.rpc('get_nearby_pharmacies', {
    lat,
    lon,
    radius: 8047 // 5 miles in meters
  })
  // limit to 5
  const limitedData = pharmacies?.slice(0, 5) || []
  console.log('Limited data:', limitedData, pharmacies)
  if (error) console.error('Error fetching pharmacy:', error)
  return limitedData || []
}

export const fetchAvailableSlots = async (
  selectedDate,
  selectedPharmacies,
  selectedServiceStage,
  serviceStages,
  setAvailableSlots
) => {
  if (!selectedDate || selectedPharmacies.length === 0) return

  const startOfDay = new Date(selectedDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setHours(23, 59, 59, 999)

  const formattedRange = `[${startOfDay.toISOString()},${endOfDay.toISOString()}]`

  // console.log('Selected Pharmacies:', selectedPharmacies)
  // console.log('Selected Service Stage:', selectedServiceStage)
  console.log('Selected Service:', selectedServiceStage)
  // console.log('Formatted Range:', formattedRange)

  const selectedStage = serviceStages.find(stage => stage.id === selectedServiceStage)
  console.log('selectedStage', selectedStage, serviceStages, selectedServiceStage)
  const serviceId = selectedStage.ps_services.id

  // filter out pharmacies with no id value
  const pharmaciesWithId = selectedPharmacies.filter(pharmacy => pharmacy.id)
  console.log('Pharmacies with ID:', pharmaciesWithId)
  const availabilitiesPromises = pharmaciesWithId.map(pharmacy =>
    supabase
      .from('ps_service_availability')
      .select('*')
      .eq('pharmacy_id', pharmacy.id)
      .eq('service_id', serviceId)
      .overlaps('duration', formattedRange)
  )

  const bookingsPromises = pharmaciesWithId.map(pharmacy =>
    supabase
      .from('ps_appointments')
      .select('*')
      .eq('pharmacy_id', pharmacy.id)
      .eq('service_id', serviceId)
      .gte('scheduled_time', startOfDay.toISOString())
      .lt('scheduled_time', endOfDay.toISOString())
  )

  const availabilitiesResults = await Promise.all(availabilitiesPromises)
  const bookingsResults = await Promise.all(bookingsPromises)

  console.log('Availabilities Results:', availabilitiesResults)
  console.log('Bookings Results:', bookingsResults)

  const allSlots = pharmaciesWithId.map((pharmacy, index) => {
    const availabilities = availabilitiesResults[index].data || []
    const bookings = bookingsResults[index].data || []

    const slots = availabilities.flatMap(availability => {
      const duration = availability.duration.replace(/[\[\]()]/g, '')
      const [start, end] = duration.split(',').map(time => new Date(time.trim().replace(/"/g, '')))

      const availableSlots = []
      const slotDuration = 30 * 60 * 1000 // 30 minutes in milliseconds

      for (let time = start; time < end; time = new Date(time.getTime() + slotDuration)) {
        if (time >= startOfDay && time < endOfDay) {
          const isBooked = bookings.some(booking => new Date(booking.scheduled_time).getTime() === time.getTime())
          availableSlots.push({
            time: new Date(time),
            isBooked
          })
        }
      }

      return availableSlots
    })

    return {
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.organisation_name,
      slots: slots
    }
  })

  setAvailableSlots(allSlots)
}

export const handleBooking = async (bookingDetails, onSuccess, onError) => {
  const { data, error } = await supabase.from('ps_appointments').insert(bookingDetails)

  if (error) {
    console.error('Booking failed:', error)
    onError && onError(error)
  } else {
    console.log('Booking successful:', data)
    onSuccess && onSuccess(data)
  }
}

export const getTriageQuestions = serviceStageId => {
  return questions[serviceStageId] || []
}

//set up open ai completion dangroudly allow browser to access the api key
