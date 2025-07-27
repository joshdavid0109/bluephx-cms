// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, CircularProgress,
    Chip, IconButton, Fade, Paper, Divider, useTheme, alpha, Badge, Avatar
} from '@mui/material';
import {
    ArrowDropDown as ArrowDropDownIcon,
    Home as HomeIcon,
    ChevronRight as ChevronRightIcon,
    MenuBook as MenuBookIcon,
    Topic as TopicIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountCircleIcon,
    Brightness4 as DarkModeIcon,
    Menu as MenuIcon
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

function NavBar({ onSelectSubtopic, currentSubtopic, onBackToCodals }) {
    const theme = useTheme();
    const [anchorElMainCodal, setAnchorElMainCodal] = useState(null);
    const [anchorElSubtopic, setAnchorElSubtopic] = useState(null);
    const [anchorElProfile, setAnchorElProfile] = useState(null);

    const [mainCodals, setMainCodals] = useState([]);
    const [selectedMainCodal, setSelectedMainCodal] = useState(null);
    const [subtopics, setSubtopics] = useState([]);

    const [loadingMainCodals, setLoadingMainCodals] = useState(true);
    const [loadingSubtopics, setLoadingSubtopics] = useState(false);
    const [error, setError] = useState(null);

    // --- EFFECT TO FETCH MAIN CODALS (runs once on mount) ---
    useEffect(() => {
        const fetchMainCodals = async () => {
            try {
                setLoadingMainCodals(true);
                const querySnapshot = await getDocs(collection(db, "codals"));
                const codalsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.id
                }));
                setMainCodals(codalsData);
                setError(null);

                const civilLaw = codalsData.find(codal => codal.name === 'Civil Law');
                if (civilLaw) {
                    setSelectedMainCodal(civilLaw.id);
                } else if (codalsData.length > 0) {
                    setSelectedMainCodal(codalsData[0].id);
                }

            } catch (err) {
                console.error("Error fetching main codals:", err);
                setError("Failed to load main codals.");
            } finally {
                setLoadingMainCodals(false);
            }
        };

        fetchMainCodals();
    }, []);

    // --- EFFECT TO FETCH SUBTOPICS (runs when selectedMainCodal changes) ---
    useEffect(() => {
        const fetchSubtopics = async () => {
            if (!selectedMainCodal) {
                setSubtopics([]);
                return;
            }

            try {
                setLoadingSubtopics(true);
                const subtopicsCollectionRef = collection(db, "codals", selectedMainCodal, "subtopics");
                const querySnapshot = await getDocs(subtopicsCollectionRef);

                const subtopicsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.id
                }));
                setSubtopics(subtopicsData);
                setError(null);
            } catch (err) {
                console.error(`Error fetching subtopics for ${selectedMainCodal}:`, err);
                setError(`Failed to load subtopics for ${selectedMainCodal}.`);
            } finally {
                setLoadingSubtopics(false);
            }
        };

        fetchSubtopics();
    }, [selectedMainCodal]);

    const handleMainCodalClick = (event) => {
        setAnchorElMainCodal(event.currentTarget);
    };

    const handleMainCodalClose = () => {
        setAnchorElMainCodal(null);
    };

    const handleSelectMainCodal = (codalId) => {
        setSelectedMainCodal(codalId);
        handleMainCodalClose();
        onSelectSubtopic(null);
    };

    const handleSubtopicMenuItemClick = (subtopicName) => {
        onSelectSubtopic(subtopicName);
        setAnchorElSubtopic(null);
    };

    const handleBackToCodalsLocal = () => {
        setSelectedMainCodal(null);
        setSubtopics([]);
        onBackToCodals();
    };

    const currentMainCodalName = mainCodals.find(
        (codal) => codal.id === selectedMainCodal
    )?.name;

    if (loadingMainCodals) {
        return (
            <AppBar 
                position="static" 
                elevation={0}
                sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    color: '#1a1a1a'
                }}
            >
                <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CircularProgress 
                                size={20} 
                                thickness={4}
                                sx={{ color: 'white' }} 
                            />
                        </Box>
                        <Typography 
                            variant="h6" 
                            component="div"
                            sx={{ 
                                fontWeight: 600,
                                color: '#1a1a1a',
                                letterSpacing: '-0.025em'
                            }}
                        >
                            Loading Legal Database...
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>
        );
    }

    if (error) {
        return (
            <AppBar 
                position="static" 
                elevation={0}
                sx={{ 
                    background: 'rgba(255, 245, 245, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#dc2626'
                }}
            >
                <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 } }}>
                    <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                            fontWeight: 600,
                            letterSpacing: '-0.025em'
                        }}
                    >
                        ⚠️ Error: {error}
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }

    return (
        <AppBar 
            position="static"
            elevation={0}
            sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#1a1a1a'
            }}
        >
            <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 }, justifyContent: 'space-between' }}>
                {/* Left Side - Brand + Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                    {/* Brand */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                        }}>
                            <MenuBookIcon sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                fontWeight: 700,
                                color: '#1a1a1a',
                                letterSpacing: '-0.025em',
                                fontSize: { xs: '1.1rem', md: '1.25rem' }
                            }}
                        >
                            Blue Phoenix
                        </Typography>
                    </Box>

                    {/* Navigation Breadcrumbs */}
                    <Box sx={{ 
                        display: { xs: 'none', md: 'flex' }, 
                        alignItems: 'center', 
                        gap: 1,
                        background: 'rgba(248, 250, 252, 0.8)',
                        borderRadius: '16px',
                        px: 2,
                        py: 1,
                        border: '1px solid rgba(0, 0, 0, 0.06)'
                    }}>
                        {/* Home Button */}
                        <Button 
                            onClick={handleBackToCodalsLocal}
                            startIcon={<HomeIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                borderRadius: '10px',
                                px: 2,
                                py: 0.75,
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                minWidth: 'auto',
                                '&:hover': {
                                    background: 'rgba(102, 126, 234, 0.08)',
                                    color: '#667eea'
                                }
                            }}
                        >
                            Codals
                        </Button>

                        {/* Main Codal Selection */}
                        {currentMainCodalName && (
                            <>
                                <ChevronRightIcon sx={{ color: '#d1d5db', fontSize: 16 }} />
                                <Button 
                                    onClick={handleMainCodalClick}
                                    endIcon={<ArrowDropDownIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        borderRadius: '10px',
                                        px: 2,
                                        py: 0.75,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        color: '#374151',
                                        minWidth: 'auto',
                                        '&:hover': {
                                            background: 'rgba(102, 126, 234, 0.08)',
                                            color: '#667eea'
                                        }
                                    }}
                                >
                                    {currentMainCodalName}
                                </Button>
                                
                                <Menu
                                    anchorEl={anchorElMainCodal}
                                    open={Boolean(anchorElMainCodal)}
                                    onClose={handleMainCodalClose}
                                    TransitionComponent={Fade}
                                    PaperProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.98)',
                                            backdropFilter: 'blur(20px)',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(0, 0, 0, 0.08)',
                                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                            mt: 1,
                                            minWidth: 220
                                        }
                                    }}
                                >
                                    {mainCodals.map((codal) => (
                                        <MenuItem
                                            key={codal.id}
                                            onClick={() => handleSelectMainCodal(codal.id)}
                                            selected={selectedMainCodal === codal.id}
                                            sx={{
                                                borderRadius: '12px',
                                                mx: 1,
                                                my: 0.5,
                                                fontWeight: selectedMainCodal === codal.id ? 600 : 400,
                                                color: selectedMainCodal === codal.id ? '#667eea' : '#374151',
                                                '&:hover': {
                                                    background: 'rgba(102, 126, 234, 0.08)'
                                                },
                                                '&.Mui-selected': {
                                                    background: 'rgba(102, 126, 234, 0.12)',
                                                    '&:hover': {
                                                        background: 'rgba(102, 126, 234, 0.16)'
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuBookIcon sx={{ mr: 2, fontSize: 18, opacity: 0.7 }} />
                                            {codal.name}
                                        </MenuItem>
                                    ))}
                                </Menu>

                                {/* Subtopics */}
                                {subtopics.length > 0 && (
                                    <>
                                        <ChevronRightIcon sx={{ color: '#d1d5db', fontSize: 16 }} />
                                        <Button
                                            onClick={(e) => setAnchorElSubtopic(e.currentTarget)}
                                            endIcon={<ArrowDropDownIcon sx={{ fontSize: 16 }} />}
                                            sx={{
                                                borderRadius: '10px',
                                                px: 2,
                                                py: 0.75,
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                fontSize: '0.875rem',
                                                color: '#374151',
                                                minWidth: 'auto',
                                                '&:hover': {
                                                    background: 'rgba(102, 126, 234, 0.08)',
                                                    color: '#667eea'
                                                }
                                            }}
                                        >
                                            Topics
                                        </Button>
                                        
                                        <Menu
                                            anchorEl={anchorElSubtopic}
                                            open={Boolean(anchorElSubtopic)}
                                            onClose={() => setAnchorElSubtopic(null)}
                                            TransitionComponent={Fade}
                                            PaperProps={{
                                                sx: {
                                                    background: 'rgba(255, 255, 255, 0.98)',
                                                    backdropFilter: 'blur(20px)',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(0, 0, 0, 0.08)',
                                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                                    mt: 1,
                                                    minWidth: 280,
                                                    maxHeight: 400
                                                }
                                            }}
                                        >
                                            {loadingSubtopics ? (
                                                <MenuItem disabled sx={{ justifyContent: 'center', py: 3 }}>
                                                    <CircularProgress size={20} sx={{ mr: 2 }} />
                                                    Loading topics...
                                                </MenuItem>
                                            ) : (
                                                subtopics.map((subtopic, index) => (
                                                    <MenuItem
                                                        key={subtopic.id}
                                                        onClick={() => handleSubtopicMenuItemClick(subtopic.name)}
                                                        selected={currentSubtopic === subtopic.name}
                                                        sx={{
                                                            borderRadius: '12px',
                                                            mx: 1,
                                                            my: 0.5,
                                                            fontWeight: currentSubtopic === subtopic.name ? 600 : 400,
                                                            color: currentSubtopic === subtopic.name ? '#667eea' : '#374151',
                                                            py: 1.5,
                                                            '&:hover': {
                                                                background: 'rgba(102, 126, 234, 0.08)'
                                                            },
                                                            '&.Mui-selected': {
                                                                background: 'rgba(102, 126, 234, 0.12)',
                                                                '&:hover': {
                                                                    background: 'rgba(102, 126, 234, 0.16)'
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <TopicIcon sx={{ mr: 2, fontSize: 18, opacity: 0.7 }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                                                            {subtopic.name}
                                                        </Typography>
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Menu>
                                    </>
                                )}
                            </>
                        )}

                        {/* Current Subtopic */}
                        {currentSubtopic && (
                            <>
                                <ChevronRightIcon sx={{ color: '#d1d5db', fontSize: 16 }} />
                                <Chip
                                    label={currentSubtopic}
                                    size="small"
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        height: 28,
                                        '& .MuiChip-label': {
                                            px: 1.5
                                        }
                                    }}
                                />
                            </>
                        )}
                    </Box>
                </Box>

                {/* Right Side - Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Search */}
                    <IconButton
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            color: '#6b7280',
                            '&:hover': {
                                background: 'rgba(102, 126, 234, 0.08)',
                                color: '#667eea'
                            }
                        }}
                    >
                        <SearchIcon fontSize="small" />
                    </IconButton>

                    {/* Notifications */}
                    <IconButton
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            color: '#6b7280',
                            '&:hover': {
                                background: 'rgba(102, 126, 234, 0.08)',
                                color: '#667eea'
                            }
                        }}
                    >
                        <Badge badgeContent={3} color="error" variant="dot">
                            <NotificationsIcon fontSize="small" />
                        </Badge>
                    </IconButton>

                    {/* Theme Toggle */}
                    <IconButton
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            color: '#6b7280',
                            '&:hover': {
                                background: 'rgba(102, 126, 234, 0.08)',
                                color: '#667eea'
                            }
                        }}
                    >
                        <DarkModeIcon fontSize="small" />
                    </IconButton>

                    {/* Profile */}
                    <IconButton
                        onClick={(e) => setAnchorElProfile(e.currentTarget)}
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            ml: 1
                        }}
                    >
                        <Avatar 
                            sx={{ 
                                width: 36, 
                                height: 36,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '0.875rem',
                                fontWeight: 600
                            }}
                        >
                            BP
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorElProfile}
                        open={Boolean(anchorElProfile)}
                        onClose={() => setAnchorElProfile(null)}
                        TransitionComponent={Fade}
                        PaperProps={{
                            sx: {
                                background: 'rgba(255, 255, 255, 0.98)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                mt: 1,
                                minWidth: 200
                            }
                        }}
                    >
                        <MenuItem sx={{ borderRadius: '12px', mx: 1, my: 0.5 }}>
                            <AccountCircleIcon sx={{ mr: 2, fontSize: 18, opacity: 0.7 }} />
                            Profile
                        </MenuItem>
                        <MenuItem sx={{ borderRadius: '12px', mx: 1, my: 0.5 }}>
                            <DarkModeIcon sx={{ mr: 2, fontSize: 18, opacity: 0.7 }} />
                            Settings
                        </MenuItem>
                        <Divider sx={{ mx: 1, my: 1 }} />
                        <MenuItem sx={{ borderRadius: '12px', mx: 1, my: 0.5, color: '#dc2626' }}>
                            Logout
                        </MenuItem>
                    </Menu>

                    {/* Mobile Menu */}
                    <IconButton
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            color: '#6b7280',
                            ml: 1,
                            '&:hover': {
                                background: 'rgba(102, 126, 234, 0.08)',
                                color: '#667eea'
                            }
                        }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;