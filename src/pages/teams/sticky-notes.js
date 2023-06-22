import React, { useEffect, useState, Fragment } from 'react'
import StickyNoteBoard from 'src/@core/components/teams/stickyNotes/StickyNoteBoard'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { supabaseOrg } from 'src/configs/supabase'
import { useUserAuth } from 'src/hooks/useAuth'
import { Snackbar, Button, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'

function StickyNotes() {
  const orgId = useOrgAuth()?.organisation?.id
  const userId = useUserAuth()?.user?.id
  const supabase = supabaseOrg
  const [notes, setNotes] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    const { data: notes, error } = await supabase
      .from('sticky_notes')
      .select(
        `
            *,
            user:profiles!sticky_notes_user_id_fkey (username)
        `
      )
      .eq('org_id', orgId)

    if (error) {
      console.error('Error loading notes:', error)
      return
    }

    // now notes include username and organisation name
    setNotes(notes)
  }

  const addNote = async note => {
    console.log({ note }, 'uuid', orgId, userId)
    const { data, error } = await supabase.from('sticky_notes').upsert(
      [
        {
          ...(note?.id && { id: note.id }),
          position: note.position,
          priority: note.priority,
          message: note.message,
          color: note.color,
          org_id: orgId,
          user_id: userId
        }
      ],
      { returning: 'minimal', onConflict: 'id' }
    )
    if (error) {
      console.log('Error upserting note:', error)
      setError(error)
      setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id))
    } else {
      console.log('NOTED ADDED SUCCESSFULLY')
      // setNotes(prevNotes => prevNotes.map(n => (n.id === note.id ? data : n)))
    }
  }

  const handleDeleteNote = async note => {
    const { error } = await supabase.from('sticky_notes').delete().eq('id', note.id)

    if (error) {
      console.log('Error deleting note:', error)
      setNotes(prevNotes => [...prevNotes, note])
      setError(error)
    } else {
      console.log('NOTE DELETED SUCCESSFULLY')
      // setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
    }
  }

  return (
    <div>
      <StickyNoteBoard notes={notes} onNoteSubmit={addNote} setNotes={setNotes} onNoteDelete={handleDeleteNote} />
      <Snackbar
        open={error}
        onClose={() => setError(null)}
        message={error?.message || 'Something went wrong'}
        autoHideDuration={3000}
        action={
          <Fragment>
            <Button size='small' onClick={() => setError(null)}>
              Undo
            </Button>
            <IconButton size='small' aria-label='close' color='inherit' onClick={() => setError(null)}>
              <Icon icon='mdi:close' fontSize={20} />
            </IconButton>
          </Fragment>
        }
      />
    </div>
  )
}

export default StickyNotes
