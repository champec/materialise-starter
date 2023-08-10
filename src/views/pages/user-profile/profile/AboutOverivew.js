// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const extractInfo = item => {
  switch (true) {
    case !!item.ServiceName:
      return { property: 'ServiceName', value: item.ServiceName }
    case !!item.ContactValue:
      return { property: 'ContactMethodType', value: item.ContactValue }
    case !!item.Weekday:
      return { property: 'Weekday', value: item.Weekday }
    default:
      return null
  }
}

const renderList = arr => {
  if (arr && arr.length) {
    return arr.map((item, index) => {
      const info = extractInfo(item)
      if (info) {
        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              '&:not(:last-of-type)': { mb: 4 },
              '& svg': { color: 'text.secondary' }
            }}
          >
            <Icon icon={item.icon} />

            <Typography sx={{ mx: 2, fontWeight: 600, color: 'text.secondary' }}>
              {`${info.property.charAt(0).toUpperCase() + info.property.slice(1)}:`}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {info.value.charAt(0).toUpperCase() + info.value.slice(1)}
            </Typography>
          </Box>
        )
      }
      return null
    })
  } else {
    return null
  }
}

const AboutOverivew = props => {
  const { teams, data } = props

  let about = []
  let contacts = []
  let overview = []

  if (data && data.pharmacies) {
    about = JSON.parse(data.pharmacies.services || '[]')
    contacts = JSON.parse(data.pharmacies.contacts || '[]')
    overview = JSON.parse(data.pharmacies.opening_times || '[]')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            {about.length > 0 && (
              <Box sx={{ mb: 7 }}>
                <Typography variant='body2' sx={{ mb: 4, color: 'text.disabled', textTransform: 'uppercase' }}>
                  About
                </Typography>
                {renderList(about)}
              </Box>
            )}

            {contacts.length > 0 && (
              <Box sx={{ mb: 7 }}>
                <Typography variant='body2' sx={{ mb: 4, color: 'text.disabled', textTransform: 'uppercase' }}>
                  Contacts
                </Typography>
                {renderList(contacts)}
              </Box>
            )}

            {teams && teams.length > 0 && (
              <div>
                <Typography variant='body2' sx={{ mb: 4, color: 'text.disabled', textTransform: 'uppercase' }}>
                  Teams
                </Typography>
                {renderList(teams)}
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
      {overview.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <div>
                <Typography variant='body2' sx={{ mb: 4, color: 'text.disabled', textTransform: 'uppercase' }}>
                  Overview
                </Typography>
                {renderList(overview)}
              </div>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default AboutOverivew
