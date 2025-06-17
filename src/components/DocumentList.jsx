// src/components/DocumentList.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Paper, Typography, Box, Button, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
      const documentsData = snapshot.docs.map(docSnapshot => { // Renamed 'doc' to 'docSnapshot' for clarity
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Documents...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
        <Typography variant="h6">Error:</Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Your Documents
        </Typography>
        <Button variant="contained" color="primary" onClick={onCreateNewDocument}>
          Create New Document
        </Button>
      </Box>
      {documents.length === 0 ? (
        <Typography variant="body1">No documents found. Create one!</Typography>
      ) : (
        <List>
          {documents.map((docItem) => ( // Renamed 'doc' to 'docItem' to avoid potential conflicts/confusion
            <ListItem key={docItem.id} divider>
              <ListItemText
                primary={docItem.title || "Untitled Document"}
                // Now docItem.lastModified is guaranteed to be a Date object or null
                secondary={`Last Modified: ${docItem.lastModified ? docItem.lastModified.toLocaleDateString() : 'N/A'}`}
              />
              <ListItemSecondaryAction>
                {/* View Button */}
                <IconButton edge="end" aria-label="view" onClick={() => onOpenDocumentForView(docItem.id)}>
                  <VisibilityIcon />
                </IconButton>
                {/* Edit Button */}
                <IconButton edge="end" aria-label="edit" onClick={() => onOpenDocumentForEdit(docItem.id)}>
                  <EditIcon />
                </IconButton>
                {/* Delete Button */}
                <IconButton edge="end" aria-label="delete" onClick={() => confirmDelete(docItem.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default DocumentList;
