import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Extract current user ID from token
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded.id || decoded.userId);
            } catch (err) {
                console.error('Error decoding token:', err);
            }
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        // Filter users by email
        if (searchEmail.trim()) {
            setFilteredUsers(
                users.filter(user =>
                    user.email.toLowerCase().includes(searchEmail.toLowerCase())
                )
            );
        } else {
            setFilteredUsers(users);
        }
    }, [searchEmail, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:3000/user/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users || []);
            setFilteredUsers(data.users || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId, currentRole) => {
        try {
            const response = await fetch(`http://localhost:3000/user/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to toggle role');
            
            const data = await response.json();
            // Update local state
            setUsers(users.map(u =>
                u._id === userId ? { ...u, role: data.user.role } : u
            ));
        } catch (err) {
            console.error('Error toggling role:', err);
            alert('שגיאה בשינוי התפקיד');
        }
    };

    const toggleSubscription = async (userId, currentStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/user/admin/users/${userId}/togglesub`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to toggle subscription');
            
            const data = await response.json();
            // Update local state
            setUsers(users.map(u =>
                u._id === userId ? { ...u, isActive: data.user.isActive } : u
            ));
        } catch (err) {
            console.error('Error toggling subscription:', err);
            alert('שגיאה בשינוי סטטוס המנוי');
        }
    };

    const deleteUserHandler = async (userId, email) => {
        if (!window.confirm(`האם אתה בטוח שברצונך למחוק את ${email}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/user/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete user');
            
            // Update local state
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('שגיאה במחיקת משתמש');
        }
    };

    const totalUsers = users.length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const totalActive = users.filter(u => u.isActive).length;

    if (loading) {
        return <div className="admin-dashboard"><p>טוען...</p></div>;
    }

    return (
        <div className="admin-dashboard">
            <h1>📊 לוח בקרה מנהל</h1>

            {error && <div className="error-message">{error}</div>}

            {/* Counters */}
            <div className="counters">
                <div className="counter-card">
                    <h3>סה״כ משתמשים</h3>
                    <p className="counter-value">{totalUsers}</p>
                </div>
                <div className="counter-card">
                    <h3>מנהלים</h3>
                    <p className="counter-value">{totalAdmins}</p>
                </div>
                <div className="counter-card">
                    <h3>מנויים פעילים</h3>
                    <p className="counter-value">{totalActive}</p>
                </div>
            </div>

            {/* Search */}
            <div className="search-box">
                <input
                    type="text"
                    placeholder="חיפוש לפי אימייל..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>שם</th>
                            <th>אימייל</th>
                            <th>טלפון</th>
                            <th>תפקיד</th>
                            <th>מנוי</th>
                            <th>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td>{user.firstname} {user.lastname}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || '—'}</td>
                                    <td>
                                        <button
                                            className={`role-badge ${user.role}`}
                                            onClick={() => toggleRole(user._id, user.role)}
                                            disabled={currentUserId === user._id}
                                            title={currentUserId === user._id ? 'לא ניתן לשנות את התפקיד שלך' : ''}
                                        >
                                            {user.role === 'admin' ? '👑 מנהל' : '👤 משתמש'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className={`subscription-badge ${user.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => toggleSubscription(user._id, user.isActive)}
                                        >
                                            {user.isActive ? '✅ פעיל' : '❌ לא פעיל'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteUserHandler(user._id, user.email)}
                                            disabled={currentUserId === user._id}
                                            title={currentUserId === user._id ? 'לא ניתן למחוק את עצמך' : 'מחיקה'}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results">לא נמצאו משתמשים</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="results-info">
                {searchEmail ? `${filteredUsers.length} משתמשים מ-${totalUsers} סה"כ` : `סה"כ ${totalUsers} משתמשים`}
            </p>
        </div>
    );
};

export default AdminDashboard;
