const navigation = () => {
  return [
    {
      title: 'Dashboard',
      path: '/home',
      icon: 'mdi:home-outline'
    },
    {
      title: 'Pharmacy Management',
      path: '/second-page',
      icon: 'ph:briefcase-light',
      children: [
        {
          title: 'CD Register',
          path: '/pharmacy/cdr'
        }
      ]
    },
    {
      sectionTitle: 'Communication'
    },
    {
      path: '/Finder',
      title: 'Finder',
      icon: 'logos:google-maps'
    },
    {
      path: '/chat',
      action: 'read',
      subject: 'acl-page',
      title: 'Chat',
      icon: 'ic:outline-mark-unread-chat-alt'
    },
    {
      path: '/broadcast',
      action: 'read',
      subject: 'acl-page',
      title: 'Broadcast',
      icon: 'grommet-icons:announce'
    },
    {
      sectionTitle: 'Buy, Sell & trade'
    },
    {
      path: '/store/inventory',
      action: 'read',
      subject: 'acl-page',
      title: 'Inventory',
      icon: 'arcticons:inventory'
    },
    {
      path: '/store/shop',
      action: 'read',
      subject: 'acl-page',
      title: 'Shop',
      icon: 'mdi:drugs'
    },
    {
      path: '/store/track',
      action: 'read',
      subject: 'acl-page',
      title: 'Track',
      icon: 'mdi:map-marker-distance'
    },
    {
      path: '/store/business',
      action: 'read',
      subject: 'acl-page',
      title: 'Business',
      icon: 'ic:twotone-add-business'
    },
    {
      sectionTitle: 'Team Management'
    },
    {
      path: '/teams/kanban',
      action: 'read',
      subject: 'acl-page',
      title: 'Kanban',
      icon: 'bi:kanban-fill'
    },
    {
      path: '/teams/calendar',
      action: 'read',
      subject: 'acl-page',
      title: 'Calendar',
      icon: 'uim:calender'
    },
    {
      path: '/teams/sticky-notes',
      action: 'read',
      subject: 'acl-page',
      title: 'Sticky Notes',
      icon: 'mdi:sticky-note-alert'
    },
    {
      path: '/teams/todo',
      action: 'read',
      subject: 'acl-page',
      title: 'To do list',
      icon: 'material-symbols:list-alt-add'
    }
  ]
}

export default navigation
