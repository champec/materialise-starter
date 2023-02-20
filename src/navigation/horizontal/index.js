const navigation = () => [
  {
    title: 'Home',
    path: '/home',
    icon: 'mdi:home-outline'
  },
  {
    title: 'Second Page',
    path: '/second-page',
    icon: 'mdi:email-outline'
  },
  {
    sectionTitle: 'Apps & Pages'
  },
  {
    path: '/acl',
    action: 'read',
    subject: 'acl-page',
    title: 'Access Controlz',
    icon: 'mdi:shield-outline'
  }
]

export default navigation
