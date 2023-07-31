import { useState, useEffect } from 'react'

//! to do need to indicate which pharmacies shown are on pharmeEx, handle adding unregistered pharmacies, order connected pharmacies at top of list
//! enrich data with profiles data

// ** Next Import
import Link from 'next/link'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import OptionsMenu from 'src/@core/components/option-menu'

const Connections = ({ pharmData, nhsData }) => {
  const orgId = pharmData?.id
  const [data, setData] = useState([])
  const lat = nhsData?.latitude // You would fetch this from the auth or wherever the current organisation's lat and lon are stored
  const lon = nhsData?.longitude
  const radius = 100 // Radius in meters

  console.log({ lat, lon, orgId })

  const fetchNearbyPharmacies = async (orgId, lat, lon, radius) => {
    try {
      // Fetch the nearby pharmacies using the get_nearby_pharmacies function
      const { data: pharmacies, error: pharmaciesError } = await supabase.rpc('get_nearby_pharmacies', {
        lat,
        lon,
        radius
      })

      // If there is an error, throw it
      if (pharmaciesError) throw pharmaciesError

      // Fetch the connections of the current pharmacy
      const { data: connections, error: connectionsError } = await supabase
        .from('organisation_connections')
        .select('organisation_1, organisation_2')
        .or(`organisation_1.eq.${orgId},organisation_2.eq.${orgId}`)

      // If there is an error, throw it
      if (connectionsError) throw connectionsError

      // Create a set of connected pharmacy IDs for easy lookup
      const connectedPharmacyIds = new Set(
        connections.flatMap(({ organisation_1, organisation_2 }) =>
          [organisation_1, organisation_2].filter(id => id !== orgId)
        )
      )

      // Add the connection status to the pharmacies
      pharmacies.forEach(pharmacy => {
        pharmacy.isConnected = connectedPharmacyIds.has(pharmacy.id)
      })

      return pharmacies
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error)
    }
  }

  const toggleConnection = async (orgId, pharmacyId, isConnected) => {
    try {
      // If the pharmacies are connected, remove the connection
      if (isConnected) {
        const { error } = await supabase
          .from('organisation_connections')
          .delete()
          .or(`organisation_1.eq.${orgId},organisation_2.eq.${orgId}`)
          .or(`organisation_1.eq.${pharmacyId},organisation_2.eq.${pharmacyId}`)

        // If there is an error, throw it
        if (error) throw error
      }
      // If the pharmacies are not connected, create a connection
      else {
        const { error } = await supabase
          .from('organisation_connections')
          .insert([{ organisation_1: orgId, organisation_2: pharmacyId, action_by: orgId, status: 'connected' }])

        // If there is an error, throw it
        if (error) throw error
      }
    } catch (error) {
      console.error('Error toggling connection:', error)
    }
  }

  useEffect(() => {
    fetchNearbyPharmacies(orgId, lat, lon, radius).then(pharmacies => setData(pharmacies))
    console.log({ data })
  }, [orgId, lat, lon, radius])

  return (
    <Grid container spacing={6}>
      {data &&
        Array.isArray(data) &&
        data.map((item, index) => {
          return (
            <Grid key={index} item xs={12} sm={6} md={4}>
              <Card sx={{ position: 'relative' }}>
                <OptionsMenu
                  iconButtonProps={{ size: 'small', sx: { top: 12, right: 12, position: 'absolute' } }}
                  options={[
                    'Share Connection',
                    'Block Connection',
                    { divider: true },
                    { text: 'Delete', menuItemProps: { sx: { color: 'error.main' } } }
                  ]}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Avatar src={item.avatar} sx={{ mb: 4, width: 100, height: 100 }} />
                    <Typography variant='h6' sx={{ fontWeight: 500 }}>
                      {item.organisation_name}
                    </Typography>
                    <Typography sx={{ mb: 4, color: 'text.secondary' }}>{item.address1}</Typography>
                    <Box sx={{ mb: 8, display: 'flex', alignItems: 'center' }}>
                      {item.chips &&
                        item.chips.map((chip, index) => (
                          <Box
                            href='/'
                            key={index}
                            component={Link}
                            onClick={e => e.preventDefault()}
                            sx={{
                              textDecoration: 'none',
                              '&:not(:last-of-type)': { mr: 3 },
                              '& .MuiChip-root': { cursor: 'pointer' }
                            }}
                          >
                            <CustomChip size='small' skin='light' color={chip.color} label={chip.title} />
                          </Box>
                        ))}
                    </Box>
                    <Box
                      sx={{
                        mb: 8,
                        gap: 2,
                        width: '100%',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <Typography variant='h5'>{item.projects}</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>Projects</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <Typography variant='h5'>{item.tasks}</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>Tasks</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <Typography variant='h5'>{item.connections}</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>Connections</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        sx={{ mr: 4 }}
                        variant={item.isConnected ? 'contained' : 'outlined'}
                        startIcon={
                          <Icon
                            fontSize={20}
                            icon={item.isConnected ? 'mdi:account-check-outline' : 'mdi:account-plus-outline'}
                          />
                        }
                        onClick={() =>
                          toggleConnection(orgId, item.id, item.isConnected).then(() => {
                            // After the connection status changes, re-fetch the nearby pharmacies
                            fetchNearbyPharmacies(orgId, lat, lon, radius).then(pharmacies => setData(pharmacies))
                          })
                        }
                      >
                        {item.isConnected ? 'Connected' : 'Connect'}
                      </Button>
                      <Button variant='outlined' color='secondary' sx={{ p: 1.5, minWidth: 38 }}>
                        <Icon icon='mdi:email-outline' />
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
    </Grid>
  )
}

export default Connections
