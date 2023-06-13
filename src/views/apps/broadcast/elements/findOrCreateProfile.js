import { supabaseOrg } from 'src/configs/supabase'

const findOrCreateProfile = async (ODS, orgName, role) => {
  // Check if a profile with the given ODS code already exists
  const { data, error } = await supabaseOrg
    .from('profiles')
    .select('*')
    .eq('ODS', ODS)
    .maybeSingle()
  if (error) {
    console.log(error, 'find or create profile error')
  }
  if (data) {
    // If the profile exists, return it
    return data
  } else {
    // If the profile does not exist, create and return it
    const { data: createdProfile, error: createError } = await supabaseOrg
      .from('profiles')
      .insert({ ODS: ODS, email: `${orgName + ODS}.pharmex.com`, organisation_name: orgName, role: role })
      .single()

    if (createError) {
      console.log(createError.message, 'find or create profile error')
      throw new Error(createError.message, 'find or create profile error')
    }

    return createdProfile
  }
}

export default findOrCreateProfile
