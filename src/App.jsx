// src/App.jsx
import React, { useState } from 'react';
import { 
    Box, 
    CssBaseline, 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    Typography,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Description as DocumentsIcon,
    Topic as TopicsIcon,
    MenuBook as CodalsIcon,
    Settings as SettingsIcon,
    ExitToApp as LogoutIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import DocumentList from './components/DocumentList';
import DocumentEditor from './components/DocumentEditor';
import DocumentViewer from './components/DocumentViewer';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';

const drawerWidth = 280;

function App() {
    const theme = useTheme();
    // State to control which document is being viewed/edited
    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    // State to control the current mode: 'dashboard', 'list', 'edit', 'view'
    const [mode, setMode] = useState('dashboard'); // Default mode is dashboard
    // State to manage the currently selected subtopic for filtering
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    // State for active sidebar item
    const [activeMenuItem, setActiveMenuItem] = useState('dashboard');

    // Handlers to change mode and select document
    const handleCreateNewDocument = () => {
        setCurrentDocumentId(null);
        setMode('edit');
    };

    const handleOpenDocumentForEdit = (id) => {
        setCurrentDocumentId(id);
        setMode('edit');
    };

    const handleOpenDocumentForView = (id) => {
        setCurrentDocumentId(id);
        setMode('view');
    };

    const handleSaveSuccess = () => {
        setCurrentDocumentId(null);
        setMode('list');
    };

    const handleCancelEdit = () => {
        setCurrentDocumentId(null);
        setMode('list');
    };

    const handleBackToList = () => {
        setCurrentDocumentId(null);
        setMode('list');
    };

    const handleSelectSubtopic = (subtopic) => {
        setSelectedSubtopic(subtopic);
        setMode('list');
    };

    const handleBackToCodals = () => {
        setSelectedSubtopic(null);
        setMode('list');
    };

    // Menu items configuration
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, active: true },
        { id: 'documents', label: 'Documents', icon: <DocumentsIcon />, active: false },
        { id: 'topics', label: 'Topics', icon: <TopicsIcon />, active: false },
        { id: 'codals', label: 'Codals', icon: <CodalsIcon />, active: false },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon />, active: false },
    ];

    const handleMenuItemClick = (itemId) => {
        setActiveMenuItem(itemId);
        // Handle navigation based on menu item
        switch (itemId) {
            case 'dashboard':
                setMode('dashboard');
                // Reset document-related states when going to dashboard
                setCurrentDocumentId(null);
                setSelectedSubtopic(null);
                break;
            case 'documents':
                setMode('list');
                break;
            case 'topics':
                // Handle topics navigation
                setMode('list');
                break;
            case 'codals':
                handleBackToCodals();
                setMode('list');
                break;
            case 'settings':
                // Handle settings navigation - you can create a Settings component later
                console.log('Settings clicked - implement Settings component');
                break;
            default:
                break;
        }
    };

    // Conditional rendering based on the 'mode' state
    const renderContent = () => {
        switch (mode) {
            case 'dashboard':
                return <Dashboard isFullWidth={true} />;
            case 'list':
                return (
                    <DocumentList
                        onCreateNewDocument={handleCreateNewDocument}
                        onOpenDocumentForEdit={handleOpenDocumentForEdit}
                        onOpenDocumentForView={handleOpenDocumentForView}
                        selectedSubtopic={selectedSubtopic}
                    />
                );
            case 'edit':
                return (
                    <DocumentEditor
                        documentId={currentDocumentId}
                        onSaveSuccess={handleSaveSuccess}
                        onCancel={handleCancelEdit}
                    />
                );
            case 'view':
                return (
                    <DocumentViewer
                        documentId={currentDocumentId}
                        onBackToList={handleBackToList}
                        onEditDocument={handleOpenDocumentForEdit}
                    />
                );
            default:
                return (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                        Something went wrong. Unknown mode.
                    </Box>
                );
        }
    };

    const sidebarContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo/Brand Section */}
            <Box sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}>
                <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                    <HomeIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 700,
                            color: '#2c3e50',
                            fontSize: '1.1rem',
                            lineHeight: 1.2
                        }}
                    >
                        BLUE PHOENIX
                    </Typography>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: '#7f8c8d',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Legal Management
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Menu */}
            <Box sx={{ flex: 1, py: 2 }}>
                <List sx={{ px: 2 }}>
                    {menuItems.map((item) => (
                        <ListItem
                            key={item.id}
                            onClick={() => handleMenuItemClick(item.id)}
                            sx={{
                                borderRadius: '12px',
                                mb: 1,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: activeMenuItem === item.id 
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'transparent',
                                color: activeMenuItem === item.id ? 'white' : '#5a6c7d',
                                boxShadow: activeMenuItem === item.id 
                                    ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                    : 'none',
                                '&:hover': {
                                    background: activeMenuItem === item.id 
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : alpha(theme.palette.primary.main, 0.08),
                                    transform: 'translateX(4px)',
                                    boxShadow: activeMenuItem === item.id 
                                        ? '0 6px 20px rgba(102, 126, 234, 0.4)'
                                        : '0 2px 8px rgba(0,0,0,0.1)'
                                }
                            }}
                        >
                            <ListItemIcon 
                                sx={{ 
                                    color: 'inherit',
                                    minWidth: 40
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: activeMenuItem === item.id ? 600 : 500,
                                    fontSize: '0.95rem'
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Bottom Section - Logout */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <ListItem
                    sx={{
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: '#e74c3c',
                        '&:hover': {
                            background: alpha('#e74c3c', 0.08),
                            transform: 'translateX(4px)'
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Log out"
                        primaryTypographyProps={{
                            fontWeight: 500,
                            fontSize: '0.95rem'
                        }}
                    />
                </ListItem>
            </Box>
        </Box>
    );

    return (
        <>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: '#ffffff',
                            borderRight: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '4px 0 24px rgba(0,0,0,0.06)'
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>

                {/* Main Content */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Top Navigation - Only show for non-dashboard modes */}
                    {mode !== 'dashboard' && (
                        <NavBar
                            onSelectSubtopic={handleSelectSubtopic}
                            currentSubtopic={selectedSubtopic}
                            onBackToCodals={handleBackToCodals}
                        />
                    )}
                    
                    {/* Content Area */}
                    <Box 
                        component="main"
                        sx={{ 
                            flex: 1,
                            width: '100%',
                            px: mode === 'dashboard' ? 0 : { xs: 2, sm: 3, md: 4 },
                            py: mode === 'dashboard' ? 0 : { xs: 2, sm: 3 },
                            backgroundColor: '#f8fafc',
                            minHeight: mode === 'dashboard' ? '100vh' : 'calc(100vh - 72px)',
                            overflow: 'auto'
                        }}
                    >
                        {renderContent()}
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default App;