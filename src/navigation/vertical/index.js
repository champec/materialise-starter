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
      icon: 'ph:briefcase-light'
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
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Broadcast',
      icon: 'grommet-icons:announce'
    },
    {
      sectionTitle: 'Buy, Sell & trade'
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Inventory',
      icon: 'arcticons:inventory'
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Shop',
      icon: 'mdi:drugs'
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Track',
      icon: 'mdi:map-marker-distance'
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Business',
      icon: 'ic:twotone-add-business'
    },
    {
      sectionTitle: 'Team Management'
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Kanban',
      icon: 'bi:kanban-fill'
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Calender',
      icon: 'uim:calender'
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Sticky Notes',
      icon: 'mdi:sticky-note-alert'
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'To do list',
      icon: 'material-symbols:list-alt-add'
    }
  ]
}

export default navigation
