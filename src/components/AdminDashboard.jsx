// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Box,
  Divider,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const drawerWidth = 240;

function AdminDashboard({ onSelectSubtopic, currentSubtopic, onBackToCodals, DocumentList, DocumentEditor }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mainCodals, setMainCodals] = useState([]);
  const [selectedMainCodal, setSelectedMainCodal] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [currentView, setCurrentView] = useState('list');
  const [anchorElMainCodal, setAnchorElMainCodal] = useState(null);
  const [anchorElSubtopic, setAnchorElSubtopic] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const fetchMainCodals = async () => {
      const querySnapshot = await getDocs(collection(db, 'codals'));
      const codalsData = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.id }));
      setMainCodals(codalsData);
      const civilLaw = codalsData.find(codal => codal.name === 'Civil Law');
      setSelectedMainCodal(civilLaw?.id || codalsData[0]?.id);
    };
    fetchMainCodals();
  }, []);

  useEffect(() => {
    const fetchSubtopics = async () => {
      if (!selectedMainCodal) return;
      const subtopicsCollectionRef = collection(db, 'codals', selectedMainCodal, 'subtopics');
      const querySnapshot = await getDocs(subtopicsCollectionRef);
      const subtopicsData = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.id }));
      setSubtopics(subtopicsData);
    };
    fetchSubtopics();
  }, [selectedMainCodal]);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6">Blue Phoenix CMS</Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button onClick={() => setCurrentView('list')}>
          <ListItemText primary="Documents" />
        </ListItem>
        <ListItem button onClick={() => setCurrentView('editor')}>
          <ListItemText primary="Create Document" />
        </ListItem>
        <Divider />
        {subtopics.map(sub => (
          <ListItem button key={sub.id} onClick={() => onSelectSubtopic(sub.name)}>
            <ListItemText primary={sub.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard - {currentSubtopic || 'Select Subtopic'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}
      >
        {currentView === 'list' ? <DocumentList /> : <DocumentEditor />}
      </Box>
    </Box>
  );
}

export default AdminDashboard;
