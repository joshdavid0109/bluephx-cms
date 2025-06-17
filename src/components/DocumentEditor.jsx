// src/components/DocumentEditor.jsx
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS
import { TextField, Button, Box, Paper, Typography, CircularProgress, Grid } from '@mui/material'; // Added Grid
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import MobileAppPreview from './MobileAppPreview'; // Import the new preview component

// Props:
// - documentId: ID of the document to edit (null for new document)
// - onSaveSuccess: Callback after successful save
// - onCancel: Callback to cancel editing/creation
function DocumentEditor({ documentId, onSaveSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Quill content (HTML string)
  const [loading, setLoading] = useState(false); // For loading existing document
  const [saving, setSaving] = useState(false);   // For save operation
  const [error, setError] = useState(null);

  // Load document data if documentId is provided (for editing)
  useEffect(() => {
    if (documentId) {
      setLoading(true);
      const docRef = doc(db, "documents", documentId);
      getDoc(docRef)
        .then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || '');
            setContent(data.content || '');
            setError(null);
          } else {
            setError("Document not found.");
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading document for edit:", err);
          setError("Failed to load document for editing.");
          setLoading(false);
        });
    } else {
      setTitle('');
      setContent('');
      setError(null);
    }
  }, [documentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!title.trim()) {
      setError("Document title cannot be empty.");
      setSaving(false);
      return;
    }
    const isContentEmpty = content.replace(/<[^>]*>/g, '').trim().length === 0;
    if (isContentEmpty) {
      setError("Document content cannot be empty.");
      setSaving(false);
      return;
    }

    try {
      const documentData = {
        title: title.trim(),
        content: content,
        lastModified: serverTimestamp(),
      };

      if (documentId) {
        const docRef = doc(db, "documents", documentId);
        await updateDoc(docRef, documentData);
        console.log("Document updated successfully! ID:", documentId);
      } else {
        const newDocRef = await addDoc(collection(db, "documents"), documentData);
        console.log("Document added successfully! ID:", newDocRef.id);
      }
      onSaveSuccess();
    } catch (err) {
      console.error("Error saving document:", err);
      setError(`Failed to save document: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Document...</Typography>
      </Box>
    );
  }

  const quillModules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'script', 'direction',
    'link', 'image', 'video', 'clean', 'color', 'background', 'align'
  ];

  return (
    <Grid container spacing={4}>
      {/* Editor Panel */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            {documentId ? "Edit Document" : "Create New Document"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Document Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
              disabled={saving}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Content</Typography>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Start typing your document content here..."
                style={{ height: '300px', marginBottom: '50px' }}
                readOnly={saving}
              />
            </Box>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving}>
                {saving ? <CircularProgress size={24} /> : (documentId ? "Update Document" : "Save Document")}
              </Button>
            </Box>
          </form>
        </Paper>
      </Grid>

      {/* Live Preview Panel */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mt: { xs: 0, md: 4 } }}>
        <MobileAppPreview
          documentTitle={title}
          documentContentHtml={content}
        />
      </Grid>
    </Grid>
  );
}

export default DocumentEditor;
