// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Divider,
    Button,
    Menu,
    MenuItem,
    useTheme,
    alpha
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Description as DocumentIcon,
    Visibility as ViewIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AdminPanelSettings as AdminIcon,
    Person as PersonIcon,
    AccessTime as TimeIcon,
    Download as DownloadIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Sample data - in real app, this would come from your Firebase/API
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 156,
        totalDocuments: 1247,
        totalViews: 8934,
        activeUsers: 42,
        recentActivity: [
            { date: '2025-01-20', users: 45, documents: 12, views: 234 },
            { date: '2025-01-21', users: 52, documents: 18, views: 312 },
            { date: '2025-01-22', users: 48, documents: 15, views: 287 },
            { date: '2025-01-23', users: 61, documents: 22, views: 398 },
            { date: '2025-01-24', users: 55, documents: 19, views: 356 },
            { date: '2025-01-25', users: 67, documents: 25, views: 445 },
            { date: '2025-01-26', users: 58, documents: 21, views: 389 }
        ],
        documentsByCategory: [
            { name: 'Civil Law', value: 425, color: '#667eea' },
            { name: 'Commercial Law', value: 318, color: '#764ba2' },
            { name: 'Criminal Law', value: 267, color: '#f093fb' },
            { name: 'Administrative Law', value: 237, color: '#4facfe' }
        ],
        recentUsers: [
            { id: 1, name: 'Maria Santos', email: 'maria.santos@law.ph', role: 'Admin', status: 'active', lastLogin: '2025-01-26 14:32', avatar: 'MS' },
            { id: 2, name: 'Juan Dela Cruz', email: 'juan.delacruz@firm.ph', role: 'Editor', status: 'active', lastLogin: '2025-01-26 13:45', avatar: 'JD' },
            { id: 3, name: 'Ana Rodriguez', email: 'ana.rodriguez@legal.ph', role: 'Viewer', status: 'inactive', lastLogin: '2025-01-25 16:20', avatar: 'AR' },
            { id: 4, name: 'Carlos Mendoza', email: 'carlos.mendoza@court.ph', role: 'Editor', status: 'active', lastLogin: '2025-01-26 11:15', avatar: 'CM' },
            { id: 5, name: 'Isabella Garcia', email: 'isabella.garcia@law.ph', role: 'Admin', status: 'active', lastLogin: '2025-01-26 15:08', avatar: 'IG' }
        ]
    });

    const handleUserMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const StatCard = ({ title, value, icon, trend, color }) => (
        <Card 
            sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                border: `1px solid ${color}20`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${color}25`,
                    border: `1px solid ${color}40`
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box 
                        sx={{ 
                            p: 1.5,
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                            color: 'white'
                        }}
                    >
                        {icon}
                    </Box>
                    {trend && (
                        <Chip 
                            label={`+${trend}%`}
                            size="small"
                            sx={{ 
                                backgroundColor: alpha('#4caf50', 0.1),
                                color: '#4caf50',
                                fontWeight: 600
                            }}
                        />
                    )}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5 }}>
                    {value.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return '#e74c3c';
            case 'Editor': return '#f39c12';
            case 'Viewer': return '#3498db';
            default: return '#95a5a6';
        }
    };

    return (
        <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                    Dashboard Overview
                </Typography>
                <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                    Monitor your legal document management system performance and user activity
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3, 
                mb: 4 
            }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                    <StatCard
                        title="Total Users"
                        value={dashboardData.totalUsers}
                        icon={<PeopleIcon />}
                        trend={12}
                        color="#667eea"
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                    <StatCard
                        title="Total Documents"
                        value={dashboardData.totalDocuments}
                        icon={<DocumentIcon />}
                        trend={8}
                        color="#764ba2"
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                    <StatCard
                        title="Document Views"
                        value={dashboardData.totalViews}
                        icon={<ViewIcon />}
                        trend={15}
                        color="#f093fb"
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                    <StatCard
                        title="Active Users"
                        value={dashboardData.activeUsers}
                        icon={<TrendingUpIcon />}
                        trend={5}
                        color="#4facfe"
                    />
                </Box>
            </Box>

            {/* Charts Section */}
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3, 
                mb: 4 
            }}>
                {/* Activity Chart */}
                 <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.67% - 12px)' } }}>
                    <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                Weekly Activity Overview
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                sx={{ borderRadius: '8px' }}
                            >
                                Export
                            </Button>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardData.recentActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                                <XAxis dataKey="date" stroke="#7f8c8d" fontSize={12} />
                                <YAxis stroke="#7f8c8d" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={3} dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }} />
                                <Line type="monotone" dataKey="documents" stroke="#764ba2" strokeWidth={3} dot={{ fill: '#764ba2', strokeWidth: 2, r: 4 }} />
                                <Line type="monotone" dataKey="views" stroke="#f093fb" strokeWidth={3} dot={{ fill: '#f093fb', strokeWidth: 2, r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                  </Box>


                {/* Document Distribution */}
                  <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.33% - 12px)' } }}>
                    <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>
                            Documents by Category
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dashboardData.documentsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {dashboardData.documentsByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                  </Box>
                </Box>

            {/* User Management Section */}
            <Paper sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                                User Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                                Manage user accounts, roles, and permissions
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3
                            }}
                        >
                            Add User
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Last Login</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dashboardData.recentUsers.map((user) => (
                                <TableRow 
                                    key={user.id}
                                    sx={{ 
                                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                                        transition: 'background-color 0.2s ease'
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar 
                                                sx={{ 
                                                    width: 40, 
                                                    height: 40,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {user.avatar}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                    {user.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha(getRoleColor(user.role), 0.1),
                                                color: getRoleColor(user.role),
                                                fontWeight: 600,
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: user.status === 'active' 
                                                    ? alpha('#4caf50', 0.1) 
                                                    : alpha('#f44336', 0.1),
                                                color: user.status === 'active' ? '#4caf50' : '#f44336',
                                                fontWeight: 600,
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                                            {user.lastLogin}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleUserMenuClick(e, user)}
                                            sx={{ 
                                                borderRadius: '8px',
                                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* User Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            minWidth: 160
                        }
                    }}
                >
                    <MenuItem onClick={handleUserMenuClose} sx={{ gap: 1 }}>
                        <EditIcon fontSize="small" />
                        Edit User
                    </MenuItem>
                    <MenuItem onClick={handleUserMenuClose} sx={{ gap: 1 }}>
                        <AdminIcon fontSize="small" />
                        Change Role
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleUserMenuClose} sx={{ gap: 1, color: '#e74c3c' }}>
                        <DeleteIcon fontSize="small" />
                        Delete User
                    </MenuItem>
                </Menu>
            </Paper>
        </Box>
    );
}

export default Dashboard;