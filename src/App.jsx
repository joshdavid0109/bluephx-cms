// src/App.jsx
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import DocumentList from './components/DocumentList';
import DocumentEditor from './components/DocumentEditor';
import DocumentViewer from './components/DocumentViewer';
import NavBar from './components/NavBar'; // Import the new NavBar component

function App() {
    // State to control which document is being viewed/edited
    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    // State to control the current mode: 'list', 'edit', 'view'
    const [mode, setMode] = useState('list'); // Default mode is to show the list
    // State to manage the currently selected subtopic for filtering
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);

    // Handlers to change mode and select document
    const handleCreateNewDocument = () => {
        setCurrentDocumentId(null); // No ID means new document
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
        // After saving, go back to the list view
        setCurrentDocumentId(null);
        setMode('list');
    };

    const handleCancelEdit = () => {
        // If cancelling, go back to the list view
        setCurrentDocumentId(null);
        setMode('list');
    };

    const handleBackToList = () => {
        setCurrentDocumentId(null);
        setMode('list');
    };

    // Handler for selecting a subtopic from the navigation
    const handleSelectSubtopic = (subtopic) => {
        setSelectedSubtopic(subtopic);
        setMode('list'); // Always go back to list view when a subtopic is selected
    };

    // Handler for navigating back to the main codals view (resets subtopic filter)
    const handleBackToCodals = () => {
        setSelectedSubtopic(null);
        setMode('list');
    };

    // Conditional rendering based on the 'mode' state
    const renderContent = () => {
        switch (mode) {
            case 'list':
                return (
                    <DocumentList
                        onCreateNewDocument={handleCreateNewDocument}
                        onOpenDocumentForEdit={handleOpenDocumentForEdit}
                        onOpenDocumentForView={handleOpenDocumentForView}
                        selectedSubtopic={selectedSubtopic} // Pass the selected subtopic for filtering
                    />
                );
            case 'edit':
                return (
                    <DocumentEditor
                        documentId={currentDocumentId} // Pass null for new or ID for existing
                        onSaveSuccess={handleSaveSuccess}
                        onCancel={handleCancelEdit}
                        // You might want to pass selectedSubtopic here if new documents are created within a specific subtopic context
                    />
                );
            case 'view':
                return (
                    <DocumentViewer
                        documentId={currentDocumentId}
                        onBackToList={handleBackToList}
                        onEditDocument={handleOpenDocumentForEdit} // Allows editing from viewer
                    />
                );
            default:
                return <Typography>Something went wrong. Unknown mode.</Typography>;
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <NavBar
                onSelectSubtopic={handleSelectSubtopic}
                currentSubtopic={selectedSubtopic}
                onBackToCodals={handleBackToCodals}
            />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {renderContent()} {/* Render content based on current mode */}
            </Container>
        </Box>
    );
}

export default App;