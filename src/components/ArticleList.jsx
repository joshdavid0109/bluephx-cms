// src/components/ArticleList.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore'; 
import { db } from '../firebase/config'; // Import your Firestore instance
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Paper, Typography, Box, Button, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function ArticleList({ onAddArticle, onEditArticle }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const articlesCollectionRef = collection(db, "articles");
    // Create a query to order articles by publishedDate (newest first)
    const q = query(articlesCollectionRef, orderBy("publishedDate", "desc"));

    // Set up a real-time listener for the articles collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticles(articlesData);
      setLoading(false);
      setError(null); // Clear any previous errors
    }, (err) => {
      console.error("Error fetching articles:", err);
      setError("Failed to load articles. Please check your network and Firebase rules.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteDoc(doc(db, "articles", id));
        console.log("Article deleted successfully!");
      } catch (err) {
        console.error("Error deleting article:", err);
      }
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Articles...</Typography>
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
          Articles
        </Typography>
        {/* Corrected: Use onAddArticle prop */}
        <Button variant="contained" color="primary" onClick={onAddArticle} >
          Add New Article
        </Button>
      </Box>
      {articles.length === 0 ? (
        <Typography variant="body1">No articles found. Add one!</Typography>
      ) : (
        <List>
          {articles.map((article) => (
            <ListItem key={article.id} divider>
              <ListItemText
                primary={article.title || "Untitled Article"}
                secondary={`By ${article.author || 'Unknown'} - ${article.publishedDate ? new Date(article.publishedDate.toDate()).toLocaleDateString() : 'N/A'}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => onEditArticle(article.id)} >
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(article.id)} >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default ArticleList;