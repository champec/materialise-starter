import { supabaseOrg as supabase } from 'src/configs/supabase'
import MyPharmacyTabs from 'src/views/pages/user-profile/myPharmacyTabs'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useEffect, useState } from 'react'
import { set } from 'nprogress'
import { useSelector } from 'react-redux'

const UserProfileTab = () => {
  const [nhsData, setNhsData] = useState(null) // ['loading'
  const data = useOrgAuth().organisation

  const orgData = useSelector(state => state.organisation.organisation)

  console.log({ orgData }, 'USER COMP')

  const fetchNHSDetails = async () => {
    const { data: nhsData, error: nhsError } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('ods_code', data.ODS)
      .single()

    if (nhsError) throw nhsError

    console.log({ nhsData })
    setNhsData(nhsData)
  }

  useEffect(() => {
    fetchNHSDetails()
  }, [])

  console.log({ data, nhsData }, 'USER COMP')
  return <MyPharmacyTabs tab={'non'} data={data} nhsData={nhsData} orgData={orgData} />
}

export default UserProfileTab
