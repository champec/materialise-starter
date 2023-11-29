import { supabaseOrg as supabase } from 'src/configs/supabase'

export async function fetchDrugsFromDb() {
  const { data, error } = await supabase.from('cdr_drug_usage').select(
    `
    *,
    cdr_drugs (
      *
    )
  `
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
