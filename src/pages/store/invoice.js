import React from 'react'
import InvoiceList from './invoiceUtils'
import { supabase } from 'src/configs/supabase'
import { useRouter } from 'next/router'
import InvoiceDetails from './invoiceDetails'
import { fetchInvoice } from '../../@core/utils/supabase/storeApis'
import { useSelector } from 'react-redux'

function Track({ invoices }) {
  const router = useRouter()
  const { invoiceId, view } = router.query
  const [currentInvoice, setCurrentInvoice] = React.useState(null)
  const [invoiceDetails, setInvoiceDetails] = React.useState(null)
  const organisation = useSelector(state => state.organisation.organisation)

  console.log(organisation)

  React.useEffect(() => {
    if (invoiceId && view === 'invoice_details') {
      fetchInvoice(invoiceId)
        .then(fetchedInvoice => {
          setInvoiceDetails(fetchedInvoice)
        })
        .catch(err => console.log(err))
    }
  }, [invoiceId, view])

  const handleBackClick = () => {
    setCurrentInvoice(null)
    router.push({ query: { id: null, view: null } })
  }

  const handleInvoiceClick = id => {
    setCurrentInvoice(id)
    router.push({ query: { invoiceId: id, view: 'invoice_details' } })
  }

  return (
    <div>
      {view === 'invoice_details' && invoiceId ? (
        <InvoiceDetails invoice={invoiceDetails} onBackClick={handleBackClick} id={invoiceId} />
      ) : view === 'invoice' ? (
        <InvoiceDetails />
      ) : (
        <InvoiceList invoices={invoices} onInvoiceClick={handleInvoiceClick} />
      )}
    </div>
  )
}

export default Track

export async function getServerSideProps(context) {
  const { data: invoices, error } = await supabase.from('invoice').select('*')
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
