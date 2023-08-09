import { supabaseOrg as supabase } from 'src/configs/supabase'
import UserProfile from 'src/views/pages/user-profile/UserProfile'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useEffect, useState } from 'react'
import { set } from 'nprogress'
import { useSelector } from 'react-redux'

const UserProfileTab = () => {
  const [nhsData, setNhsData] = useState(null) // ['loading'
  const data = useOrgAuth().organisation

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
  return <UserProfile tab={'non'} data={data} nhsData={nhsData} />
}

export default UserProfileTab
