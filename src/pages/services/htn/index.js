import React from 'react'
import ServiceAppointmentList from 'src/views/apps/Calendar/services/commonformelements/AppointmentList'
import { setSelectedService } from 'src/store/apps/services'
import { fetchCalendarTypes } from 'src/store/apps/calendar'
import { useDispatch } from 'react-redux'
import { CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import withReducer from 'src/@core/HOC/withReducer'
import servicesSlice from 'src/store/apps/services'

function index() {
  const [loading, setLoading] = React.useState(false)
  const [locallySelectedService, setLocallySelectedService] = React.useState(null)
  const dispatch = useDispatch()
  // get the last part of the url

  const router = useRouter()
  const { service } = router.query

  console.log('SERVICE', service)

  const setAppointmentType = async () => {
    setLoading(true)
    const response = await dispatch(fetchCalendarTypes())
    console.log('PAYLOAD', response)
    // get the nms calendar type
    if (response.error) {
      console.log('ERROR', payload.error)
      setLoading(false)
      return
    }

    const nms = response.payload.find(calendar => calendar.title === service)
    console.log('NMS', nms)
    setLocallySelectedService(nms)
    dispatch(setSelectedService(nms))
    setLoading(false)
  }

  React.useEffect(() => {
    if (service) {
      setAppointmentType()
    }
  }, [service])

  const customColumns = [
    {
      flex: 0.1,
      minWidth: 90,
      field: 'taken_date',
      headerName: 'Date Taken',
      renderCell: ({ row }) => {
        console.log('HTN ROW', row)
        return row.service_htn.taken_date
      }
    },
    {
      flex: 0.1,
      minWidth: 90,
      field: 'Age',
      headerName: 'Age',
      renderCell: ({ row }) => {
        return row.service_htn.age
      }
    }
  ]

  if (loading || !locallySelectedService) {
    return <CircularProgress />
  }

  return (
    <div>
      <ServiceAppointmentList customColumns={customColumns} locallySelectedService={locallySelectedService} />
    </div>
  )
}

// export default index
export default withReducer('services', servicesSlice)(index)
