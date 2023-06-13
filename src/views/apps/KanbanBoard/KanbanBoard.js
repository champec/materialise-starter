import React from 'react'
import Board from 'react-trello'
import { Container } from '@mui/material'

const data = {
  lanes: [
    {
      id: 'lane1',
      title: 'To Do',
      label: '2/2',
      cards: [
        { id: 'Card1', title: 'Write Blog Post', description: 'Can AI make memes', label: '30 mins' },
        { id: 'Card2', title: 'Pay Rent', description: 'Transfer via NEFT', label: '5 mins' }
      ]
    },
    {
      id: 'lane2',
      title: 'Doing',
      label: '0/0',
      cards: []
    },
    {
      id: 'lane3',
      title: 'Done',
      label: '0/0',
      cards: []
    }
  ]
}

function Kanbanboard() {
  return (
    <Container>
      <Board data={data} draggable style={{ backgroundColor: 'transparent' }} />
    </Container>
  )
}

export default Kanbanboard
