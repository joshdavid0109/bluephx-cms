// src/components/MobileAppPreview.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Menu as MenuIcon } from '@mui/icons-material';
import DOMPurify from 'dompurify'; // For sanitizing HTML

// Custom CSS for Android-like styling
// You might want to move this to a separate CSS module (e.g., MobileAppPreview.module.css)
// or use Emotion's styled components for more complex styling
const previewStyles = {
  mobileFrame: {
    width: '375px', // Standard mobile width (e.g., iPhone X)
    height: '667px', // Standard mobile height
    border: '8px solid #333', // Dark border for phone bezel effect
    borderRadius: '36px', // Rounded corners for phone
    overflow: 'hidden', // Hide overflow content
    boxShadow: '0px 0px 15px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff', // Screen background
    margin: 'auto', // Center the phone frame
  },
  statusBar: {
    backgroundColor: '#000', // Black status bar
    height: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 8px',
    color: '#fff',
    fontSize: '0.7rem',
  },
  // Simple status bar icons (placeholders)
  statusBarIcons: {
    display: 'flex',
    gap: '4px',
  },
  statusBarTime: {
    // For clock
  },
  appBar: {
    backgroundColor: '#1976d2', // Android default blue
    color: '#fff',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: 'none', // Remove MUI default shadow if desired
  },
  appBarTitle: {
    flexGrow: 1,
    fontSize: '1.1rem',
    fontWeight: 'medium',
    fontFamily: 'Roboto, sans-serif', // Closest to Android default
  },
  contentArea: {
    flexGrow: 1,
    overflowY: 'auto', // Enable scrolling for content
    padding: '16px',
    backgroundColor: '#f8f8f8', // Light background for content
    fontFamily: 'Roboto, sans-serif', // Ensure consistent font
    color: '#333',
    lineHeight: '1.6',
    '& h1, & h2, & h3, & h4, & h5, & h6': { // Target headings inside rendered HTML
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 'bold',
      marginTop: '1.5em',
      marginBottom: '0.8em',
      color: '#000',
    },
    '& h1': { fontSize: '1.5rem' }, // Mimic Android TextView sizes
    '& h2': { fontSize: '1.3rem' },
    '& h3': { fontSize: '1.2rem' },
    '& p': {
      marginBottom: '1em',
    },
    '& img': { // Style images to be responsive within the preview
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
      marginTop: '1em',
      marginBottom: '1em',
    },
  },
};

// Props:
// - documentTitle: The title of the document from the editor
// - documentContentHtml: The HTML content from the Quill editor
function MobileAppPreview({ documentTitle, documentContentHtml }) {
  const sanitizedContent = DOMPurify.sanitize(documentContentHtml);

  return (
    <Box sx={previewStyles.mobileFrame}>
      {/* Status Bar */}
      <Box sx={previewStyles.statusBar}>
        <span sx={previewStyles.statusBarTime}>02:03</span>
        <Box sx={previewStyles.statusBarIcons}>
          <span>📶</span> {/* Wifi icon */}
          <span>🔋</span> {/* Battery icon */}
        </Box>
      </Box>

      {/* App Bar / Toolbar */}
      <Box sx={previewStyles.appBar}>
        <ArrowBackIcon sx={{ fontSize: '1.2rem' }} /> {/* Back arrow icon */}
        <Typography sx={previewStyles.appBarTitle}>
          {documentTitle || "Untitled Document"}
        </Typography>
        <MenuIcon sx={{ fontSize: '1.2rem' }} /> {/* Menu icon */}
      </Box>

      {/* Content Area */}
      <Box sx={previewStyles.contentArea}>
        {/* Example: Mimic "CHAPTER I. GENERAL PROVISIONS" structure */}
        <Typography variant="h5" sx={{ textAlign: 'center', mt: 2, mb: 2, fontWeight: 'bold' }}>
          CHAPTER I. GENERAL PROVISIONS
        </Typography>
        {/* Render the sanitized HTML content from Quill */}
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

        {/* Example: Another chapter heading (might be part of content, or fixed) */}
        <Typography variant="h5" sx={{ textAlign: 'center', mt: 4, mb: 2, fontWeight: 'bold' }}>
          CHAPTER II. THE LAND REGISTRATION COMMISIOON AND ITS REGISTRIES OF DEEDS
        </Typography>
        {/* More content */}
      </Box>
    </Box>
  );
}

export default MobileAppPreview; // <<< THIS LINE IS CRUCIAL
