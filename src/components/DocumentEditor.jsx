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
  Backdrop,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
  MenuBook as MenuBookIcon,
  Topic as TopicIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Create as CreateIcon,
  Cancel as CancelIcon,
  TextFields as TextFieldsIcon
} from '@mui/icons-material';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import MobileAppPreview from './MobileAppPreview';

const PREVIEW_WIDTH = '375px';
const PREVIEW_HEIGHT = '667px';

function DocumentEditor({ documentId, onSaveSuccess, onCancel }) {
  // Document editor states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ReactQuill, setReactQuill] = useState(null);
  const [quillLoading, setQuillLoading] = useState(true);
  const [html, setHtml] = useState('');

  // Navigation states (integrated from NavBar)
  const [anchorElMainCodal, setAnchorElMainCodal] = useState(null);
  const [anchorElSubtopic, setAnchorElSubtopic] = useState(null);
  const [mainCodals, setMainCodals] = useState([]);
  const [selectedMainCodal, setSelectedMainCodal] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [currentSubtopic, setCurrentSubtopic] = useState(null);
  const [loadingMainCodals, setLoadingMainCodals] = useState(true);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  
  // Add new subtopic dialog states
  const [addSubtopicDialogOpen, setAddSubtopicDialogOpen] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [addingSubtopic, setAddingSubtopic] = useState(false);

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

  // Fetch main codals
  useEffect(() => {
    const fetchMainCodals = async () => {
      try {
        setLoadingMainCodals(true);
        const querySnapshot = await getDocs(collection(db, "codals"));
        const codalsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.id
        }));
        setMainCodals(codalsData);
        setError(null);

        const civilLaw = codalsData.find(codal => codal.name === 'Civil Law');
        if (civilLaw) {
          setSelectedMainCodal(civilLaw.id);
        } else if (codalsData.length > 0) {
          setSelectedMainCodal(codalsData[0].id);
        }
      } catch (err) {
        console.error("Error fetching main codals:", err);
        setError("Failed to load main codals.");
      } finally {
        setLoadingMainCodals(false);
      }
    };

    fetchMainCodals();
  }, []);

  // Fetch subtopics when main codal changes
  useEffect(() => {
    const fetchSubtopics = async () => {
      if (!selectedMainCodal) {
        setSubtopics([]);
        return;
      }

      try {
        setLoadingSubtopics(true);
        const subtopicsCollectionRef = collection(db, "codals", selectedMainCodal, "subtopics");
        const querySnapshot = await getDocs(subtopicsCollectionRef);

        const subtopicsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.id
        }));
        setSubtopics(subtopicsData);
        setError(null);
      } catch (err) {
        console.error(`Error fetching subtopics for ${selectedMainCodal}:`, err);
        setError(`Failed to load subtopics for ${selectedMainCodal}.`);
      } finally {
        setLoadingSubtopics(false);
      }
    };

    fetchSubtopics();
  }, [selectedMainCodal]);

  // Load document if editing
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

  useEffect(() => {
    setHtml(content);
  }, [content]);

  // Navigation handlers
  const handleMainCodalClick = (event) => {
    setAnchorElMainCodal(event.currentTarget);
  };

  const handleMainCodalClose = () => {
    setAnchorElMainCodal(null);
  };

  const handleSelectMainCodal = (codalId) => {
    setSelectedMainCodal(codalId);
    setCurrentSubtopic(null);
    handleMainCodalClose();
  };

  const handleSubtopicMenuClick = (event) => {
    setAnchorElSubtopic(event.currentTarget);
  };

  const handleSubtopicMenuClose = () => {
    setAnchorElSubtopic(null);
  };

  const handleSelectSubtopic = (subtopicName) => {
    setCurrentSubtopic(subtopicName);
    handleSubtopicMenuClose();
  };

  const handleAddNewSubtopic = () => {
    setAddSubtopicDialogOpen(true);
    handleSubtopicMenuClose();
  };

  const handleAddSubtopicSubmit = async () => {
    if (!newSubtopicName.trim() || !selectedMainCodal) return;

    setAddingSubtopic(true);
    try {
      const subtopicRef = doc(db, "codals", selectedMainCodal, "subtopics", newSubtopicName.trim());
      await updateDoc(subtopicRef, {
        name: newSubtopicName.trim(),
        createdAt: serverTimestamp()
      });

      // Refresh subtopics
      const subtopicsCollectionRef = collection(db, "codals", selectedMainCodal, "subtopics");
      const querySnapshot = await getDocs(subtopicsCollectionRef);
      const subtopicsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.id
      }));
      setSubtopics(subtopicsData);
      setCurrentSubtopic(newSubtopicName.trim());
      
      setNewSubtopicName('');
      setAddSubtopicDialogOpen(false);
    } catch (err) {
      console.error("Error adding subtopic:", err);
      setError("Failed to add new subtopic.");
    } finally {
      setAddingSubtopic(false);
    }
  };

  // Document save handler
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
        codal: selectedMainCodal,
        subtopic: currentSubtopic
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

  if (loading || quillLoading || loadingMainCodals) {
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
            {loading ? 'Loading Document...' : quillLoading ? 'Loading Editor...' : 'Loading Navigation...'}
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

  const currentMainCodalName = mainCodals.find(
    (codal) => codal.id === selectedMainCodal
  )?.name;

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'script', 'direction',
    'link', 'image', 'video', 'clean', 'color', 'background', 'align'
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Integrated Navigation Header */}
      <Fade in={true} timeout={600}>
        <Paper 
          elevation={0}
          sx={{ 
            mb: 4, 
            p: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '16px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }}>
                <MenuBookIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: '#1a1a1a',
                  letterSpacing: '-0.025em'
                }}
              >
                Document Editor
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Navigation Dropdowns */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* Main Codal Selection */}
              <Button 
                onClick={handleMainCodalClick}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<MenuBookIcon sx={{ fontSize: 18 }} />}
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderColor: '#667eea'
                  }
                }}
              >
                {currentMainCodalName || 'Select Codal'}
              </Button>
              
              <Menu
                anchorEl={anchorElMainCodal}
                open={Boolean(anchorElMainCodal)}
                onClose={handleMainCodalClose}
                PaperProps={{
                  sx: {
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    mt: 1,
                    minWidth: 220
                  }
                }}
              >
                {mainCodals.map((codal) => (
                  <MenuItem
                    key={codal.id}
                    onClick={() => handleSelectMainCodal(codal.id)}
                    selected={selectedMainCodal === codal.id}
                    sx={{
                      borderRadius: '12px',
                      mx: 1,
                      my: 0.5,
                      fontWeight: selectedMainCodal === codal.id ? 600 : 400,
                      color: selectedMainCodal === codal.id ? '#04183B' : '#04183B',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.08)'
                      },
                      '&.Mui-selected': {
                        background: 'rgba(102, 126, 234, 0.12)',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.16)'
                        }
                      }
                    }}
                  >
                    <MenuBookIcon sx={{ mr: 2, fontSize: 18, opacity: 0.7 }} />
                    {codal.name}
                  </MenuItem>
                ))}
              </Menu>

              {/* Subtopic Selection */}
              {selectedMainCodal && (
                <Button
                  onClick={handleSubtopicMenuClick}
                  endIcon={<ArrowDropDownIcon />}
                  startIcon={<TopicIcon sx={{ fontSize: 18 }} />}
                  variant="outlined"
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    color: '#04183B',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.08)',
                      borderColor: '#667eea'
                    }
                  }}
                >
                  {currentSubtopic || 'Select Topic'}
                </Button>
              )}
              
              <Menu
                anchorEl={anchorElSubtopic}
                open={Boolean(anchorElSubtopic)}
                onClose={handleSubtopicMenuClose}
                PaperProps={{
                  sx: {
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    mt: 1,
                    minWidth: 280,
                    maxHeight: 400
                  }
                }}
              >
                {/* Add new subtopic option */}
                <MenuItem
                  onClick={handleAddNewSubtopic}
                  sx={{
                    borderRadius: '12px',
                    mx: 1,
                    my: 0.5,
                    fontWeight: 600,
                    color: '#04183B',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      background: 'rgba(34, 197, 94, 0.08)'
                    }
                  }}
                >
                  <AddIcon sx={{ mr: 2, fontSize: 18 }} />
                  Add New Subtopic
                </MenuItem>
                
                <Divider sx={{ mx: 1, my: 1 }} />
                
                {loadingSubtopics ? (
                  <MenuItem disabled sx={{ justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    Loading topics...
                  </MenuItem>
                ) : (
                  subtopics.map((subtopic) => (
                    <MenuItem
                      key={subtopic.id}
                      onClick={() => handleSelectSubtopic(subtopic.name)}
                      selected={currentSubtopic === subtopic.name}
                      sx={{
                        borderRadius: '12px',
                        mx: 1,
                        my: 0.5,
                        fontWeight: currentSubtopic === subtopic.name ? 600 : 400,
                        color: currentSubtopic === subtopic.name ? '#667eea' : '#374151',
                        py: 1.5,
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.08)'
                        },
                        '&.Mui-selected': {
                          background: 'rgba(102, 126, 234, 0.12)',
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.16)'
                          }
                        }
                      }}
                    >
                      <TopicIcon sx={{ mr: 2, fontSize: 18, opacity: 0.7 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                        {subtopic.name}
                      </Typography>
                    </MenuItem>
                  ))
                )}
              </Menu>

              {/* Current Selection Display */}
              {currentSubtopic && (
                <Chip
                  label={currentSubtopic}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Fade in={true}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Editor and Preview Grid */}
      <Grid container spacing={4}>
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
                documentTitle={title || "Document Title"}
                documentContentHtml={html}
                onMobileEditorChange={(value) => setHtml(value)}
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

      {/* Add New Subtopic Dialog */}
      <Dialog 
        open={addSubtopicDialogOpen} 
        onClose={() => setAddSubtopicDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AddIcon sx={{ color: '#22c55e' }} />
            Add New Subtopic
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Subtopic Name"
            value={newSubtopicName}
            onChange={(e) => setNewSubtopicName(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will be added to the "{currentMainCodalName}" codal.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setAddSubtopicDialogOpen(false)}
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddSubtopicSubmit}
            variant="contained"
            disabled={!newSubtopicName.trim() || addingSubtopic}
            startIcon={addingSubtopic ? <CircularProgress size={16} /> : <AddIcon />}
            sx={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
              }
            }}
          >
            {addingSubtopic ? 'Adding...' : 'Add Subtopic'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DocumentEditor;