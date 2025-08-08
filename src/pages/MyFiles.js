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
import { documentAPI, publicAPI, downloadFile, formatFileSize, getFileIcon, adminAPI } from '../services/api';
import FilePreviewModal from '../components/FilePreviewModal';
import axios from 'axios'; // Added axios import
import { useAuth } from '../contexts/AuthContext';

const MyFiles = () => {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [copyingLink, setCopyingLink] = useState(null); // Track which link is being copied

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    name: '',
    description: '',
    teamShared: false,
  });

  // Share Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDocument, setShareDocument] = useState(null);
  const [shareForm, setShareForm] = useState({
    teamShared: false,
    sharedWithUsers: []
  });
  const [sharedUsersInput, setSharedUsersInput] = useState(''); // Input field for comma-separated users

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDocument, setEditDocument] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    teamShared: false,
  });

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

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
      // Use admin API if user is admin, otherwise use regular user API
      const response = isAdmin() 
        ? await adminAPI.getAllDocuments()
        : await documentAPI.getMyDocuments();
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setError('Please select a file to upload');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.name || uploadForm.file.name);
      formData.append('description', uploadForm.description);
      formData.append('teamShared', uploadForm.teamShared);

      await documentAPI.uploadDocument(formData);
      setSuccess('Document uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({ file: null, name: '', description: '', teamShared: false });
      fetchDocuments();
    } catch (error) {
      setError('Failed to upload document');
      console.error('Upload error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await documentAPI.downloadDocument(document.id);
      downloadFile(response.data, document.fileName);
    } catch (error) {
      setError('Failed to download document');
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentAPI.deleteDocument(documentId);
        setSuccess('Document deleted successfully!');
        fetchDocuments();
      } catch (error) {
        setError('Failed to delete document');
        console.error('Delete error:', error);
      }
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      const sharedWithUsers = sharedUsersInput
        .split(',')
        .map(user => user.trim())
        .filter(user => user.length > 0);

      const payload = {
        documentId: shareDocument.id,
        sharedWithUsers: sharedWithUsers,
        teamShared: shareForm.teamShared
      };
      await documentAPI.shareDocument(shareDocument.id, payload);
      setSuccess('Document sharing settings updated!');
      setShowShareModal(false);
      fetchDocuments();
    } catch (error) {
      setError('Failed to update sharing settings');
      console.error('Share error:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await documentAPI.updateDocument(editDocument.id, editForm);
      setSuccess('Document updated successfully!');
      setShowEditModal(false);
      fetchDocuments();
    } catch (error) {
      setError('Failed to update document');
      console.error('Edit error:', error);
    }
  };

  const openShareModal = (document) => {
    setShareDocument(document);
    setShareForm({
      teamShared: document.teamShared,
      sharedWithUsers: []
    });
    setSharedUsersInput(''); // Clear the input field
    setShowShareModal(true);
  };

  const openEditModal = (document) => {
    setEditDocument(document);
    setEditForm({
      name: document.name,
      description: document.description || '',
      teamShared: document.teamShared,
    });
    setShowEditModal(true);
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
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">
                {isAdmin() ? 'All Documents (Admin View)' : 'My Files'}
              </h2>
              {isAdmin() && (
                <p className="text-muted mt-1">Viewing all documents in the system</p>
              )}
            </div>
            <Button variant="primary" onClick={() => setShowUploadModal(true)}>
              <i className="bi bi-cloud-upload me-2"></i>
              Upload Document
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

          {/* Search Bar */}
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search documents..."
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
                  <p className="mt-2">Loading documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-file-earmark display-1 text-muted"></i>
                  <p className="mt-2 text-muted">
                    {searchTerm ? 'No documents found matching your search.' : 'No documents uploaded yet.'}
                  </p>
                  {!searchTerm && (
                    <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                      Upload Your First Document
                    </Button>
                  )}
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Size</th>
                      <th>Shared</th>
                      <th>Created</th>
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
                        <td>{formatFileSize(document.fileSize)}</td>
                        <td>
                          {document.teamShared ? (
                            <Badge bg="success">Team Shared</Badge>
                          ) : (
                            <Badge bg="secondary">Private</Badge>
                          )}
                        </td>
                        <td>{new Date(document.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ zIndex: 9999 }}>
                              <Dropdown.Item onClick={() => handleDownload(document)}>
                                <i className="bi bi-download me-2"></i>
                                Download
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handlePreview(document)}>
                                <i className="bi bi-eye me-2"></i>
                                Preview
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => openEditModal(document)}>
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => openShareModal(document)}>
                                <i className="bi bi-share me-2"></i>
                                Share
                              </Dropdown.Item>
                              {document.shareableLink && (
                                <Dropdown.Item onClick={() => copyShareableLink(document.shareableLink)}>
                                  <i className="bi bi-link me-2"></i>
                                  Copy Link
                                  {copyingLink === document.shareableLink && (
                                    <Spinner animation="border" size="sm" className="ms-2" />
                                  )}
                                </Dropdown.Item>
                              )}
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                className="text-danger"
                                onClick={() => handleDelete(document.id)}
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

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Upload Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUploadSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Select File</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Document Name</Form.Label>
              <Form.Control
                type="text"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Enter document name (optional)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Enter document description (optional)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Share with team"
                checked={uploadForm.teamShared}
                onChange={(e) => setUploadForm({ ...uploadForm, teamShared: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={uploadLoading}>
              {uploadLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleShare}>
          <Modal.Body>
            <p>Document: <strong>{shareDocument?.name}</strong></p>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Share with team"
                checked={shareForm.teamShared}
                onChange={(e) => setShareForm({ ...shareForm, teamShared: e.target.checked })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Share with specific users</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter usernames separated by commas (e.g., user1, user2, user3)"
                value={sharedUsersInput}
                onChange={(e) => setSharedUsersInput(e.target.value)}
              />
              <Form.Text className="text-muted">
                Enter usernames or user IDs separated by commas. Leave empty to share with team only.
              </Form.Text>
            </Form.Group>

            {shareDocument?.shareableLink && (
              <div>
                <Form.Label>Shareable Link</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={shareDocument.shareableLink}
                    readOnly
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => copyShareableLink(shareDocument.shareableLink)}
                  >
                    Copy
                  </Button>
                </InputGroup>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowShareModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Sharing
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEdit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Document Name</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter document description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Share with team"
                checked={editForm.teamShared}
                onChange={(e) => setEditForm({ ...editForm, teamShared: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

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

export default MyFiles; 