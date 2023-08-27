import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Thunk to fetch Network and Nearby pharmacies
export const fetchNetworkAndNearby = createAsyncThunk('contacts/fetchNetworkAndNearby', async (_, thunkAPI) => {
  console.log('fetchNetworkAndNearby thunk is about to run')
  const { latitude, longitude } = thunkAPI.getState().organisation.organisation.pharmacies

  let results = {
    network: [],
    nearby: []
  }

  console.log('fetchNetworkAndNearby thun', latitude, longitude)

  // Fetch Network Pharmacies
  const loggedInOrgId = thunkAPI.getState().organisation.organisation.id
  const { data: networkData, error: networkError } = await supabase
    .from('organisation_networks')
    .select('network_organisation_id')
    .eq('organisation_id', loggedInOrgId)
    .eq('status', 'accepted')
  if (networkError) {
    console.log('fetchNetworkAndNearby thunk networkError', networkError)
    throw networkError
  }

  console.log('fetchNetworkAndNearby thunk networkData', networkData)

  if (networkData && networkData.length > 0) {
    const networkIds = networkData.map(entry => entry.friend_org_id)
    const { data: networkDetails, error: networkDetailsError } = await supabase
      .from('organisations')
      .select('*')
      .in('id', networkIds)
    if (networkDetailsError) {
      console.log('fetchNetworkAndNearby thunk networkDetailsError', networkDetailsError)
      throw networkDetailsError
    }
    results.network.push(...networkDetails)
  }

  // Fetch Nearby Pharmacies
  const { data: nearbyData, error: nearbyError } = await supabase.rpc('get_nearby_pharmacies', {
    lat: latitude,
    lon: longitude,
    radius: 2000
  })
  if (nearbyError) throw nearbyError

  console.log('fetchNetworkAndNearby thunk nearbyData', nearbyData)

  const nearbyFiltered = nearbyData.filter(pharmacy => !results.network.some(contact => contact.id === pharmacy.id))
  results.nearby.push(...nearbyFiltered)

  console.log('fetchnework&near results', results)
  return results
})

// Thunk to search among other pharmacies based on a search query
export const searchPharmacies = createAsyncThunk('contacts/searchPharmacies', async ({ searchQuery }, thunkAPI) => {
  console.log('searchPharmacies thunk is about to run')
  let results = {
    others: []
  }

  const alreadyFetchedIds = [
    ...thunkAPI.getState().network.contacts.network,
    ...thunkAPI.getState().network.contacts.nearby
  ].map(contact => contact.id)

  // Invoke the RPC function
  const { data, error } = await supabase.rpc('search_organisations_and_pharmacies', {
    searchquery: searchQuery,
    excludeids: null
  })

  console.log('searchPharmacies thunk data', data)
  if (error) {
    console.log('searchPharmacies thunk error', error)
    throw error
  }

  // No need to combine data or remove duplicates since the RPC function takes care of it
  results.others.push(...data)

  return results
})

// Thunk to fetch pharmacies based on a radius and optional latitude and longitude
export const fetchNearbyByRadius = createAsyncThunk(
  'contacts/fetchNearbyByRadius',
  async ({ radius, latitude = null, longitude = null }, thunkAPI) => {
    if (!latitude || !longitude) {
      const defaultCoords = thunkAPI.getState().organisation.organisation.pharmacies
      latitude = defaultCoords.latitude
      longitude = defaultCoords.longitude
    }

    const { data: nearbyData, error: nearbyError } = await supabase.rpc('get_nearby_pharmacies', {
      lat: latitude,
      lon: longitude,
      radius: radius
    })
    if (nearbyError) throw nearbyError

    return nearbyData
  }
)

export const searchAllContacts = createAsyncThunk('contacts/searchAllContacts', async ({ searchQuery }, thunkAPI) => {
  // Use the same RPC function without providing exclusion criteria
  const { data, error } = await supabase.rpc('search_organisations_and_pharmacies', {
    searchquery: searchQuery,
    excludeids: null
  })

  if (error) throw error

  return data
})

