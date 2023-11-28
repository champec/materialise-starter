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
          path: '/pharmacy/cdr',
          icon: 'bx:book'
        },
        {
          title: 'My Pharmacy',
          path: '/pharmacy/mypharmacy',
          icon: 'guidance:pharmacy'
        },
        {
          title: 'My Account',
          path: '/pharmacy/settings',
          icon: 'solar:settings-outline'
        },
        {
          title: 'Drug Dash',
          path: '/pharmacy/drugdash',
          icon: 'fluent-emoji-high-contrast:man-running',
          disabled: false
        }
      ]
    },
    {
      title: 'Pharmacy First',
      path: '/second-page',
      icon: 'iconoir:pharmacy-cross-circle',
      children: [
        {
          title: 'Appointment Scheduler',
          path: '/pharmacy-first/appointment-scheduler',
          icon: 'streamline:waiting-appointments-calendar',
          disabled: false
        },
        {
          title: 'Appointment List',
          path: '/pharmacy-first/appointment-list',
          icon: 'bi:file-medical-fill',
          disabled: false
        },
        {
          title: 'Call Screen',
          path: '/pharmacy-first/call-screen',
          icon: 'wpf:medical-doctor',
          disabled: false
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
      path: '/store/invoice',
      action: 'read',
      subject: 'acl-page',
      title: 'Invoice',
      icon: 'mingcute:paper-line'
    },
    {
      path: '/store/orders',
      action: 'read',
      subject: 'acl-page',
      title: 'Orders',
      icon: 'ic:twotone-add-business',
      children: [
        {
          title: 'Purchases',
          path: '/store/orders/purchases',
          icon: 'icons8:buy'
        },
        {
          title: 'Sales',
          path: '/store/orders/sales',
          icon: 'grommet-icons:money'
        }
      ]
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
