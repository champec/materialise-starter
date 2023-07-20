import React, { useEffect, useState } from 'react'
import Board from 'react-trello'
import CustomLaneHeader from './CustomLaneHeader'
import AddCardButton from './AddCardButton'
import CustomCard from './CustomCard'
import CollapseButton from './CollapseButton'
import AddLaneButton from './AddLaneButton'
import CardForm from './CardForm'
import { Button, Container as MuiContainer, Snackbar, Alert } from '@mui/material'
import { styled } from '@mui/material/styles'
import useBgColor from 'src/@core/hooks/useBgColor'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { fetchBoardByOrg, createFirstBoard, updateTask, fetchOrgData, moveTask } from 'src/store/apps/kanban'
import { useDispatch, useSelector } from 'react-redux'
import LaneForm from './LaneForm'

// Styled Container
const Container = styled(MuiContainer)(({ theme }) => ({
  '.react-trello-lane': {
    backgroundColor: `rgba(${theme.palette.customColors.main}, 0.05)`
  }
}))

// Initial Data
const initialState = { lanes: [] }

function Kanbanboard() {
  const [formOpen, setFormOpen] = useState(false)
  const [laneFormOpen, setLaneFormOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedLane, setSelectedLane] = useState(null)
  const [data, setData] = useState(initialState)
  const [refetchBoard, setRefetchBoard] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const state = useSelector(state => state.kanban)

  useEffect(() => {
    const snackbarMessage = state.snackbarMessage
    if (snackbarMessage) {
      setSnackbarMessage(snackbarMessage)
      setSnackbarOpen(true)
    }
  }, [state.snackbarMessage])

  const dispatch = useDispatch()
  const orgId = useOrgAuth()?.organisation?.id

  useEffect(() => {
    dispatch(fetchBoardByOrg(orgId)).then(() => {
      dispatch(fetchOrgData(orgId))
    })
  }, [dispatch, orgId])

  useEffect(() => {
    dispatch(fetchBoardByOrg(orgId))
  }, [refetchBoard])

  const fetchBoard = () => setRefetchBoard(!refetchBoard)

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
            recurring_days: task.recurring_days,
            recurring_time: task.recurring_time,
            recurring_id: task.recurring_id,
            assignees: task.users,
            labels: task.labels,
            complete: task.complete
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

  const handleEditCard = card => {
    setSelectedCard(card)
    setFormOpen(true)
  }

  // Usage in your component:
  const handleCardMoveAcrossLanes = (fromLaneId, toLaneId, cardId) => {
    dispatch(moveTask({ taskId: cardId, toLaneId }))
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
        onCardMoveAcrossLanes={handleCardMoveAcrossLanes}
        editable
        collapsibleLanes
        laneDraggable={false}
        cardDraggable={true}
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
          Card: props => <CustomCard {...props} orgId={orgId} onSelect={handleEditCard} />,
          LaneFooter: CollapseButton,
          NewLaneSection: props => <AddLaneButton {...props} onSelect={handleAddLane} />
        }}
      />
      s
      {formOpen && (
        <CardForm
          open={formOpen}
          orgId={orgId}
          setOpen={setFormOpen}
          selectedCard={selectedCard}
          selectedLane={selectedLane}
          users={kanbanState.users}
          labels={kanbanState.labels}
          refetch={fetchBoard}
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
      {
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      }
    </Container>
  )
}

export default Kanbanboard
