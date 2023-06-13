import React from 'react'

function Marker({ place, setChildClicked }) {
  const nameWords = place?.organisation_name.split(' ')
  const firstName = nameWords[0]

  const handleClick = () => {
    if (setChildClicked) {
      setChildClicked()
    }
  }

  return (
    <svg
      id='em8optQ9qaI1'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      viewBox='0 0 300 300'
      shapeRendering='geometricPrecision'
      textRendering='geometricPrecision'
      width={60}
      onClick={handleClick}
    >
      <path
        d='M0,108.759918l39.04532-60.21467h100.451784v-13.32923l-13.32921-.02151.05197-32.20783h13.27724v-20.970865h32.20787v21.044255l13.32921.02151-.05197,32.20783-13.27724-.02142v13.27726h91.255972L300,108.759918h-37.039054v121.290067h-36.882974l-74.210849,51.965828-5.105415-51.965828h-107.716388v-121.290067h-39.04532Z'
        transform='translate(0 17.984187)'
        fill='#282A42'
        strokeWidth='0'
      />
      <text x='65' y='180' fill='white' fontSize={50}>
        {firstName}
      </text>
    </svg>
  )
}

export default Marker
