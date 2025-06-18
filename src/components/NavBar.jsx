// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, CircularProgress,
    List, ListItem, ListItemText, Collapse // Added for potential future expansion like nested menus
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc
import { db } from '../firebase/config';

function NavBar({ onSelectSubtopic, currentSubtopic, onBackToCodals }) {
    const [anchorElMainCodal, setAnchorElMainCodal] = useState(null); // For the "Civil Law" dropdown
    const [anchorElSubtopic, setAnchorElSubtopic] = useState(null); // For subtopics dropdown (if needed later)

    const [mainCodals, setMainCodals] = useState([]); // e.g., Civil Law, Commercial Law
    const [selectedMainCodal, setSelectedMainCodal] = useState(null); // The currently active top-level codal document ID
    const [subtopics, setSubtopics] = useState([]); // Subtopics for the selected main codal

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
                    name: doc.id // Using doc.id as the name for top-level codals like "Civil Law"
                }));
                setMainCodals(codalsData);
                setError(null);

                // Automatically select "Civil Law" if it exists, or the first one
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
                // Reference the subcollection within the selected main codal document
                const subtopicsCollectionRef = collection(db, "codals", selectedMainCodal, "subtopics");
                const querySnapshot = await getDocs(subtopicsCollectionRef);

                const subtopicsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.id // Using doc.id as the subtopic name (e.g., "Land Titles and Deeds")
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
    }, [selectedMainCodal]); // Re-run when the selected main codal changes


    const handleMainCodalClick = (event) => {
        setAnchorElMainCodal(event.currentTarget);
    };

    const handleMainCodalClose = () => {
        setAnchorElMainCodal(null);
    };

    const handleSelectMainCodal = (codalId) => {
        setSelectedMainCodal(codalId);
        handleMainCodalClose();
        // Reset selected subtopic when a new main codal is selected
        onSelectSubtopic(null); // Assuming onSelectSubtopic can handle null for no selection
    };

    const handleSubtopicMenuItemClick = (subtopicName) => {
        onSelectSubtopic(subtopicName); // Pass the subtopic name to App.jsx
        handleMainCodalClose(); // Close the main codal menu
    };

    const handleBackToCodalsLocal = () => {
        setSelectedMainCodal(null); // Clear selected main codal
        setSubtopics([]); // Clear subtopics
        onBackToCodals(); // Call parent handler to reset view in App.jsx
    };

    // Find the name of the currently selected main codal for display in breadcrumbs
    const currentMainCodalName = mainCodals.find(
        (codal) => codal.id === selectedMainCodal
    )?.name;

    if (loadingMainCodals) {
        return (
            <AppBar position="static">
                <Toolbar>
                    <CircularProgress color="inherit" size={20} sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div">
                        Loading Codals...
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }

    if (error) {
        return (
            <AppBar position="static" color="error">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        Error: {error}
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Breadcrumbs/Navigation */}
                <Button color="inherit" onClick={handleBackToCodalsLocal}>
                    Codals
                </Button>
                {currentMainCodalName && (
                    <>
                        <Typography variant="h6" component="div" sx={{ mx: 1 }}>
                            &gt;
                        </Typography>
                        <Button color="inherit" onClick={handleMainCodalClick}>
                            {currentMainCodalName} <ArrowDropDownIcon />
                        </Button>
                        <Menu
                            id="main-codal-menu"
                            anchorEl={anchorElMainCodal}
                            open={Boolean(anchorElMainCodal)}
                            onClose={handleMainCodalClose}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                        >
                            {mainCodals.map((codal) => (
                                <MenuItem
                                    key={codal.id}
                                    onClick={() => handleSelectMainCodal(codal.id)}
                                    selected={selectedMainCodal === codal.id}
                                >
                                    {codal.name}
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* Display Subtopics as a separate dropdown if the main codal is selected */}
                        {subtopics.length > 0 && (
                            <>
                                <Typography variant="h6" component="div" sx={{ mx: 1 }}>
                                    &gt;
                                </Typography>
                                <Button
                                    color="inherit"
                                    onClick={(e) => setAnchorElSubtopic(e.currentTarget)} // Open subtopic menu
                                >
                                    Subtopics <ArrowDropDownIcon />
                                </Button>
                                <Menu
                                    id="subtopics-menu"
                                    anchorEl={anchorElSubtopic}
                                    open={Boolean(anchorElSubtopic)}
                                    onClose={() => setAnchorElSubtopic(null)}
                                >
                                    {loadingSubtopics ? (
                                        <MenuItem disabled>
                                            <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
                                        </MenuItem>
                                    ) : (
                                        subtopics.map((subtopic) => (
                                            <MenuItem
                                                key={subtopic.id}
                                                onClick={() => handleSubtopicMenuItemClick(subtopic.name)}
                                                selected={currentSubtopic === subtopic.name}
                                            >
                                                {subtopic.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Menu>
                            </>
                        )}
                    </>
                )}

                {currentSubtopic && (
                    <>
                        <Typography variant="h6" component="div" sx={{ mx: 1 }}>
                            &gt;
                        </Typography>
                        <Typography variant="h6" component="div">
                            {currentSubtopic}
                        </Typography>
                    </>
                )}

                {/* Title (moved to the right to accommodate navigation) */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'right' }}>
                    Blue Phoenix
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;