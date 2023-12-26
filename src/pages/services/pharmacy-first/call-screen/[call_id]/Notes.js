import React, { useEffect, useRef, useState } from 'react'
// ** Third Party Imports
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'
// ** Styles
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

// ** Component Import
import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'
import { Box, Button, TextField, Typography } from '@mui/material'

function Notes({ value, setValue, EditorState }) {
  const [noteTitle, setNoteTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')

  const handleSave = () => {
    // Handle saving the note title and content
    console.log('Note Title:', noteTitle)
    console.log('Note Content:', editorContent)
    // Implement save logic here
  }

  return (
    <EditorWrapper>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Typography variant='h4' sx={{ mb: 2 }}>
          Take notes
        </Typography>

        <ReactDraftWysiwyg editorState={value} onEditorStateChange={data => setValue(data)} />

        <Button variant='contained' color='primary' onClick={handleSave} sx={{ mt: 2 }}>
          Save Note
        </Button>
      </Box>
    </EditorWrapper>
  )
}

export default Notes
