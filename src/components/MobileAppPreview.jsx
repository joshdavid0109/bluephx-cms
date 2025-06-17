// src/components/MobileAppPreview.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import DOMPurify from 'dompurify';

// No AndroidColors object to avoid conflicts/specific definitions
// Using generic, visible colors instead.

// Define styles focusing only on the content area
const previewStyles = {
  contentAreaFrame: {
    width: '375px', // Fixed width to imitate a mobile screen
    height: '667px', // Fixed height to imitate a mobile screen (adjust as needed for aspect ratio)
    overflowY: 'scroll', // Explicitly enable scrolling for content that overflows
    backgroundColor: '#FFFFFF', // White background
    borderRadius: '12px',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
    p: '15px',
    pt: '10px',
    pb: '15px',
    border: `1px solid #CCCCCC`, // Neutral gray border
    
    // Default text color for the entire content area, as a fallback
    color: '#333333', // Dark gray for general text (visible on white)

    // Styles for content rendered via dangerouslySetInnerHTML
    // These styles mimic your Android app's text appearance, but with generic colors
    '& h1, & h2': { // Targeting H1 and H2 for chapter titles
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 'bold',
      color: '#222222', // Very dark gray/near black for headings
      textAlign: 'center',
      textTransform: 'uppercase',
      marginTop: '1.5em',
      marginBottom: '0.8em',
      lineHeight: '1.2',
    },
    '& h1': { fontSize: '1.5rem' },
    '& h2': { fontSize: '1.3rem' },
    '& h3, & h4, & h5, & h6': { // Other headings
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 'bold',
        marginTop: '1em',
        marginBottom: '0.5em',
        color: '#222222', // Very dark gray/near black for other headings
    },
    '& p': { // Paragraph styles
      marginBottom: '1em',
      color: '#333333', // Dark gray for body text
      fontFamily: 'Roboto, sans-serif', // Default for body text
      lineHeight: '1.6',
    },
    '& img': { // Image styles
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
      marginTop: '1em',
      marginBottom: '1em',
    },
  },
};

// Props:
// - documentContentHtml: The HTML content from the Quill editor (for rendering)
function MobileAppPreview({ documentContentHtml }) {
  // Sanitize HTML content before rendering to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(documentContentHtml);

  return (
    // The main container for your content preview
    <Box sx={previewStyles.contentAreaFrame}>
      {/* Render the sanitized HTML content directly within this box */}
      {/* The color property on the parent Box will act as a strong default for all text */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </Box>
  );
}

export default MobileAppPreview;
