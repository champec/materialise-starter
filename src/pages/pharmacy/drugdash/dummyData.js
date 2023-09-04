const dummyData = [
  {
    id: '1',
    type: 'rx_bag',
    status: 'pending',
    patient: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      postalCode: '12345',
      city: 'Anytown'
    },
    medications: [
      {
        drugName: 'Aspirin',
        brandName: 'Aspirin Brand',
        quantity: 30,
        drugId: 'a1',
        dailyDose: '2 tablets'
      },
      {
        drugName: 'Ibuprofen',
        brandName: '',
        quantity: 20,
        drugId: 'b1',
        dailyDose: '1 tablet'
      }
    ],
    patientSpecificNotes: 'Take with food.',
    deliveryNotes: 'Leave at the front door.'
  },
  {
    id: '2',
    type: 'delivery_box',
    status: 'delivered',
    driver: {
      id: 'd1',
      name: 'Alice',
      phoneNumber: '555-1234',
      address: '789 Street Rd'
    },
    bags: [
      { patientName: 'John Doe', status: 'delivered' },
      { patientName: 'Jane Doe', status: 'pending' }
    ]
  },
  {
    id: '3',
    type: 'shop_order',
    status: 'pending',
    customer: {
      name: 'Bob Smith',
      address: '456 Elm St'
    },
    items: [
      { itemName: 'Toothpaste', quantity: 2 },
      { itemName: 'Toothbrush', quantity: 1 }
    ]
  },
  {
    id: '4',
    type: 'pharmacy_exchange',
    status: 'completed',
    exchangingPharmacy: 'PharmaCo',
    items: [
      { itemName: 'Antibiotics', quantity: 100 },
      { itemName: 'Painkillers', quantity: 50 }
    ]
  }
]

export default dummyData
