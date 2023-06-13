import { supabaseOrg } from 'src/configs/supabase'

async function getBroadcasts() {
  const { data, error } = await supabaseOrg.from('broadcasts').select('*, profiles:to(*)')

  if (error) {
    console.error('Error fetching broadcasts', error)
    return
  }

  return data
}

const dummyData = {
  filter: {},
  mails: [],
  selectedMails: []
}

// Exporting both dummyData and getBroadcasts
export { dummyData, getBroadcasts }