export const addPharmacyToNetwork = createAsyncThunk(
  'contacts/addPharmacyToNetwork',
  async ({ networkOrganisationId }, thunkAPI) => {
    const loggedInOrgId = thunkAPI.getState().organisation.organisation.id

    const response = await supabase.from('organisation_networks').insert([
      {
        organisation_id: loggedInOrgId,
        network_organisation_id: networkOrganisationId,
        initiated_by: loggedInOrgId,
        status: 'pending' // initially setting status as pending
      }
    ])

    if (response.error) throw response.error

    return response.data
  }
)

export const removePharmacyFromNetwork = createAsyncThunk(
  'contacts/removePharmacyFromNetwork',
  async ({ networkOrganisationId }, thunkAPI) => {
    const loggedInOrgId = thunkAPI.getState().organisation.organisation.id

    const response = await supabase.from('organisation_networks').delete().match({
      organisation_id: loggedInOrgId,
      network_organisation_id: networkOrganisationId
    })

    if (response.error) throw response.error

    return networkOrganisationId
  }
)

export const updateFriendshipStatus = createAsyncThunk(
  'contacts/updateFriendshipStatus',
  async ({ networkOrganisationId, status }, thunkAPI) => {
    const loggedInOrgId = thunkAPI.getState().organisation.organisation.id

    const response = await supabase.from('organisation_networks').update({ status }).match({
      organisation_id: loggedInOrgId,
      network_organisation_id: networkOrganisationId
    })

    if (response.error) throw response.error

    return { networkOrganisationId, status }
  }
)

export const fetchRecentContacts = createAsyncThunk('contacts/fetchRecentContacts', async (_, thunkAPI) => {
  const loggedInOrgId = thunkAPI.getState().organisation.organisation.id

  // Fetch the most recent email conversations
  const { data: recentConversations, error: conversationsError } = await supabase
    .from('email_conversations')
    .select('id')
    .eq('sender_id', loggedInOrgId)
    .order('last_message_timestamp', { ascending: false })
    .limit(5) // Adjust this number as needed

  if (conversationsError) throw conversationsError

  const conversationIds = recentConversations.map(convo => convo.id)

  // Fetch distinct recipient IDs using the fetched conversation IDs
  let recipientOrgIds = []
  for (let conversationId of conversationIds) {
    const { data: recipientsData, error: recipientsError } = await supabase
      .from('email_recipients')
      .select('recipient_id')
      .eq('conversation_id', conversationId)
      .distinctOn('recipient_id')

    if (recipientsError) throw recipientsError

    recipientOrgIds = [...recipientOrgIds, ...recipientsData.map(recipient => recipient.recipient_id)]
  }

  // Ensure the list is unique (using a Set for deduplication)
  recipientOrgIds = [...new Set(recipientOrgIds)]

  // Fetch details for these organizations
  const { data: recentContacts, error: contactsError } = await supabase
    .from('organisations')
    .select('*')
    .in('id', recipientOrgIds)

  if (contactsError) throw contactsError

  return recentContacts
})

// The rest of your slice goes here...

