// src/components/MobileAppPreview.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DOMPurify from 'dompurify';

const previewStyles = {
    innerContentBox: {
        flexGrow: 1,
        overflowY: 'scroll',
        overflowX: 'hidden',
        backgroundColor: '#FFFFFF',
        p: '15px',
        pt: '10px',
        pb: '15px',
        color: '#333333',

        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        whiteSpace: 'normal',

        '& > div': {
            boxSizing: 'border-box',
            width: '100%',
        },

        // --- Core Quill Formatting Styles (continued) ---

        // Basic Text Formatting (Bold, Italic, Underline, Strike)
        '& strong, & b': { fontWeight: 'bold' },
        '& em, & i': { fontStyle: 'italic' },
        '& u': { textDecoration: 'underline' },
        '& s, & del': { textDecoration: 'line-through' },

        // Headings
        '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            color: '#222222',
            marginTop: '1.5em',
            marginBottom: '0.8em',
            lineHeight: '1.2',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
        },
        '& h1': { fontSize: '1.5rem', textAlign: 'center', textTransform: 'uppercase' },
        '& h2': { fontSize: '1.3rem', textAlign: 'center', textTransform: 'uppercase' },
        '& h3': { fontSize: '1.2rem' },
        '& h4': { fontSize: '1.1rem' },
        '& h5': { fontSize: '1rem' },
        '& h6': { fontSize: '0.9rem' },

        // Paragraphs
        '& p': {
            marginBottom: '1em',
            color: '#333333',
            fontFamily: 'Roboto, sans-serif',
            lineHeight: '1.6',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
        },

        // Lists
        '& ul, & ol': {
            paddingLeft: '1.5em',
            margin: '1em 0',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
        },
        '& li': {
            marginBottom: '0.5em',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
        },

        // Blockquotes
        '& blockquote': {
            borderLeft: '4px solid #ccc',
            margin: '1.5em 10px',
            padding: '0.5em 10px',
            fontStyle: 'italic',
            color: '#555',
            backgroundColor: '#f9f9f9',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
        },

        // Code Blocks (pre, code)
        '& pre': {
            backgroundColor: '#272822',
            color: '#f8f8f2',
            padding: '1em',
            borderRadius: '5px',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'monospace',
            fontSize: '0.9em',
        },
        '& code': {
            fontFamily: 'monospace',
            backgroundColor: '#eee',
            padding: '0.2em 0.4em',
            borderRadius: '3px',
            fontSize: '0.9em',
        },

        // Links
        '& a': {
            color: '#007bff',
            textDecoration: 'underline',
        },

        // Images
        '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            marginTop: '1em',
            marginBottom: '1em',
            display: 'block',
        },

        // Tables
        '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            margin: '1em 0',
            tableLayout: 'fixed',
            wordBreak: 'break-all',
        },
        '& th, & td': {
            border: '1px solid #ddd',
            padding: '8px',
            textAlign: 'left',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
        },
        '& th': {
            backgroundColor: '#f2f2f2',
            fontWeight: 'bold',
        },

        // --- Justification (Alignment) Styles (Double check specificity) ---
        // Ensure these are specific enough. Using '& p.ql-align-center' or '& div.ql-align-center'
        // might be more robust if other rules are overriding generic '.ql-align-X'
        '& .ql-align-left': { textAlign: 'left !important' }, // Added !important as a common fix for specificity
        '& .ql-align-center': { textAlign: 'center !important' },
        '& .ql-align-right': { textAlign: 'right !important' },
        '& .ql-align-justify': { textAlign: 'justify !important' },


        // --- Indentation Styles (NEW) ---
        // Quill's default indentation levels are 3em for each level
        '& .ql-indent-1': { paddingLeft: '3em !important' },
        '& .ql-indent-2': { paddingLeft: '6em !important' },
        '& .ql-indent-3': { paddingLeft: '9em !important' },
        '& .ql-indent-4': { paddingLeft: '12em !important' },
        '& .ql-indent-5': { paddingLeft: '15em !important' },
        '& .ql-indent-6': { paddingLeft: '18em !important' },
        '& .ql-indent-7': { paddingLeft: '21em !important' },
        '& .ql-indent-8': { paddingLeft: '24em !important' },
        // You might also see negative margins for de-indent, though less common with Quill's standard setup
        // '& .ql-direction-rtl.ql-align-right.ql-indent-1': { marginRight: '3em' },
        // For RTL, Quill might use text-indent or padding-right, so check generated HTML if issues persist.
    },
    phoneFrame: {
        width: '375px',
        height: '667px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: `1px solid #CCCCCC`,
    },
    appBar: {
        p: 2,
        bgcolor: 'primary.main',
        color: 'white',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        textAlign: 'center',
        fontWeight: 'bold'
    }
};

function MobileAppPreview({ documentTitle, documentContentHtml }) {
    const sanitizedContent = DOMPurify.sanitize(documentContentHtml);

    return (
        <Paper elevation={6} sx={previewStyles.phoneFrame}>
            <Box sx={previewStyles.appBar}>
                {documentTitle || "Preview Title"}
            </Box>
            <Box sx={previewStyles.innerContentBox} className="preview-content-box">
                <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            </Box>
        </Paper>
    );
}

export default MobileAppPreview;