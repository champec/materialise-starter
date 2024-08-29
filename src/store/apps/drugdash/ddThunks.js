import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Fetch Patients
export const fetchPatients = createAsyncThunk('drugDash/fetchPatients', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_patients').select('*')
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Add Patient
export const addPatient = createAsyncThunk(
  'drugDash/addPatient',
  async (patientData, { rejectWithValue, getState }) => {
    try {
      const org_id = getState().organisation?.organisation?.id
      const user_id = getState().user?.user?.id
      const { data, error } = await supabase
        .from('dd_patients')
        .insert({ ...patientData, organisation_id: org_id, created_by: user_id })
        .select('*')
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.message)
    }
  }
)

// Fetch Patient Medications
// export const fetchPatientMedications = createAsyncThunk(
//   'drugDash/fetchPatientMedications',
//   async (patientId, { rejectWithValue }) => {
//     try {
//       const { data, error } = await supabase
//         .from('dd_patient_medications')
//         .select('*, medication:dmd.medication_id(*)')
//         .eq('patient_id', patientId)
//       if (error) throw error
//       return data
//     } catch (error) {
//       return rejectWithValue(error.message)
//     }
//   }
// )

// Fetch Patient Medications
export const fetchPatientMedications = createAsyncThunk(
  'drugDash/fetchPatientMedications',
  async (patientId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.rpc('fetch_patient_medications', { p_patient_id: patientId })

      if (error) throw error

      console.log('FETCH PATIENT MEDICATION', data)
      // Process the data to combine pm_data and vmp_data
      const processedData = data.map(item => ({
        ...item.pm_data,
        vmp: item.vmp_data
      }))

      return processedData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Add Patient Medication
export const addPatientMedication = createAsyncThunk(
  'drugDash/addPatientMedication',
  async (medicationData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('dd_patient_medications').insert(medicationData)

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch Bags
// Updated fetchBags thunk
export const fetchBags = createAsyncThunk(
  'drugDash/fetchBags',
  async ({ status, startDate, endDate }, { rejectWithValue }) => {
    try {
      let query = supabase.from('dd_bags').select('*')

      if (status) {
        query = query.eq('status', status)
      }

      if (startDate) {
        query = query.gte('due_date', startDate)
      }

      if (endDate) {
        query = query.lte('due_date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchBagById = createAsyncThunk('drugDash/fetchBagById', async (bagId, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_bags').select('*').eq('id', bagId).single()
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Updated addBag thunk
export const addBag = createAsyncThunk('drugDash/addBag', async (bagData, { rejectWithValue }) => {
  const { patientId, medications, ...restData } = bagData

  try {
    // Upsert the bag
    const { data: bag, error: bagError } = await supabase
      .from('dd_bags')
      .upsert(
        {
          ...restData,
          patient_id: patientId,
          selected_medicines: medications // Store the array of medication IDs directly
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (bagError) throw bagError

    return bag
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// New thunk to update bag due date
export const updateBagDueDate = createAsyncThunk(
  'drugDash/updateBagDueDate',
  async ({ bagId, newDueDate }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('dd_bags').update({ due_date: newDueDate }).eq('id', bagId).single()
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update Bag Status
export const updateBagStatus = createAsyncThunk(
  'drugDash/updateBagStatus',
  async ({ bagId, newStatus }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('dd_bags').update({ status: newStatus }).eq('id', bagId).single()
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch Collections
export const fetchCollections = createAsyncThunk('drugDash/fetchCollections', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_collections').select('*')
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Create Collection
export const createCollection = createAsyncThunk(
  'drugDash/createCollection',
  async (collectionData, { rejectWithValue, getState }) => {
    const orgId = getState().organisation.organisation.id
    const userId = getState().user.user.id
    try {
      const { data, error } = await supabase
        .from('dd_collections')
        .insert({
          driver_id: collectionData.driver_id,
          bags: selectedBags.map(bag => bag.id),
          created_at: new Date().toISOString(),
          status: 'pending',
          pharmacy_id: orgId,
          created_by: userId
        })
        .select('id')
        .single()

      if (error) throw error

      // Update bag statuses and collection_id
      await Promise.all(
        collectionData.bags.map(bagId =>
          supabase.from('dd_bags').update({ status: 'in_group', collection_id: data.id }).eq('id', bagId)
        )
      )

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateCollection = createAsyncThunk(
  'drugDash/updateCollection',
  async (collectionData, { rejectWithValue, getState, dispatch }) => {
    try {
      const { data, error } = await supabase
        .from('dd_collections')
        .update({
          driver_id: collectionData.driver_id,
          status: collectionData.status || 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionData.id)
        .select()
        .single()

      if (error) throw error

      // Get current bags in the collection
      const currentCollection = getState().drugDash.collections.find(c => c.id === collectionData.id)
      const currentBagIds = currentCollection ? currentCollection.bags.map(b => b.id) : []

      // Bags to remove from collection
      const bagsToRemove = currentBagIds.filter(id => !collectionData.bags.includes(id))

      // Update removed bags
      if (bagsToRemove.length > 0) {
        await supabase.from('dd_bags').update({ collection_id: null, status: 'in_pharmacy' }).in('id', bagsToRemove)
      }

      // Update bags in collection
      await Promise.all(
        collectionData.bags.map(bagId =>
          supabase.from('dd_bags').update({ collection_id: collectionData.id, status: 'in_group' }).eq('id', bagId)
        )
      )

      // Fetch updated bags
      const { data: updatedBags, error: bagsError } = await supabase
        .from('dd_bags')
        .select('*')
        .in('id', [...collectionData.bags, ...bagsToRemove])

      if (bagsError) throw bagsError

      dispatch(fetchBags())
      return { ...data, updatedBags }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchCollectionById = createAsyncThunk(
  'drugDash/fetchCollectionById',
  async (collectionId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('dd_collections')
        .select(
          `
          *,
          driver:dd_drivers(*),
          bags:dd_bags(*)
        `
        )
        .eq('id', collectionId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch Drivers
export const fetchDrivers = createAsyncThunk('drugDash/fetchDrivers', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_drivers').select('*')
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Add Driver
export const addDriver = createAsyncThunk('drugDash/addDriver', async (driverData, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_drivers').insert(driverData).select('*').single()
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchDriverById = createAsyncThunk('drugDash/fetchDriverById', async (driverId, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_drivers').select('*').eq('id', driverId).single()

    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Search Drivers
export const searchDrivers = createAsyncThunk(
  'drugDash/searchDrivers',
  async (searchTerm, { rejectWithValue, getState }) => {
    try {
      const org_id = getState().organisation?.organisation?.id
      const { data, error } = await supabase
        .from('dd_drivers')
        .select('*')
        // .eq('organisation_id', org_id)
        .ilike('first_name', `%${searchTerm}%`)
        .or(`last_name.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// In ddThunks.js

export const deleteCollection = createAsyncThunk(
  'drugDash/deleteCollection',
  async (collectionId, { rejectWithValue }) => {
    try {
      // First, update all bags associated with this collection
      const { data: bags, error: bagsError } = await supabase
        .from('dd_bags')
        .update({ status: 'in_pharmacy', collection_id: null })
        .eq('collection_id', collectionId)
        .select()

      if (bagsError) throw bagsError

      // Then, delete the collection
      const { error: deleteError } = await supabase.from('dd_collections').delete().eq('id', collectionId)

      if (deleteError) throw deleteError

      return { collectionId, updatedBags: bags }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// In ddThunks.js

// In ddThunks.js

export const createTransitStops = createAsyncThunk(
  'drugDash/createTransitStops',
  async (collectionId, { rejectWithValue, getState }) => {
    try {
      const collection = getState().drugDash.collections.find(c => c.id === collectionId)
      if (!collection) throw new Error('Collection not found')

      // Group bags by address and post code
      const stopsByAddress = collection.bags.reduce((acc, bag) => {
        const { address, post_code } = bag.patient
        const key = `${address}|${post_code}` // Use both address and post code as a unique key
        if (!acc[key]) {
          acc[key] = {
            address,
            post_code,
            bag_ids: [],
            patients: new Set() // Use a Set to store unique patient IDs
          }
        }
        acc[key].bag_ids.push(bag.id)
        acc[key].patients.add(bag.patient.id)
        return acc
      }, {})

      // Update collection status to 'in_transit'
      const { error: collectionError } = await supabase
        .from('dd_collections')
        .update({ status: 'in_transit' })
        .eq('id', collectionId)

      if (collectionError) throw collectionError

      // Create stops
      const { data: stops, error } = await supabase
        .from('dd_delivery_stops')
        .insert(
          Object.values(stopsByAddress).map(stop => ({
            collection_id: collectionId,
            address: stop.address,
            post_code: stop.post_code,
            bag_ids: stop.bag_ids,
            patient_count: stop.patients.size // Add the count of unique patients
          }))
        )
        .select()

      if (error) throw error

      return stops
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
export const fetchTransitStops = createAsyncThunk(
  'drugDash/fetchTransitStops',
  async (collectionId, { rejectWithValue }) => {
    try {
      const { data: stops, error } = await supabase
        .from('dd_delivery_stops')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at')

      if (error) throw error

      return stops
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBags = createAsyncThunk('drugDash/updateBags', async (bagsData, { rejectWithValue, dispatch }) => {
  try {
    const { data, error } = await supabase.from('dd_bags').upsert(bagsData, { onConflict: 'id' }).select()

    if (error) throw error

    dispatch(fetchBags())
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})
