import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
  Dropdown,
  InputGroup,
} from 'react-bootstrap';
import { adminAPI } from '../services/api';

const AdminPortal = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
  // Add User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    roles: ['USER'],
    active: true,
  });

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roles: ['USER'],
    active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (addForm.password !== addForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(addForm.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    setAddLoading(true);
    try {
      const userData = {
        username: addForm.username,
        email: addForm.email,
        password: addForm.password,
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        roles: addForm.roles,
      };

      await adminAPI.createUser(userData);
      setSuccess('User created successfully!');
      setShowAddModal(false);
      setAddForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        roles: ['USER'],
        active: true,
      });
      fetchUsers();
    } catch (error) {
      setError('Failed to create user');
      console.error('Create user error:', error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        username: editForm.username,
        email: editForm.email,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        roles: editForm.roles,
        active: editForm.active,
      };

      await adminAPI.updateUser(editUser.id, userData);
      setSuccess('User updated successfully!');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      setError('Failed to update user');
      console.error('Update user error:', error);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await adminAPI.deleteUser(userId);
        setSuccess('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        setError('Failed to delete user');
        console.error('Delete user error:', error);
      }
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: Array.from(user.roles || ['USER']),
      active: user.active,
    });
    setShowEditModal(true);
  };

  const handleRoleChange = (role, checked, formType = 'add') => {
    const targetForm = formType === 'add' ? addForm : editForm;
    const setTargetForm = formType === 'add' ? setAddForm : setEditForm;
    
    let newRoles = [...targetForm.roles];
    if (checked) {
      if (!newRoles.includes(role)) {
        newRoles.push(role);
      }
    } else {
      newRoles = newRoles.filter(r => r !== role);
    }
    
    setTargetForm({
      ...targetForm,
      roles: newRoles,
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActiveFilter = showActiveOnly ? user.active : true;
    
    return matchesSearch && matchesActiveFilter;
  });

  const getUserRoleBadge = (roles) => {
    if (roles.includes('ADMIN')) {
      return <Badge bg="danger">Admin</Badge>;
    }
    return <Badge bg="primary">User</Badge>;
  };

  const getStatusBadge = (active) => {
    return active ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="secondary">Inactive</Badge>
    );
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Admin Portal</h2>
              <p className="text-muted mt-1">Manage system users and permissions</p>
            </div>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-person-plus me-2"></i>
              Add User
            </Button>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-primary text-white">
                <Card.Body className="text-center">
                  <i className="bi bi-people display-4 mb-2"></i>
                  <h4 className="mb-1">{users.length}</h4>
                  <small>Total Users</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success text-white">
                <Card.Body className="text-center">
                  <i className="bi bi-person-check display-4 mb-2"></i>
                  <h4 className="mb-1">{users.filter(u => u.active).length}</h4>
                  <small>Active Users</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning text-white">
                <Card.Body className="text-center">
                  <i className="bi bi-shield display-4 mb-2"></i>
                  <h4 className="mb-1">{users.filter(u => u.roles.includes('ADMIN')).length}</h4>
                  <small>Administrators</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-info text-white">
                <Card.Body className="text-center">
                  <i className="bi bi-person display-4 mb-2"></i>
                  <h4 className="mb-1">{users.filter(u => u.roles.includes('USER') && !u.roles.includes('ADMIN')).length}</h4>
                  <small>Regular Users</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search Bar and Filters */}
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="active-users-filter"
                label={`Show active users only (${users.filter(u => u.active).length})`}
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="ms-3"
              />
            </Col>
          </Row>

          {/* Users Table */}
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-person-x display-1 text-muted"></i>
                  <p className="mt-2 text-muted">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person-circle me-2 text-secondary fs-4"></i>
                            <div>
                              <div className="fw-medium">{user.firstName} {user.lastName}</div>
                              <small className="text-muted">@{user.username}</small>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{getUserRoleBadge(user.roles)}</td>
                        <td>{getStatusBadge(user.active)}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ zIndex: 9999 }}>
                              <Dropdown.Item onClick={() => openEditModal(user)}>
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                className="text-danger"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                              >
                                <i className="bi bi-trash me-2"></i>
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={addForm.username}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    required
                  />
                  <Form.Text className="text-muted">
                    Must contain uppercase, lowercase, number, and special character
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Roles</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  label="User"
                  checked={addForm.roles.includes('USER')}
                  onChange={(e) => handleRoleChange('USER', e.target.checked, 'add')}
                />
                <Form.Check
                  type="checkbox"
                  label="Admin"
                  checked={addForm.roles.includes('ADMIN')}
                  onChange={(e) => handleRoleChange('ADMIN', e.target.checked, 'add')}
                />
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={addLoading}>
              {addLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditUser}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Roles</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  label="User"
                  checked={editForm.roles.includes('USER')}
                  onChange={(e) => handleRoleChange('USER', e.target.checked, 'edit')}
                />
                <Form.Check
                  type="checkbox"
                  label="Admin"
                  checked={editForm.roles.includes('ADMIN')}
                  onChange={(e) => handleRoleChange('ADMIN', e.target.checked, 'edit')}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={editForm.active}
                onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update User
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminPortal; 