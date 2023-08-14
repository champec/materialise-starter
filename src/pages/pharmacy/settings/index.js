// ** Third Party Imports

// ** Demo Components Imports
import UserViewPage from 'src/views/apps/user/view/UserViewPage'

// ** RTK imports
import { useSelector, useDispatch } from 'react-redux'

const UserView = () => {
  const tab = 'overview'
  const invoiceData = [
    { id: 1, name: 'Invoice 1', amount: '$100' },
    { id: 2, name: 'Invoice 2', amount: '$200' },
    { id: 3, name: 'Invoice 3', amount: '$300' }
  ]

  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  return <UserViewPage tab={tab} user={user} invoiceData={invoiceData} dispatch={dispatch} />
}

export default UserView
