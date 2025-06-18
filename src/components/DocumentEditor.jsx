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
} from '@mui/material';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import MobileAppPreview from './MobileAppPreview';

const PREVIEW_WIDTH = '375px';
const PREVIEW_HEIGHT = '667px';
const TOOLBAR_WIDTH = '100px';

function DocumentEditor({ documentId, onSaveSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ReactQuill, setReactQuill] = useState(null);
  const [quillLoading, setQuillLoading] = useState(true);

  // Load ReactQuill dynamically
  useEffect(() => {
    const loadQuill = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const quillModule = await import('react-quill');
        // Import CSS
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {loading ? 'Loading Document...' : 'Loading Editor...'}
        </Typography>
      </Box>
    );
  }

  if (!ReactQuill) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="error">
          Failed to load text editor. Please refresh the page.
        </Typography>
      </Box>
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

  const editorHeight = PREVIEW_HEIGHT;

  return (
    <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={4} sx={{ p: { xs: 2, md: 2 }, mt: 2, borderRadius: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            {documentId ? "Edit Document" : "Create New Document"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Document Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ 
                mb: 3,
                width: `calc(${PREVIEW_WIDTH} + ${TOOLBAR_WIDTH} + 16px)`,
                maxWidth: '100%'
              }}
              disabled={saving}
              required
              error={error && error.includes("title")}
              helperText={error && error.includes("title") ? error : ''}
            />

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              height: editorHeight,
              width: `calc(${PREVIEW_WIDTH} + ${TOOLBAR_WIDTH} + 16px)`,
              maxWidth: '100%'
            }}>

              {/* Separate Toolbar Container (Left Side) */}
              <Box
                id="quill-toolbar"
                sx={(theme) => ({
                  width: TOOLBAR_WIDTH,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  backgroundColor: theme.palette.action.hover,
                  p: 1,
                  height: '100%',

                  '& .ql-toolbar': {
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  },
                  '& .ql-formats': {
                    display: 'flex',
                    flexDirection: 'column',
                    mb: 1,
                    width: 'auto',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                  },
                  '& button': {
                    width: '32px',
                    height: '32px',
                    padding: '3px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    '&.ql-active': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      borderRadius: theme.shape.borderRadius,
                    },
                    '&:hover': {
                        backgroundColor: theme.palette.action.selected,
                        borderRadius: theme.shape.borderRadius,
                    }
                  },
                  '& select': {
                    width: '50px',
                    height: '32px',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                    cursor: 'pointer',
                    mb: 0.5,
                    fontSize: '0.8rem',
                  },
                  '& button .ql-stroke, & button .ql-fill': {
                    strokeWidth: '1.5',
                  },
                })}
              >
                <span className="ql-formats">
                    <select className="ql-header">
                        <option value="1"></option>
                        <option value="2"></option>
                        <option selected></option>
                    </select>
                </span>
                <span className="ql-formats">
                    <select className="ql-font"></select>
                </span>
                <span className="ql-formats">
                    <select className="ql-size"></select>
                </span>
                <span className="ql-formats">
                    <button className="ql-bold"></button>
                    <button className="ql-italic"></button>
                    <button className="ql-underline"></button>
                    <button className="ql-strike"></button>
                </span>
                <span className="ql-formats">
                    <button className="ql-script" value="sub"></button>
                    <button className="ql-script" value="super"></button>
                </span>
                <span className="ql-formats">
                    <button className="ql-indent" value="-1"></button>
                    <button className="ql-indent" value="+1"></button>
                </span>
                <span className="ql-formats">
                    <button className="ql-direction" value="rtl"></button>
                </span>
                <span className="ql-formats">
                    <button className="ql-list" value="ordered"></button>
                    <button className="ql-list" value="bullet"></button>
                </span>
                <span className="ql-formats">
                    <select className="ql-align"></select>
                </span>
                <span className="ql-formats">
                    <button className="ql-link"></button>
                    <button className="ql-image"></button>
                    <button className="ql-video"></button>
                </span>
                <span className="ql-formats">
                    <select className="ql-color"></select>
                    <select className="ql-background"></select>
                </span>
                <span className="ql-formats">
                    <button className="ql-clean"></button>
                </span>
              </Box>

              {/* Text Area (Quill Editor) - Right Side */}
              <Box
                sx={(theme) => ({
                  width: PREVIEW_WIDTH,
                  flexShrink: 0,
                  height: '100%',
                  '& .ql-container': {
                    height: '100%',
                    borderRadius: theme.shape.borderRadius,
                    border: `1px solid ${theme.palette.divider}`,
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: theme.typography.body1.fontSize,
                    color: '#333333',
                    overflowY: 'auto',
                  },
                  '& .ql-editor.ql-blank::before': {
                    color: theme.palette.text.secondary,
                    fontStyle: 'normal',
                    fontFamily: 'Roboto, sans-serif',
                  },
                  '& .ql-editor': {
                    padding: '15px',
                    pt: '10px',
                    pb: '15px',
                    lineHeight: '1.6',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',

                    '& h1, & h2, & h3, & h4, & h5, & h6, & p, & li, & span, & div': {
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                    },
                    '& h1, & h2': {
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 'bold',
                      color: '#222222',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      marginTop: '1.5em',
                      marginBottom: '0.8em',
                      lineHeight: '1.2',
                    },
                    '& h1': { fontSize: '1.5rem' },
                    '& h2': { fontSize: '1.3rem' },
                    '& h3, & h4, & h5, & h6': {
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 'bold',
                      marginTop: '1em',
                      marginBottom: '0.5em',
                      color: '#222222',
                    },
                    '& p': {
                        marginBottom: '1em',
                        color: '#333333',
                        fontFamily: 'Roboto, sans-serif',
                        lineHeight: '1.6',
                    },
                    '& img': {
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      marginTop: '1em',
                      marginBottom: '1em',
                      display: 'block',
                    },
                    '& table': {
                        width: '100%',
                        tableLayout: 'fixed',
                        wordBreak: 'break-all',
                    },
                    '& th, & td': {
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                    },
                    '& pre': {
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowX: 'hidden',
                    },
                    '& ul, & ol': {
                        paddingLeft: '1.5em',
                        margin: '1em 0',
                    },
                    '& li': {
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        marginBottom: '0.5em',
                    }
                  },
                })}
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Start typing your document content here..."
                  readOnly={saving}
                />
              </Box>
            </Box>
            {error && error.includes("content") && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{error}</Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
                disabled={saving}
                sx={{ minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                sx={{ minWidth: 100 }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : (documentId ? "Update" : "Save")}
              </Button>
            </Box>
          </form>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mt: { xs: 0, md: 2 } }}>
        <MobileAppPreview
          documentTitle={title}
          documentContentHtml={content}
        />
      </Grid>
    </Grid>
  );
}

export default DocumentEditor;