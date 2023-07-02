// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers - (what are reducers = reduce 2 inputs to 1 output, previous store (store state) and an action (commonly input or fetch) - and update the state )
// i.e chat keeps state of current messages - receives new messages and updates its store. store can be consumed/read by components
// note the import are defualt exports so dont use original names
import chat from 'src/store/apps/chat'
import user from 'src/store/apps/user'
import email from 'src/store/apps/email'
import kanban from 'src/store/apps/kanban'
import invoice from 'src/store/apps/invoice'
import calendar from 'src/store/apps/calendar'
import permissions from 'src/store/apps/permissions'

//when reading data in global storage, we use a hook called useSelector() which takes the store as an argument, this config combines all our reducers so they can be read anywhere
//with dot notation
export const store = configureStore({
  reducer: {
    user,
    chat,
    email,
    kanban,
    invoice,
    calendar,
    permissions
  },

  //by fault it will return any middleware you add or you can just ask it to include only the middle ware you want, this allways it to return defualt middle with a funciton
  //getDefaultMiddleware => getDefaultMiddlware().concat(...add your middleware). here we have added default but turned of one deaulft calles serializableCheck.
  //sserializableCheck a methods for storing objects into bytes or more simply making into a series - a memory hack, if you dont understand you dont need
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
