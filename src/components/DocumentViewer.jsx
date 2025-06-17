// src/components/DocumentViewer.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import DOMPurify from 'dompurify'; // For sanitizing HTML

// Props:
// - documentId: ID of the document to view
// - onBackToList: Callback to return to the document list
// - onEditDocument: Callback to open the document in the editor
function DocumentViewer({ documentId, onBackToList, onEditDocument }) {
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) {
      setError("No document ID provided for viewing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "documents", documentId);
    getDoc(docRef)
      .then(docSnap => {
        if (docSnap.exists()) {
          setDocumentData({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError("Document not found.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading document for view:", err);
        setError("Failed to load document for viewing.");
        setLoading(false);
      });
  }, [documentId]); // Re-run effect if documentId changes

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Document...</Typography>
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

  // Sanitize HTML content before rendering
  // IMPORTANT: Installing DOMPurify: npm install dompurify
  const sanitizedContent = DOMPurify.sanitize(documentData.content || '');

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {documentData.title || "Untitled Document"}
        </Typography>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }} onClick={onBackToList}>
            Back to List
          </Button>
          <Button variant="contained" color="primary" onClick={() => onEditDocument(documentData.id)}>
            Edit Document
          </Button>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Last Modified: {documentData.lastModified ? documentData.lastModified.toLocaleDateString() : 'N/A'}
      </Typography>
      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
        {/* Render HTML content */}
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </Box>
    </Paper>
  );
}

export default DocumentViewer;
