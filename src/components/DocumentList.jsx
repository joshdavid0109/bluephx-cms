// src/components/DocumentList.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Card, CardContent, CardActions, IconButton, Chip,
  Typography, Box, Button, CircularProgress, Grid,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Container, Fade, Tooltip, Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Props:
// - onCreateNewDocument: Function to switch to editor for new doc
// - onOpenDocumentForEdit: Function to open editor for an existing doc
// - onOpenDocumentForView: Function to open viewer for an existing doc
function DocumentList({ onCreateNewDocument, onOpenDocumentForEdit, onOpenDocumentForView }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDeleteId, setDocToDeleteId] = useState(null);

  useEffect(() => {
    const documentsCollectionRef = collection(db, "documents");
    // Order documents by 'lastModified' timestamp, newest first
    const q = query(documentsCollectionRef, orderBy("lastModified", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documentsData = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        
        // Ensure lastModified is a Date object or null
        const lastModifiedDate = data.lastModified && typeof data.lastModified.toDate === 'function'
                               ? data.lastModified.toDate() // Convert Firestore Timestamp to Date
                               : null; // If not a Timestamp or null/undefined, set to null

        return {
          id: docSnapshot.id,
          ...data, // Spread all existing data fields first
          lastModified: lastModifiedDate // Explicitly set the converted Date object (overwriting if needed)
        };
      });
      setDocuments(documentsData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents. Please check your network and Firebase rules.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handler to open delete confirmation dialog
  const confirmDelete = (id) => {
    setDocToDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  // Handler to perform actual deletion after confirmation
  const handleDelete = async () => {
    setDeleteConfirmOpen(false); // Close dialog
    if (docToDeleteId) {
      try {
        await deleteDoc(doc(db, "documents", docToDeleteId));
        console.log("Document deleted successfully! ID:", docToDeleteId);
        // UI will update automatically due to onSnapshot listener
      } catch (err) {
        console.error("Error deleting document:", err);
        setError(`Failed to delete document: ${err.message}`);
      } finally {
        setDocToDeleteId(null);
      }
    }
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get document initials for avatar
  const getDocumentInitials = (title) => {
    if (!title || title === "Untitled Document") return "UD";
    return title.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Loading your documents...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Card sx={{ 
          p: 4, 
          backgroundColor: 'error.light', 
          color: 'error.contrastText',
          textAlign: 'center'
        }}>
          <Typography variant="h6" gutterBottom>Something went wrong</Typography>
          <Typography variant="body1">{error}</Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 1
              }}
            >
              Your Documents
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {documents.length} document{documents.length !== 1 ? 's' : ''} in your workspace
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<AddIcon />}
            onClick={onCreateNewDocument}
            sx={{ 
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Create New Document
          </Button>
        </Box>
      </Box>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card sx={{ 
          p: 8, 
          textAlign: 'center',
          backgroundColor: 'grey.50',
          border: '2px dashed',
          borderColor: 'grey.300'
        }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No documents yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first document to get started
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={onCreateNewDocument}
            sx={{ borderRadius: 2 }}
          >
            Create Document
          </Button>
        </Card>
      
      ) : (
        <Box>
          {documents.map((docItem, index) => (
            <Fade in={true} timeout={300 + index * 100} key={docItem.id}>
              <Card 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 3,
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      mr: 2,
                      width: 48,
                      height: 48,
                      fontSize: '1.1rem'
                    }}>
                      {getDocumentInitials(docItem.title)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {docItem.title || "Untitled Document"}
                      </Typography>
                      <Chip 
                        icon={<AccessTimeIcon />}
                        label={formatDate(docItem.lastModified)}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4
                    }}
                  >
                    {docItem.content ? 
                      docItem.content.substring(0, 100) + (docItem.content.length > 100 ? '...' : '') :
                      'No content available'
                    }
                  </Typography>
                </CardContent>
                <CardActions 
                  sx={{ 
                    p: 2, 
                    pt: 0,
                    justifyContent: 'flex-end',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Tooltip title="View Document">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDocumentForView(docItem.id);
                      }}
                      sx={{ 
                        color: 'success.main',
                        '&:hover': { backgroundColor: 'success.light' }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Document">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDocumentForEdit(docItem.id);
                      }}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.light' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Document">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(docItem.id);
                      }}
                      sx={{ 
                        color: 'error.main',
                        '&:hover': { backgroundColor: 'error.light' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Fade>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400
          }
        }}
      >
        <DialogTitle 
          id="alert-dialog-title"
          sx={{ 
            pb: 1,
            fontSize: '1.25rem',
            fontWeight: 600
          }}
        >
          Delete Document?
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="alert-dialog-description"
            sx={{ fontSize: '1rem', lineHeight: 1.6 }}
          >
            This action cannot be undone. The document will be permanently deleted from your workspace.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained"
            color="error"
            autoFocus
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Delete Document
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DocumentList;