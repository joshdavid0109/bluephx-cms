// src/components/MobileAppPreview.jsx
import React from 'react';
import { Box, Typography, Paper, Chip, IconButton } from '@mui/material';
import DOMPurify from 'dompurify';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar';
import WifiIcon from '@mui/icons-material/Wifi';

const previewStyles = {
    // Phone frame with modern design
    phoneFrame: {
        width: '375px',
        height: '667px',
        borderRadius: '32px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#000000',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 25px rgba(0,0,0,0.2)',
        border: '3px solid #1a1a1a',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.4), 0 12px 35px rgba(0,0,0,0.3)'
        }
    },

    // Status bar
    statusBar: {
        height: '24px',
        bgcolor: '#000000',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 2,
        fontSize: '12px',
        fontWeight: 600,
        position: 'relative',
        zIndex: 10
    },

    // Modern app bar with gradient
    appBar: {
        height: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        position: 'relative',
        boxShadow: '0 2px 20px rgba(102, 126, 234, 0.3)',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none'
        }
    },

    // Content area with modern styling
    innerContentBox: {
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#fafafa',
        position: 'relative',
        
        // Custom scrollbar
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0,0,0,0.3)',
        },

        // Content styling
        '& > div': {
            padding: '24px 20px',
            minHeight: 'calc(100% - 48px)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
            position: 'relative',
            
            // Subtle pattern overlay
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(102, 126, 234, 0.05) 1px, transparent 0)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
                zIndex: 0
            },
            
            // Content wrapper
            '& > *': {
                position: 'relative',
                zIndex: 1
            }
        },

        // Typography and formatting styles
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        whiteSpace: 'normal',

        // Basic text formatting with modern touches
        '& strong, & b': { 
            fontWeight: 'bold',
            color: '#2c3e50'
        },
        '& em, & i': { 
            fontStyle: 'italic',
            color: '#34495e'
        },
        '& u': { 
            textDecoration: 'underline',
            textDecorationColor: '#3498db',
            textDecorationThickness: '2px'
        },
        '& s, & del': { 
            textDecoration: 'line-through',
            color: '#7f8c8d',
            opacity: 0.8
        },

        // Modern heading styles
        '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: '700',
            color: '#2c3e50',
            marginTop: '2em',
            marginBottom: '1em',
            lineHeight: '1.3',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            position: 'relative',
            
            // Subtle underline for headings
            '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                height: '3px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '2px',
                transition: 'width 0.3s ease'
            }
        },
        
        '& h1': { 
            fontSize: '1.8rem',
            textAlign: 'center',
            marginBottom: '1.5em',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            '&::after': { width: '80px' }
        },
        '& h2': { 
            fontSize: '1.5rem',
            textAlign: 'center',
            '&::after': { width: '60px' }
        },
        '& h3': { 
            fontSize: '1.3rem',
            '&::after': { width: '40px' }
        },
        '& h4': { 
            fontSize: '1.15rem',
            '&::after': { width: '30px' }
        },
        '& h5': { 
            fontSize: '1rem',
            '&::after': { width: '25px' }
        },
        '& h6': { 
            fontSize: '0.9rem',
            '&::after': { width: '20px' }
        },

        // Modern paragraph styling
        '& p': {
            marginBottom: '1.2em',
            color: '#2c3e50',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            lineHeight: '1.7',
            fontSize: '0.95rem',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
        },

        // Enhanced list styling
        '& ul, & ol': {
            paddingLeft: '1.5em',
            margin: '1.5em 0',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
        },
        '& ul': {
            listStyleType: 'none',
            '& li': {
                position: 'relative',
                paddingLeft: '1.5em',
                '&::before': {
                    content: '"•"',
                    position: 'absolute',
                    left: '0',
                    color: '#667eea',
                    fontWeight: 'bold',
                    fontSize: '1.2em'
                }
            }
        },
        '& ol li': {
            marginBottom: '0.8em',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            paddingLeft: '0.5em'
        },

        // Modern blockquote styling
        '& blockquote': {
            borderLeft: '4px solid #667eea',
            margin: '2em 0',
            padding: '1em 1.5em',
            fontStyle: 'italic',
            color: '#555',
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            borderRadius: '0 8px 8px 0',
            position: 'relative',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            boxShadow: '0 2px 10px rgba(102, 126, 234, 0.1)',
            
            '&::before': {
                content: '"❝"',
                position: 'absolute',
                top: '-10px',
                left: '10px',
                fontSize: '2em',
                color: '#667eea',
                background: '#ffffff',
                padding: '0 5px'
            }
        },

        // Enhanced code styling
        '& pre': {
            backgroundColor: '#2d3748',
            color: '#e2e8f0',
            padding: '1.5em',
            borderRadius: '12px',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: '"Fira Code", "Monaco", "Cascadia Code", monospace',
            fontSize: '0.85em',
            lineHeight: '1.5',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            
            '&::before': {
                content: '"</>"',
                position: 'absolute',
                top: '8px',
                right: '12px',
                fontSize: '0.8em',
                color: '#a0aec0',
                opacity: 0.6
            }
        },
        '& code': {
            fontFamily: '"Fira Code", "Monaco", monospace',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            color: '#667eea',
            padding: '0.3em 0.6em',
            borderRadius: '6px',
            fontSize: '0.9em',
            fontWeight: '500'
        },

        // Modern link styling
        '& a': {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '500',
            position: 'relative',
            transition: 'all 0.2s ease',
            
            '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-2px',
                left: '0',
                width: '0',
                height: '2px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                transition: 'width 0.3s ease'
            },
            
            '&:hover': {
                color: '#764ba2',
                '&::after': {
                    width: '100%'
                }
            }
        },

        // Enhanced image styling
        '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '12px',
            marginTop: '1.5em',
            marginBottom: '1.5em',
            display: 'block',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease',
            
            '&:hover': {
                transform: 'scale(1.02)'
            }
        },

        // Modern table styling
        '& table': {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            margin: '2em 0',
            tableLayout: 'fixed',
            wordBreak: 'break-word',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
        },
        '& th, & td': {
            padding: '12px 16px',
            textAlign: 'left',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            borderBottom: '1px solid #e2e8f0'
        },
        '& th': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        '& td': {
            backgroundColor: '#ffffff',
            transition: 'background-color 0.2s ease',
            
            '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.05)'
            }
        },

        // Quill alignment classes
        '& .ql-align-left': { textAlign: 'left !important' },
        '& .ql-align-center': { textAlign: 'center !important' },
        '& .ql-align-right': { textAlign: 'right !important' },
        '& .ql-align-justify': { textAlign: 'justify !important' },

        // Quill indentation classes
        '& .ql-indent-1': { paddingLeft: '3em !important' },
        '& .ql-indent-2': { paddingLeft: '6em !important' },
        '& .ql-indent-3': { paddingLeft: '9em !important' },
        '& .ql-indent-4': { paddingLeft: '12em !important' },
        '& .ql-indent-5': { paddingLeft: '15em !important' },
        '& .ql-indent-6': { paddingLeft: '18em !important' },
        '& .ql-indent-7': { paddingLeft: '21em !important' },
        '& .ql-indent-8': { paddingLeft: '24em !important' },
    }
};

