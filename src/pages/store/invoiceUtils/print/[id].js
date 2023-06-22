// ** Third Party Imports
import { supabaseOrg } from 'src/configs/supabase'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Components Imports
import PrintPage from 'src/views/apps/invoice/print/PrintPage'
const supabase = supabaseOrg
const InvoicePrint = ({ data }) => {
  return <PrintPage data={data} />
}

export async function getServerSideProps(context) {
  const { data: invoices, error } = await supabase.from('invoice').select('*').eq('id', context.params.id)
  if (error) {
    console.log(error)
    return {
      notFound: true
    }
  }

  return {
    props: {
      invoices
    }
  }
}

export default InvoicePrint
