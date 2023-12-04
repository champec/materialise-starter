import React from 'react'

export default function AppointmentView({ appointment }) {
  //stringify the appointment object
  const json = JSON.stringify(appointment)
  return <div>{json}</div>
}
