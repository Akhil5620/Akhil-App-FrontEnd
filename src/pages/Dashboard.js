import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { documentAPI, formatFileSize, getFileIcon } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    myFilesCount: 0,
    teamFilesCount: 0,
    totalSize: 0,
  });
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, isAdmin, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only fetch data after auth is loaded and user is authenticated
    if (!authLoading && isAuthenticated() && user) {
      fetchDashboardData();
    }
  }, [authLoading, user, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch my files and team files
      const [myFilesResponse, teamFilesResponse] = await Promise.all([
        documentAPI.getMyDocuments(),
        documentAPI.getTeamDocuments(),
      ]);

      const myFiles = myFilesResponse.data;
      const teamFiles = teamFilesResponse.data;

      // Calculate statistics
      const totalSize = myFiles.reduce((acc, file) => acc + (file.fileSize || 0), 0);
      
      setStats({
        myFilesCount: myFiles.length,
        teamFilesCount: teamFiles.length,
        totalSize: totalSize,
      });

      // Get recent files (combine and sort by creation date)
      const allFiles = [...myFiles, ...teamFiles];
      const sortedFiles = allFiles
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setRecentFiles(sortedFiles);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">{authLoading ? 'Authenticating...' : 'Loading dashboard...'}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-1">Welcome back, {user?.firstName}!</h2>
              <p className="text-muted mb-0">
                Here's an overview of your document sharing activity
              </p>
            </div>
            {isAdmin() && (
              <Badge bg="warning" text="dark" className="fs-6">
                <i className="bi bi-shield me-1"></i>
                Administrator
              </Badge>
            )}
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm bg-primary text-white">
            <Card.Body className="text-center">
              <i className="bi bi-folder display-4 mb-3"></i>
              <h3 className="mb-1">{stats.myFilesCount}</h3>
              <p className="mb-0">My Files</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm bg-success text-white">
            <Card.Body className="text-center">
              <i className="bi bi-people display-4 mb-3"></i>
              <h3 className="mb-1">{stats.teamFilesCount}</h3>
              <p className="mb-0">Team Files</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm bg-info text-white">
            <Card.Body className="text-center">
              <i className="bi bi-hdd display-4 mb-3"></i>
              <h3 className="mb-1">{formatFileSize(stats.totalSize)}</h3>
              <p className="mb-0">Total Storage</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm bg-warning text-dark">
            <Card.Body className="text-center">
              <i className="bi bi-share display-4 mb-3"></i>
              <h3 className="mb-1">{stats.myFilesCount + stats.teamFilesCount}</h3>
              <p className="mb-0">Total Files</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Files */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Recent Files
                </h5>
                <Link to="/my-files" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {recentFiles.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-file-earmark display-1 text-muted"></i>
                  <p className="mt-2 text-muted">No files yet</p>
                  <Link to="/my-files" className="btn btn-primary">
                    Upload Your First File
                  </Link>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFiles.map((file) => (
                      <tr key={file.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className={`${getFileIcon(file.fileType)} me-2 text-primary`}></i>
                            <div>
                              <div className="fw-medium">{file.name}</div>
                              {file.teamShared && (
                                <Badge bg="success" size="sm">Team Shared</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {file.fileType?.toUpperCase() || 'FILE'}
                          </span>
                        </td>
                        <td>{formatFileSize(file.fileSize)}</td>
                        <td>
                          <small className="text-muted">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <Link to="/my-files" className="btn btn-primary btn-lg">
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload Document
                </Link>
                
                <Link to="/team-files" className="btn btn-outline-success btn-lg">
                  <i className="bi bi-people me-2"></i>
                  Browse Team Files
                </Link>
                
                {isAdmin() && (
                  <Link to="/admin" className="btn btn-outline-warning btn-lg">
                    <i className="bi bi-shield me-2"></i>
                    Admin Portal
                  </Link>
                )}

                <hr className="my-2" />
                
                {/* <div className="text-center">
                  <h6 className="text-muted mb-2">Need Help?</h6>
                  <p className="small text-muted mb-3">
                    Learn how to share documents securely with your team
                  </p>
                  <Button variant="outline-info" size="sm">
                    <i className="bi bi-question-circle me-1"></i>
                    View Documentation
                  </Button>
                </div> */}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* System Status */}
      <Row className="mt-4">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <h6 className="mb-1">
                    <i className="bi bi-shield-check text-success me-2"></i>
                    System Status: All Systems Operational
                  </h6>
                  <p className="mb-0 small text-muted">
                    Document sharing, upload, and download services are running normally.
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </Col>
                <Col md={4} className="text-md-end">
                  <Badge bg="success" className="fs-6">
                    <i className="bi bi-check-circle me-1"></i>
                    Online
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 