import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated()) {
    return null; // Don't show navigation if not authenticated
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid>
        <LinkContainer to="/dashboard">
          <Navbar.Brand>
            <i className="bi bi-file-earmark-text me-2"></i>
            Document Sharing System
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/dashboard">
              <Nav.Link>
                <i className="bi bi-speedometer2 me-1"></i>
                Dashboard
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/my-files">
              <Nav.Link>
                <i className="bi bi-folder me-1"></i>
                My Files
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/team-files">
              <Nav.Link>
                <i className="bi bi-people me-1"></i>
                Team Files
              </Nav.Link>
            </LinkContainer>
            
            {isAdmin() && (
              <LinkContainer to="/admin">
                <Nav.Link>
                  <i className="bi bi-shield me-1"></i>
                  Admin Portal
                  <Badge bg="warning" text="dark" className="ms-1">
                    Admin
                  </Badge>
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
          
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.firstName} {user?.lastName}
                </span>
              } 
              id="user-dropdown"
              align="end"
              style={{ zIndex: 9999 }}
            >
              <NavDropdown.Item disabled>
                <small className="text-muted">
                  Signed in as <strong>@{user?.username}</strong>
                </small>
              </NavDropdown.Item>
              <NavDropdown.Item disabled>
                <small className="text-muted">
                  Role: {user?.roles?.includes('ADMIN') ? 'Administrator' : 'User'}
                </small>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Sign Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 