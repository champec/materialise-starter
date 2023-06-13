import React from 'react'
import { EditorState, convertToRaw } from 'draft-js'
import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { TextField, Box } from '@mui/material'

function BroadcastMessageForm({ formValues, setFormValues }) {
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty())

  const handleEditorChange = state => {
    setEditorState(state)
    const rawContentState = convertToRaw(state.getCurrentContent())
    const rawContentStateJson = JSON.stringify(rawContentState)
    setFormValues(prev => ({ ...prev, messageBody: rawContentStateJson }))
  }

  const handleSubjectChange = event => {
    setFormValues(prev => ({ ...prev, subject: event.target.value }))
  }

  return (
    <form>
      <Box mt={2}>
        <TextField value={formValues.subject} onChange={handleSubjectChange} label='Subject' fullWidth />
      </Box>
      <Box mt={2}>
        <EditorWrapper>
          <ReactDraftWysiwyg editorState={editorState} onEditorStateChange={handleEditorChange} />
        </EditorWrapper>
      </Box>
    </form>
  )
}

export default BroadcastMessageForm

// This will store the rich text content as a JSON string in the messageBody field. When you retrieve this data from the database, you can parse the JSON string back into a raw content state object, and then convert it back into an EditorState object to display in the editor:

// jsx
// Copy code
// import { convertFromRaw, EditorState } from 'draft-js';

// // ...

// const rawContentState = JSON.parse(messageBodyFromDatabase);
// const contentState = convertFromRaw(rawContentState);
// const editorState = EditorState.createWithContent(contentState);
