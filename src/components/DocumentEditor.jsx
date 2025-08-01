// src/components/DocumentEditor.jsx
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Container,
  Fade,
  Chip,
  Divider,
  Alert,
  Backdrop
} from '@mui/material';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import MobileAppPreview from './MobileAppPreview';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CreateIcon from '@mui/icons-material/Create';
import CancelIcon from '@mui/icons-material/Cancel';
import TextFieldsIcon from '@mui/icons-material/TextFields';

const PREVIEW_WIDTH = '375px';
const PREVIEW_HEIGHT = '667px';

function DocumentEditor({ documentId, onSaveSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ReactQuill, setReactQuill] = useState(null);
  const [quillLoading, setQuillLoading] = useState(true);
  const [html, setHtml] = useState('');


  // Load ReactQuill dynamically
  useEffect(() => {
    const loadQuill = async () => {
      try {
        const quillModule = await import('react-quill');
        await import('react-quill/dist/quill.snow.css');
        setReactQuill(() => quillModule.default);
      } catch (error) {
        console.error('Failed to load ReactQuill:', error);
        setError('Failed to load text editor. Please refresh the page.');
      } finally {
        setQuillLoading(false);
      }
    };

    loadQuill();
  }, []);

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

  if (loading || quillLoading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24
        }}>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>
            {loading ? 'Loading Document...' : 'Loading Editor...'}
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!ReactQuill) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6">Failed to load text editor</Typography>
          <Typography>Please refresh the page and try again.</Typography>
        </Alert>
      </Container>
    );
  }

  const quillModules = {
    toolbar: {
      container: "#quill-toolbar",
    },
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'script', 'direction',
    'link', 'image', 'video', 'clean', 'color', 'background', 'align'
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Fade in={true} timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {documentId ? <EditIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} /> : 
                         <CreateIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />}
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {documentId ? "Edit Document" : "Create New Document"}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {documentId ? "Make changes to your document and see the live preview" : "Start creating your new document with our rich text editor"}
          </Typography>
          <Chip 
            icon={<TextFieldsIcon />}
            label={documentId ? "Editing Mode" : "Creation Mode"}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Fade in={true}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      <Grid container spacing={4}>
        {/* Editor Section */}
      

        {/* Preview Section */}
        <Grid item xs={12} lg={5}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              position: 'sticky',
              top: 24
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  color: 'text.primary',
                  textAlign: 'center'
                }}
              >
                📱 Live Preview
              </Typography>
              <MobileAppPreview
                documentTitle="My Doc"
                documentContentHtml={html}
                onMobileEditorChange={(value) => setHtml(value)} // ✅ this is correct
              />
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}
              >
                See how your document will look on mobile devices
              </Typography>
            </Box>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DocumentEditor;