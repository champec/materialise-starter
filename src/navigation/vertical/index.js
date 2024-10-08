const navigation = (role, plan) => {
  console.log('NAVIGATION', role, plan)
  const manager = role === 'manager' || role === 'pharmacist-manager'
  const pharmacist = role === 'pharmacist' || role === 'pharmacist-manager'
  const staff = role === 'staff'

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
          icon: 'bx:book',
          disabled: role !== 'manager'
        },
        {
          title: 'My Pharmacy',
          path: '/pharmacy/mypharmacy',
          icon: 'guidance:pharmacy'
        },
        {
          title: 'My Account',
          path: '/pharmacy/settings',
          icon: 'solar:settings-outline',
          disabled: plan === 'free'
        },
        {
          title: 'Drug Dash',
          path: '/pharmacy/drugdash',
          icon: 'fluent-emoji-high-contrast:man-running'
          // disabled: plan === 'free'
        }
      ]
    },
    {
      title: 'Services',
      path: '/second-page',
      icon: 'iconoir:pharmacy-cross-circle',
      children: [
        {
          title: 'Service Calendar',
          path: '/services/calendar',
          icon: 'mdi:calendar-clock',
          disabled: false
        },
        {
          title: 'Service List',
          path: '/services/service-list',
          icon: 'mdi:clipboard-list',
          disabled: false
        },
        {
          title: 'Quick Service',
          path: '/services/quick-service',
          icon: 'mdi:flash',
          disabled: false
        },
        {
          title: 'Service Stats',
          path: '/services/service-stats',
          icon: 'mdi:chart-bar',
          disabled: false
        },
        {
          title: 'Claims',
          path: '/services/claims',
          icon: 'mdi:file-document-check',
          disabled: false
        },
        {
          title: 'Service Management',
          path: '/services/service-management',
          icon: 'mdi:cog'
        }
      ]
    },
    {
      title: 'Shifts',
      path: '/second-page',
      icon: 'openmoji:rescue-workers-helmet',
      children: [
        {
          title: 'Shift Manager',
          path: '/pharmacy/locum/pharmacy-shift-manager',
          icon: 'fluent-mdl2:work-item',
          disabled: false
        },
        {
          title: 'My Locum Shifts',
          path: '/pharmacy/locum/locum-shift-manager',
          icon: 'fluent-emoji-high-contrast:office-worker',
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
      icon: 'ic:outline-mark-unread-chat-alt',
      disabled: plan === 'free'
    },
    {
      path: '/broadcast',
      action: 'read',
      subject: 'acl-page',
      title: 'Broadcast',
      icon: 'grommet-icons:announce',
      disabled: plan === 'free'
    },
    {
      sectionTitle: 'Buy, Sell & trade'
    },
    {
      path: '/store/inventory',
      action: 'read',
      subject: 'acl-page',
      title: 'Inventory',
      icon: 'arcticons:inventory',
      disabled: plan === 'free'
    },
    {
      path: '/store/shop',
      action: 'read',
      subject: 'acl-page',
      title: 'Shop',
      icon: 'mdi:drugs',
      disabled: plan === 'free'
    },
    {
      path: '/store/invoice',
      action: 'read',
      subject: 'acl-page',
      title: 'Invoice',
      icon: 'mingcute:paper-line',
      disabled: plan === 'free'
    },
    {
      path: '/store/orders',
      action: 'read',
      subject: 'acl-page',
      title: 'Orders',
      icon: 'ic:twotone-add-business',
      disabled: plan === 'free',
      children: [
        {
          title: 'Purchases',
          path: '/store/orders/purchases',
          icon: 'icons8:buy',
          disabled: plan === 'free'
        },
        {
          title: 'Sales',
          path: '/store/orders/sales',
          icon: 'grommet-icons:money',
          disabled: plan === 'free'
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
      icon: 'bi:kanban-fill',
      disabled: plan === 'free'
    },
    {
      path: '/teams/calendar',
      action: 'read',
      subject: 'acl-page',
      title: 'Calendar',
      icon: 'uim:calender',
      disabled: plan === 'free'
    },
    {
      path: '/teams/sticky-notes',
      action: 'read',
      subject: 'acl-page',
      title: 'Sticky Notes',
      icon: 'mdi:sticky-note-alert',
      disabled: plan === 'free'
    },
    {
      path: '/teams/todo',
      action: 'read',
      subject: 'acl-page',
      title: 'To do list',
      icon: 'material-symbols:list-alt-add',
      disabled: plan === 'free'
    }
  ]
}

export default navigation