// Your fetchContacts thunk goes here...
const networkSlice = createSlice({
  name: 'network',
  initialState: {
    contacts: {
      recent: [],
      network: [],
      nearby: [],
      others: []
    },
    nearbyOrgs: [],
    allSearchResults: [],
    status: {
      fetchNetworkAndNearby: 'idle',
      searchPharmacies: 'idle',
      fetchNearbyByRadius: 'idle',
      searchAllContacts: 'idle',
      addPharmacyToNetwork: 'idle',
      removePharmacyFromNetwork: 'idle',
      updateFriendshipStatus: 'idle',
      fetchRecentContacts: 'idle'
    },
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchNetworkAndNearby.pending, state => {
        state.status.fetchNetworkAndNearby = 'loading'
      })
      .addCase(fetchNetworkAndNearby.fulfilled, (state, action) => {
        state.status.fetchNetworkAndNearby = 'succeeded'
        state.contacts.network = action.payload.network
        state.contacts.nearby = action.payload.nearby
      })
      .addCase(fetchNetworkAndNearby.rejected, (state, action) => {
        state.status.fetchNetworkAndNearby = 'failed'
        state.error = action.error.message
      })
      .addCase(searchPharmacies.pending, state => {
        state.status.searchPharmacies = 'loading'
      })
      .addCase(searchPharmacies.fulfilled, (state, action) => {
        state.status.searchPharmacies = 'succeeded'
        state.contacts.others = action.payload.others
      })
      .addCase(searchPharmacies.rejected, (state, action) => {
        state.status.searchPharmacies = 'failed'
        state.error = action.error.message
      })
      .addCase(fetchNearbyByRadius.pending, state => {
        state.status.fetchNearbyByRadius = 'loading'
      })
      .addCase(fetchNearbyByRadius.fulfilled, (state, action) => {
        state.status.fetchNearbyByRadius = 'succeeded'
        state.nearbyOrgs = action.payload
      })
      .addCase(fetchNearbyByRadius.rejected, (state, action) => {
        state.status.fetchNearbyByRadius = 'failed'
        state.error = action.error.message
      })
      .addCase(searchAllContacts.pending, state => {
        state.status.searchAllContacts = 'loading'
      })
      .addCase(searchAllContacts.fulfilled, (state, action) => {
        state.status.searchAllContacts = 'succeeded'
        state.allSearchResults = action.payload
      })
      .addCase(searchAllContacts.rejected, (state, action) => {
        state.status.searchAllContacts = 'failed'
        state.error = action.error.message
      })
      .addCase(addPharmacyToNetwork.pending, state => {
        state.status.addPharmacyToNetwork = 'loading'
      })
      .addCase(addPharmacyToNetwork.fulfilled, (state, action) => {
        state.status.addPharmacyToNetwork = 'succeeded'
        state.contacts.network.push(action.payload)
      })
      .addCase(addPharmacyToNetwork.rejected, (state, action) => {
        state.status.addPharmacyToNetwork = 'failed'
        state.error = action.error.message
      })
      .addCase(removePharmacyFromNetwork.pending, state => {
        state.status.removePharmacyFromNetwork = 'loading'
      })
      .addCase(removePharmacyFromNetwork.fulfilled, (state, action) => {
        state.status.removePharmacyFromNetwork = 'succeeded'
        state.contacts.network = state.contacts.network.filter(
          contact => contact.network_organisation_id !== action.payload
        )
      })
      .addCase(removePharmacyFromNetwork.rejected, (state, action) => {
        state.status.removePharmacyFromNetwork = 'failed'
        state.error = action.error.message
      })
      .addCase(updateFriendshipStatus.pending, state => {
        state.status.updateFriendshipStatus = 'loading'
      })
      .addCase(updateFriendshipStatus.fulfilled, (state, action) => {
        state.status.updateFriendshipStatus = 'succeeded'
        const foundIndex = state.contacts.network.findIndex(
          contact => contact.network_organisation_id === action.payload.networkOrganisationId
        )
        if (foundIndex !== -1) {
          state.contacts.network[foundIndex].status = action.payload.status
        }
      })
      .addCase(updateFriendshipStatus.rejected, (state, action) => {
        state.status.updateFriendshipStatus = 'failed'
        state.error = action.error.message
      })
      .addCase(fetchRecentContacts.pending, state => {
        state.status.fetchRecentContacts = 'loading'
      })
      .addCase(fetchRecentContacts.fulfilled, (state, action) => {
        state.status.fetchRecentContacts = 'succeeded'
        state.contacts.recent = action.payload
      })
      .addCase(fetchRecentContacts.rejected, (state, action) => {
        state.status.fetchRecentContacts = 'failed'
        state.error = action.error.message
      })
  }
})

export const selectNetworkContacts = state => state.network.contacts.network
export const selectNearbyContacts = state => state.network.contacts.nearby
export const selectOtherContacts = state => state.network.contacts.others
export const selectNearbyPharmacies = state => state.network.nearbyOrgs
export const selectAllSearchResults = state => state.network.allSearchResults
export const selectRecentContacts = state => state.network.contacts.recent // New selector for recent contacts

export default networkSlice.reducer
