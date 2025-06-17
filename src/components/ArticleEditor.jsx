// src/components/ArticleEditor.jsx
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import { TextField, Button, Box, Paper, Typography, CircularProgress } from '@mui/material';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ArticleEditor = ({ articleId, onSaveSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (articleId) {
      setLoading(true);
      const docRef = doc(db, "articles", articleId);
      getDoc(docRef)
        .then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || '');
            setAuthor(data.author || '');
            setContent(data.content || '');
          } else {
            setError("Article not found.");
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading article for edit:", err);
          setError("Failed to load article for editing.");
          setLoading(false);
        });
    } else {
      // Reset fields for new article
      setTitle('');
      setAuthor('');
      setContent('');
    }
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      setSaving(false);
      return;
    }

    try {
      const articleData = {
        title: title.trim(),
        author: author.trim() || 'Admin', // Default author
        content: content,
        publishedDate: serverTimestamp(), // Firestore timestamp
      };

      if (articleId) {
        // Update existing article
        const docRef = doc(db, "articles", articleId);
        await updateDoc(docRef, articleData);
        console.log("Article updated successfully!");
      } else {
        // Add new article
        await addDoc(collection(db, "articles"), articleData);
        console.log("Article added successfully!");
      }
      onSaveSuccess();
    } catch (err) {
      console.error("Error saving article:", err);
      setError("Failed to save article. Please check your network and Firebase rules.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Article for Edit...</Typography>
      </Box>
    );
  }

  const quillModules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ 'size': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {articleId ? "Edit Article" : "Create New Article"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Author"
          variant="outlined"
          fullWidth
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Content</Typography>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Start typing your article content here..."
            style={{ height: '300px', marginBottom: '50px' }} // Adjust height for better UX
          />s
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : (articleId ? "Update Article" : "Save Article")}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ArticleEditor;