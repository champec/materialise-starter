import React, { useState, useEffect } from 'react'
import MailLog from 'src/views/apps/email/MailLog'
import { dummyData, getBroadcasts } from 'src/views/apps/email/BroadcastAPI'

const Inbox = ({
  query,
  hidden,
  lgAbove,
  dispatch,
  setQuery,
  direction,
  updateMail,
  routeParams,
  labelColors,
  paginateMail,
  getCurrentMail,
  updateMailLabel,
  mailDetailsOpen,
  handleSelectMail,
  setMailDetailsOpen,
  handleSelectAllMail,
  handleLeftSidebarToggle,
  mails
}) => {
  const store = {
    ...dummyData,
    mails: mails
  }

  return (
    <MailLog
      query={query}
      store={store}
      hidden={hidden}
      lgAbove={lgAbove}
      dispatch={dispatch}
      setQuery={setQuery}
      direction={direction}
      updateMail={updateMail}
      routeParams={routeParams}
      labelColors={labelColors}
      paginateMail={paginateMail}
      getCurrentMail={getCurrentMail}
      updateMailLabel={updateMailLabel}
      mailDetailsOpen={mailDetailsOpen}
      handleSelectMail={handleSelectMail}
      setMailDetailsOpen={setMailDetailsOpen}
      handleSelectAllMail={handleSelectAllMail}
      handleLeftSidebarToggle={handleLeftSidebarToggle}
    />
  )
}

Inbox.contentHeightFixed = true

export default Inbox
