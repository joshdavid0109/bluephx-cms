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

  const editorHeight = PREVIEW_HEIGHT;

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
        <Grid item xs={12} lg={7}>
          <Fade in={true} timeout={800}>
            <Paper 
              elevation={8} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                p: 0.5
              }}
            >
              <Paper sx={{ p: 4, borderRadius: 2.5 }}>
                <form onSubmit={handleSubmit}>
                  {/* Title Input */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      Document Title
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your document title..."
                      disabled={saving}
                      required
                      error={error && error.includes("title")}
                      helperText={error && error.includes("title") ? error : ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            }
                          }
                        }
                      }}
                    />
                  </Box>

                  <Divider sx={{ mb: 4 }} />

                  {/* Content Editor */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      Document Content
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      height: editorHeight,
                      width: `calc(${PREVIEW_WIDTH} + ${TOOLBAR_WIDTH} + 16px)`,
                      maxWidth: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      {/* Toolbar */}
                      <Box
                        id="quill-toolbar"
                        sx={(theme) => ({
                          width: TOOLBAR_WIDTH,
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: 'rgba(25, 118, 210, 0.05)',
                          borderRight: `1px solid ${theme.palette.divider}`,
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
                            width: '36px',
                            height: '36px',
                            padding: '6px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            borderRadius: theme.shape.borderRadius,
                            transition: 'all 0.2s ease-in-out',
                            '&.ql-active': {
                              backgroundColor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              transform: 'scale(1.05)',
                              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                            },
                            '&:hover': {
                              backgroundColor: theme.palette.primary.light,
                              color: theme.palette.primary.contrastText,
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }
                          },
                          '& select': {
                            width: '60px',
                            height: '32px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.shape.borderRadius,
                            backgroundColor: theme.palette.background.paper,
                            cursor: 'pointer',
                            mb: 0.5,
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }
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

                      {/* Editor Area */}
                      <Box
                        sx={(theme) => ({
                          width: PREVIEW_WIDTH,
                          flexShrink: 0,
                          height: '100%',
                          '& .ql-container': {
                            height: '100%',
                            border: 'none',
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: theme.typography.body1.fontSize,
                            color: '#333333',
                            overflowY: 'auto',
                          },
                          '& .ql-editor.ql-blank::before': {
                            color: theme.palette.text.secondary,
                            fontStyle: 'italic',
                            fontFamily: 'Roboto, sans-serif',
                          },
                          '& .ql-editor': {
                            padding: '20px',
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
                          placeholder="Start crafting your masterpiece..."
                          readOnly={saving}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 2,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<CancelIcon />}
                      onClick={onCancel}
                      disabled={saving}
                      sx={{ 
                        minWidth: 120,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        py: 1.5,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={saving}
                      sx={{ 
                        minWidth: 120,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        py: 1.5,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                        }
                      }}
                    >
                      {saving ? 'Saving...' : (documentId ? "Update Document" : "Save Document")}
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Paper>
          </Fade>
        </Grid>

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
                documentTitle={title}
                documentContentHtml={content}
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