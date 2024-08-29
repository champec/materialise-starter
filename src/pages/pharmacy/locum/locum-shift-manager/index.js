import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import withReducer from 'src/@core/HOC/withReducer'
import locumShiftSlice from '../../../../store/apps/locum/locum/locumLocumSlice'
import * as thunks from '../../../../store/apps/locum/locum/locumShiftThunks'

function LocumShiftManagement() {
  const dispatch = useDispatch()
  const { bookedShifts, availableShifts, status, error } = useSelector(state => state.locumShift)
  const [searchParams, setSearchParams] = useState({
    startDate: new Date().toISOString().split('T')[0], // Today's date
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    location: ''
  })

  useEffect(() => {
    dispatch(thunks.fetchLocumBookedShifts())
    dispatch(thunks.fetchAvailableShifts(searchParams))
  }, [dispatch, searchParams])

  const handleSearchChange = e => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value })
  }

  const handleBookShift = shiftId => {
    dispatch(thunks.bookShift(shiftId))
  }

  if (status === 'loading') return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Locum Shift Management</h1>

      <section>
        <h2>Your Booked Shifts</h2>
        {bookedShifts.map(shift => (
          <div key={shift.id}>
            <p>Date: {shift.date}</p>
            <p>
              Time: {shift.start_time} - {shift.end_time}
            </p>
            <p>Rate: £{shift.rate}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Find Available Shifts</h2>
        <input type='date' name='startDate' value={searchParams.startDate} onChange={handleSearchChange} />
        <input type='date' name='endDate' value={searchParams.endDate} onChange={handleSearchChange} />
        <input
          type='text'
          name='location'
          value={searchParams.location}
          onChange={handleSearchChange}
          placeholder='Enter location'
        />

        {availableShifts.map(shift => (
          <div key={shift.id}>
            <p>Date: {shift.date}</p>
            <p>
              Time: {shift.start_time} - {shift.end_time}
            </p>
            <p>Rate: £{shift.rate}</p>
            <button onClick={() => handleBookShift(shift.id)}>Book Shift</button>
          </div>
        ))}
      </section>
    </div>
  )
}

export default withReducer({ locumShift: locumShiftSlice })(LocumShiftManagement)
