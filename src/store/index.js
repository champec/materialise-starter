// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import { combineReducers } from '@reduxjs/toolkit'

// ** Reducers - (what are reducers = reduce 2 inputs to 1 output, previous store (store state) and an action (commonly input or fetch) - and update the state )
// i.e chat keeps state of current messages - receives new messages and updates its store. store can be consumed/read by components
// note the import are defualt exports so dont use original names
// import chat from 'src/store/apps/chat'
// import email from 'src/store/apps/email'
// import kanban from 'src/store/apps/kanban'
// import invoice from 'src/store/apps/invoice'
// import calendar from 'src/store/apps/calendar'
import permissions from 'src/store/apps/permissions'
// import cdr from 'src/store/apps/cdr'
// import cartSlice from './apps/shop/cartSlice'
// import productsSlice from './apps/shop/productsSlice'
// import inventorySlice from './apps/shop/inventorySlice'
import user from './auth/user'
import organisation from './auth/organisation'
// import cart from './apps/shop/cartSlice'
// import checkout from './apps/shop/checkoutSlice'
// import labelsSlice from './apps/email/labelsSlice'
// import conversations from './apps/email/conversationsSlice'
// import messagesSlice from './apps/email/messagesSlice'
// import broadcastSlice from './apps/email/broadcastSlice'
// import network from './network'
// import finder from './apps/finder'
// import drugdash from './apps/drugdash'
// import ddPatients from './apps/drugdash/ddPatients'
// import ddDrugs from './apps/drugdash/ddDrugs'
// import ddDrivers from './apps/drugdash/ddDrivers'
// import ddModals from './apps/drugdash/ddModals'
// import ddDelivery from './apps/drugdash/ddDelivery'
// import ddBags from './apps/drugdash/ddBags'

const staticReducers = {
  // cdr,
  user,
  // chat,
  // email,
  // finder,
  // kanban,
  // invoice,
  // network,
  // drugdash,
  // ddDrivers,
  // ddDrugs,
  // ddModals,
  // ddPatients,
  // calendar,
  // productsSlice,
  // inventorySlice,
  organisation,
  // cart,
  // checkout,
  // cartSlice,
  permissions
  // labelsSlice,
  // conversations,
  // messagesSlice,
  // broadcastSlice,
  // ddBags,
  // ddDelivery
}

//when reading data in global storage, we use a hook called useSelector() which takes the store as an argument, this config combines all our reducers so they can be read anywhere
//with dot notation
const store = configureStore({
  reducer: staticReducers,
  //by fault it will return any middleware you add or you can just ask it to include only the middle ware you want, this allways it to return defualt middle with a funciton
  //getDefaultMiddleware => getDefaultMiddlware().concat(...add your middleware). here we have added default but turned of one deaulft calles serializableCheck.
  //sserializableCheck a methods for storing objects into bytes or more simply making into a series - a memory hack, if you dont understand you dont need
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(logger)
})

store.asyncReducers = {}

export const injectReducer = (key, asyncReducer) => {
  if (!store.asyncReducers[key]) {
    store.asyncReducers[key] = asyncReducer
    store.replaceReducer(createReducer(store.asyncReducers))
  }
}

function createReducer(asyncReducers) {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers
  })
}

export default store
