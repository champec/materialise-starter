// ** Third Party Imports
import axios from 'axios'

// ** Demo Components Imports
import UserViewPage from 'src/views/apps/user/view/UserViewPage'

const UserView = ({ tab, invoiceData }) => {
  return <UserViewPage tab={tab} invoiceData={invoiceData} />
}

export const getStaticPaths = () => {
  return {
    paths: [
      { params: { tab: 'overview' } },
      { params: { tab: 'security' } },
      { params: { tab: 'billing-plan' } },
      { params: { tab: 'notification' } },
      { params: { tab: 'connection' } }
    ],
    fallback: false
  }
}

export const getStaticProps = async ({ params }) => {
  // const res = await axios.get('/apps/invoice/invoices')
  const invoiceData = [
    { id: 1, name: 'Invoice 1', amount: '$100' },
    { id: 2, name: 'Invoice 2', amount: '$200' },
    { id: 3, name: 'Invoice 3', amount: '$300' }
  ]

  return {
    props: {
      invoiceData,
      tab: params?.tab
    }
  }
}

export default UserView
