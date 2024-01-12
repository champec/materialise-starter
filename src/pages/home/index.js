import { useState } from 'react'
import { supabaseOrg } from 'src/configs/supabase'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Button } from '@mui/material'

const supabase = supabaseOrg

const nhsApiUrl = process.env.NEXT_PUBLIC_NHS_API_URL
const headers = {
  'subscription-key': process.env.NEXT_PUBLIC_NHS_API_KEY
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const Home = () => {
  const [process, setProcess] = useState('')

  async function fetchPharmaciesPage(skip, limit) {
    setProcess(`Fetching page ${skip / limit + 1} of pharmacies`)
    const response = await fetch(`${nhsApiUrl}&$skip=${skip}&$top=${limit}&$filter=OrganisationTypeId eq 'PHA'`, {
      headers
    })
    if (!response.ok) {
      // If not, throw an error with the status text
      throw new Error(response.statusText)
    }
    const data = await response.json()
    return data.value
  }

  async function fetchAllPharmacies(startBatch = 1) {
    setProcess('Fetching pharmacies')
    let skip = (startBatch - 1) * 1000
    const limit = 1000
    while (true) {
      try {
        const pharmacies = await fetchPharmaciesPage(skip, limit)
        if (pharmacies.length === 0) {
          // No more pharmacies to fetch, break the loop
          break
        }
        const pharmaciesToInsert = pharmacies.map(pharmacy => ({
          ods_code: pharmacy.ODSCode,
          organisation_name: pharmacy.OrganisationName,
          organisation_type_id: pharmacy.OrganisationTypeId,
          organisation_type: pharmacy.OrganisationType,
          organisation_status: pharmacy.OrganisationStatus,
          address1: pharmacy.Address1,
          city: pharmacy.City,
          county: pharmacy.County,
          latitude: pharmacy.Latitude,
          longitude: pharmacy.Longitude,
          postcode: pharmacy.Postcode,
          opening_times: JSON.stringify(pharmacy.OpeningTimes),
          contacts: JSON.stringify(pharmacy.Contacts),
          services: JSON.stringify(pharmacy.Services)
        }))
        await insertPharmaciesBatch(pharmaciesToInsert)
        skip += pharmacies.length
      } catch (error) {
        console.error('Error fetching pharmacies:', error)
        // If a CORS error occurs, increment the batch number and continue
        if (error.message.includes('CORS')) {
          startBatch++
          skip = (startBatch - 1) * 1000
          continue
        } else {
          // If it's a different error, rethrow it
          throw error
        }
      }
    }
  }

  async function insertPharmaciesBatch(pharmacies) {
    setProcess(`Inserting ${pharmacies.length} pharmacies`)
    const { error } = await supabase.from('pharmacies').upsert(pharmacies, { onConflict: ['ods_code'] })
    if (error) throw error
  }

  const updatePharmacies = async () => {
    await fetchAllPharmacies(11).catch(console.error)
    setProcess('Done')
  }

  async function getTotalPharmaciesCount() {
    const response = await fetch(`${nhsApiUrl}&$filter=OrganisationTypeId eq 'PHA'&$count=true`, { headers })
    const data = await response.json()
    console.log(`Total pharmacies count: ${data['@odata.count']}`)
    return data['@odata.count']
  }

  const totalPharmaciesCount = getTotalPharmaciesCount()

  async function fetchDrugData() {
    const response = await fetch('https://bnf.nice.org.uk/page-data/drugs/page-data.json')
    if (!response.ok) {
      console.log(response.statusText)
      throw new Error(response.statusText)
    }
    const data = await response.json()
    return data.result.data.allDrugs.letters.flatMap(letterGroup => letterGroup.links)
  }

  async function upsertDrugTitlesToSupabase(drugs) {
    const drugsToUpsert = drugs.map(drug => ({
      name: drug.title.replace(' [Specialist drug]', ''), // Remove the [Specialist drug] suffix
      is_specialist: drug.title.includes('[Specialist drug]')
    }))

    const { error } = await supabase.from('bnf_drugs').upsert(drugsToUpsert, { onConflict: 'name' })

    if (error) {
      console.log(error)
      throw error
    }
  }

  const updateAllDrugTitles = async () => {
    try {
      const drugs = await fetchDrugData()
      await upsertDrugTitlesToSupabase(drugs)
      setProcess('All drug titles updated successfully.')
    } catch (error) {
      console.error('Error updating drug titles:', error)
      setProcess('Failed to update drug titles.')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Kick start your project 🚀'></CardHeader>
          <CardHeader title={process}></CardHeader>
          {/* <CardContent>
            <Button variant='contained' color='primary' onClick={updatePharmacies}>
              Update Pharmacies
            </Button>
            <Button variant='contained' color='primary' onClick={updateAllDrugTitles}>
              Update All Drug Titles
            </Button>
            <Button variant='contained' color='primary' onClick={getTotalPharmaciesCount} title='test' />
            <Typography sx={{ mb: 2 }}>All the best for your new project.</Typography>
            <Typography>
              Please make sure to read our Template Documentation to understand where to go from here and how to use our
              template.
            </Typography>
          </CardContent> */}
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='ACL and JWT 🔒'></CardHeader>
          {/* <CardContent>
            <Typography sx={{ mb: 2 }}>
              Access Control (ACL) and Authentication (JWT) are the two main security features of our template and are
              implemented in the starter-kit as well.
            </Typography>
            <Typography>Please read our Authentication and ACL Documentations to get more out of them.</Typography>
          </CardContent> */}
        </Card>
      </Grid>
    </Grid>
  )
}

export default Home
