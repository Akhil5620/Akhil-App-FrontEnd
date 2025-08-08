import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Alert,
  Spinner,
  Badge,
  Dropdown,
  InputGroup,
  Form,
} from 'react-bootstrap';
import { documentAPI, publicAPI, downloadFile, formatFileSize, getFileIcon, adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FilePreviewModal from '../components/FilePreviewModal';
import axios from 'axios'; // Added axios import

const TeamFiles = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copyingLink, setCopyingLink] = useState(null); // Track which link is being copied

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  const { isAdmin } = useAuth();

  useEffect(() => {
    // Wait for a short delay to ensure token is properly stored after login
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchDocuments();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Use admin API if user is admin, otherwise use regular team documents API
      const response = isAdmin() 
        ? await adminAPI.getTeamDocuments()
        : await documentAPI.getTeamDocuments();
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to fetch team documents');
      console.error('Error fetching team documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      await downloadFile(document.id, document.name);
      setSuccess('Download started successfully!');
    } catch (error) {
      setError('Failed to download document');
      console.error('Download error:', error);
    }
  };

  const handleAdminDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this team document? This action cannot be undone.')) {
      try {
        await adminAPI.deleteTeamDocument(documentId);
        setSuccess('Team document deleted successfully!');
        fetchDocuments();
      } catch (error) {
        setError('Failed to delete team document');
        console.error('Admin delete error:', error);
      }
    }
  };

  const copyShareableLink = async (shareableLink) => {
    try {
      setCopyingLink(shareableLink); // Set which link is being copied
      // Extract shareable link ID from the full URL if needed
      const shareableLinkId = shareableLink.includes('/') ? shareableLink.split('/').pop() : shareableLink;
      
      // Get the file content and create blob URL
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/documents/share/${shareableLinkId}`, {
        responseType: 'blob',
      });
      
      // Create a blob URL from the response
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      const blobUrl = URL.createObjectURL(blob);
      
      await navigator.clipboard.writeText(blobUrl);
      setSuccess('Blob URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      setError('Failed to copy link to clipboard');
    } finally {
      setCopyingLink(null); // Clear copying state
    }
  };

  const handlePreview = (document) => {
    if (!document.shareableLink) {
      setError('This document does not have a shareable link for preview. Please share it first.');
      return;
    }

    setPreviewDocument(document);
    setShowPreviewModal(true);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">
                {isAdmin() ? 'All Team Documents (Admin View)' : 'Team Files'}
              </h2>
              <p className="text-muted mt-1">
                {isAdmin() 
                  ? 'Viewing all team-shared documents in the system'
                  : 'Documents shared by team members'
                }
              </p>
            </div>
            {isAdmin() && (
              <Badge bg="warning" text="dark">
                <i className="bi bi-shield me-1"></i>
                Admin View
              </Badge>
            )}
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

          {/* Search Bar */}
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search team documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* Documents Table */}
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading team documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-people display-1 text-muted"></i>
                  <p className="mt-2 text-muted">
                    {searchTerm ? 'No team documents found matching your search.' : 'No team documents shared yet.'}
                  </p>
                  {!searchTerm && (
                    <p className="text-muted">
                      Team members can share documents by uploading files with "Share with team" option enabled.
                    </p>
                  )}
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Owner</th>
                      <th>Size</th>
                      <th>Shared Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document) => (
                      <tr key={document.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className={`${getFileIcon(document.fileType)} me-2 text-primary`}></i>
                            <div>
                              <div className="fw-medium">{document.name}</div>
                              {document.description && (
                                <small className="text-muted">{document.description}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person-circle me-2 text-secondary"></i>
                            <span>{document.ownerName}</span>
                          </div>
                        </td>
                        <td>{formatFileSize(document.fileSize)}</td>
                        <td>{new Date(document.createdAt).toLocaleDateString()}</td>
                                                 <td>
                           <Dropdown>
                             <Dropdown.Toggle variant="outline-secondary" size="sm">
                               Actions
                             </Dropdown.Toggle>
                             <Dropdown.Menu style={{ zIndex: 9999 }}>
                              <Dropdown.Item onClick={() => handlePreview(document)}>
                                <i className="bi bi-eye me-2"></i>
                                Preview
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleDownload(document)}>
                                <i className="bi bi-download me-2"></i>
                                Download
                              </Dropdown.Item>
                              {document.shareableLink && (
                                <Dropdown.Item onClick={() => copyShareableLink(document.shareableLink)}>
                                  <i className="bi bi-link me-2"></i>
                                  Copy Share Link
                                  {copyingLink === document.shareableLink && (
                                    <Spinner animation="border" size="sm" className="ms-2" />
                                  )}
                                </Dropdown.Item>
                              )}
                              {isAdmin() && (
                                <>
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    className="text-danger"
                                    onClick={() => handleAdminDelete(document.id)}
                                  >
                                    <i className="bi bi-trash me-2"></i>
                                    Delete (Admin)
                                  </Dropdown.Item>
                                </>
                              )}
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

          {/* Information Panel */}
          <Row className="mt-4">
            <Col md={8}>
              <Card className="bg-light">
                <Card.Body>
                  <h6 className="fw-bold mb-2">
                    <i className="bi bi-info-circle me-2"></i>
                    About Team Files
                  </h6>
                  <ul className="mb-0 small">
                    <li>Team files are documents shared by team members for collaborative access</li>
                    <li>All team members can view and download these documents</li>
                    <li>Only the document owner can edit or delete their own files</li>
                    {isAdmin() && (
                      <li className="text-warning">
                        <strong>Admin privilege:</strong> You can delete any team document if needed
                      </li>
                    )}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-primary text-white">
                <Card.Body className="text-center">
                  <i className="bi bi-files display-4 mb-2"></i>
                  <h5 className="mb-1">{documents.length}</h5>
                  <small>Total Team Documents</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* File Preview Modal */}
      <FilePreviewModal
        show={showPreviewModal}
        onHide={() => {
          setShowPreviewModal(false);
          setPreviewDocument(null);
        }}
        document={previewDocument}
        onSuccess={setSuccess}
        onError={setError}
      />
    </Container>
  );
};

export default TeamFiles; 