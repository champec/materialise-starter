import React, { useEffect, useState } from 'react'
import Board from 'react-trello'
import CustomLaneHeader from './CustomLaneHeader'
import AddCardButton from './AddCardButton'
import CustomCard from './CustomCard'
import CollapseButton from './CollapseButton'
import AddLaneButton from './AddLaneButton'
import CardForm from './CardForm'
import { Button, Container as MuiContainer } from '@mui/material'
import { styled } from '@mui/material/styles'
import useBgColor from 'src/@core/hooks/useBgColor'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { fetchBoardByOrg, createFirstBoard } from 'src/store/apps/kanban'
import { useDispatch, useSelector } from 'react-redux'
import LaneForm from './LaneForm'

// Styled Container
const Container = styled(MuiContainer)(({ theme }) => ({
  '.react-trello-lane': {
    backgroundColor: theme.palette.background.paper
  }
}))

// Initial Data
const initialState = { lanes: [] }

const sampleData = {
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
  const [formOpen, setFormOpen] = useState(false)
  const [laneFormOpen, setLaneFormOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedLane, setSelectedLane] = useState(null)
  const [data, setData] = useState(initialState)
  const dispatch = useDispatch()
  const orgId = useOrgAuth()?.organisation?.id

  useEffect(() => {
    dispatch(fetchBoardByOrg(orgId))
  }, [dispatch, orgId])

  const kanbanState = useSelector(state => state.kanban)

  useEffect(() => {
    if (kanbanState.board) {
      // transform data into the format react-trello expects
      const lanes = Object.values(kanbanState.lanes).map(lane => {
        return {
          id: lane.id,
          title: lane.title,
          position: lane.position,
          cards: lane.cards.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.due_date,
            label: task.recurring_days,
            assignees: task.users,
            labels: task.labels
          }))
        }
      })

      setData({ lanes })

      // console.log('LANES', { lanes })
    }
  }, [kanbanState])

  const handleAddCard = laneId => {
    setSelectedLane(laneId)
    setFormOpen(true)
  }

  const handleAddLane = () => {
    setLaneFormOpen(true)
  }

  const handleCreateFirstBoard = () => {
    dispatch(createFirstBoard(orgId)).then(() => dispatch(fetchBoardByOrg(orgId)))
  }

  const handleEditLane = (laneId, laneTitle, position) => {
    setSelectedLane({ id: laneId, title: laneTitle, position: position })
    setLaneFormOpen(true)
  }

  if (kanbanState.pending) {
    return <div>Loading...</div>
  }

  if (kanbanState.board === 'none' && !kanbanState.error) {
    return (
      <div>
        <h1>Welcome to Kanban board!</h1>
        <p>Get started by creating your first board</p>
        <Button variant='outlined' onClick={handleCreateFirstBoard}>
          Get Started
        </Button>
      </div>
    )
  }

  if (kanbanState.error) {
    return (
      <div>
        <h1>An error occurred!</h1>
        <p>{kanbanState.error}</p>
      </div>
    )
  }

  return (
    <Container>
      <Board
        data={data}
        draggable
        style={{ backgroundColor: 'transparent' }}
        canAddLanes
        editLaneTitle
        editable
        collapsibleLanes
        laneDraggable={false}
        cardDraggable={false}
        onLaneAdd={handleAddLane}
        components={{
          LaneHeader: props => (
            <CustomLaneHeader
              {...props}
              onEdit={handleEditLane}
              boardId={kanbanState?.board}
              setSelectedLane={setSelectedLane}
              orgId={orgId}
            />
          ),
          AddCardLink: props => <AddCardButton {...props} onSelect={laneId => handleAddCard(laneId)} />,
          Card: CustomCard,
          LaneFooter: CollapseButton,
          NewLaneSection: props => <AddLaneButton {...props} onSelect={handleAddLane} />
        }}
      />
      {formOpen && (
        <CardForm
          open={formOpen}
          orgId={orgId}
          setOpen={setFormOpen}
          selectedLane={selectedLane}
          users={kanbanState.users}
          labels={kanbanState.labels}
          toggle={() => {
            setFormOpen(!formOpen)
            setSelectedCard(null)
          }}
        />
      )}
      {laneFormOpen && (
        <LaneForm
          open={laneFormOpen}
          selectedLane={selectedLane}
          setOpen={setLaneFormOpen}
          toggle={() => {
            setLaneFormOpen(!laneFormOpen)
            setSelectedLane(null)
          }}
          boardId={kanbanState?.board}
          numberOfLanes={data?.lanes?.length}
          orgId={orgId}
        />
      )}
    </Container>
  )
}

export default Kanbanboard