function MobileAppPreview({ documentTitle, documentContentHtml }) {
    const sanitizedContent = DOMPurify.sanitize(documentContentHtml);
    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });

    return (
        <Paper elevation={20} sx={previewStyles.phoneFrame}>
            {/* Status Bar */}
            <Box sx={previewStyles.statusBar}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {currentTime}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SignalCellular4BarIcon sx={{ fontSize: 14 }} />
                    <WifiIcon sx={{ fontSize: 14 }} />
                    <BatteryFullIcon sx={{ fontSize: 16 }} />
                </Box>
            </Box>

            {/* App Bar */}
            <Box sx={previewStyles.appBar}>
                <PhoneAndroidIcon sx={{ fontSize: 24, opacity: 0.9 }} />
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px',
                            mx: 'auto'
                        }}
                    >
                        {documentTitle || "Document Preview"}
                    </Typography>
                </Box>
                <IconButton sx={{ color: 'white', opacity: 0.9 }} size="small">
                    <MoreVertIcon />
                </IconButton>
            </Box>

            {/* Content Area */}
            <Box sx={previewStyles.innerContentBox}>
                {!documentTitle && !documentContentHtml ? (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'text.secondary',
                        textAlign: 'center',
                        p: 4
                    }}>
                        <PhoneAndroidIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                        <Typography variant="h6" sx={{ mb: 1, opacity: 0.7 }}>
                            Start typing to see preview
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.5 }}>
                            Your document will appear here as you write
                        </Typography>
                    </Box>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                )}
            </Box>

            {/* Bottom indicator */}
            <Box sx={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '134px',
                height: '5px',
                backgroundColor: '#ffffff',
                borderRadius: '3px',
                opacity: 0.6
            }} />
        </Paper>
    );
}

export default MobileAppPreview;