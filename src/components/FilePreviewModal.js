import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { previewFile } from '../services/api';

const FilePreviewModal = ({ show, onHide, document: fileDocument, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setError('');
      try {
        if (!fileDocument || !fileDocument.shareableLink) {
          setError('This document does not have a shareable link for preview.');
          return;
        }
        
        const preview = await previewFile(fileDocument.shareableLink);
        setPreviewData(preview);
      } catch (err) {
        setError('Failed to load file preview');
        console.error('Preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (show && fileDocument) {
      loadPreview();
    }
  }, [show, fileDocument]);

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup blob URL when modal closes
      if (previewData && previewData.cleanup) {
        previewData.cleanup();
      }
    };
  }, [previewData]);

  const handleClose = () => {
    if (previewData && previewData.cleanup) {
      previewData.cleanup();
    }
    setPreviewData(null);
    setError('');
    onHide();
  };

  const isImage = (contentType) => {
    return contentType && contentType.startsWith('image/');
  };

  const isPDF = (contentType) => {
    return contentType && contentType === 'application/pdf';
  };

  const isText = (contentType) => {
    return contentType && (
      contentType.startsWith('text/') ||
      contentType === 'application/json' ||
      contentType === 'application/xml'
    );
  };

  const isOfficeDocument = (contentType, fileExtension) => {
    const officeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const officeExtensions = ['doc', 'docx', 'xlsx'];
    
    return (contentType && officeTypes.some(type => contentType.includes(type))) || 
           officeExtensions.includes(fileExtension);
  };

  const getFileExtension = (fileName) => {
    return fileName ? fileName.split('.').pop().toLowerCase() : '';
  };

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="text-center p-4">
          <Spinner animation="border" />
          <p className="mt-2">Loading preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="m-3">
          {error}
        </Alert>
      );
    }

    if (!previewData || !fileDocument) return null;

    const { url, contentType, document: docData } = previewData;
    const fileExtension = getFileExtension(fileDocument?.name || '');
    const mimeType = docData?.fileType || contentType;

    // Image preview
    if (isImage(mimeType) || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension)) {
      return (
        <div className="text-center p-3">
          <img 
            src={url} 
            alt={fileDocument?.name || 'Preview'}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '500px', 
              objectFit: 'contain',
              border: '1px solid #dee2e6',
              borderRadius: '4px'
            }}
          />
        </div>
      );
    }

    // PDF preview
    if (isPDF(mimeType) || fileExtension === 'pdf') {
      return (
        <div className="p-3">
          <iframe
            src={url}
            width="100%"
            height="500px"
            style={{ border: '1px solid #dee2e6', borderRadius: '4px' }}
            title={fileDocument?.name || 'Preview'}
          />
        </div>
      );
    }

    // Office document preview (Word, Excel)
    if (isOfficeDocument(mimeType, fileExtension)) {
      return (
        <div className="p-4">
          <OfficeDocumentPreview 
            url={url} 
            fileName={fileDocument?.name || 'file'} 
            fileExtension={fileExtension}
            mimeType={mimeType}
            fileSize={docData?.formattedFileSize || (fileDocument?.size ? `${(fileDocument.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown')}
          />
        </div>
      );
    }

    // CSV file preview with table formatting
    if (fileExtension === 'csv' || (mimeType && mimeType.includes('csv'))) {
      return (
        <div className="p-3">
          <CSVFilePreview url={url} fileName={fileDocument?.name || 'file'} />
        </div>
      );
    }

    // Text file preview
    if (isText(mimeType) || ['txt', 'json', 'xml', 'md', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'h'].includes(fileExtension)) {
      return (
        <div className="p-3">
          <TextFilePreview url={url} fileName={fileDocument?.name || 'file'} />
        </div>
      );
    }

    // Audio preview
    if ((mimeType && mimeType.startsWith('audio/')) || ['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension)) {
      return (
        <div className="text-center p-3">
          <audio controls style={{ width: '100%' }}>
            <source src={url} type={mimeType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    // Video preview
    if ((mimeType && mimeType.startsWith('video/')) || ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(fileExtension)) {
      return (
        <div className="text-center p-3">
          <video controls style={{ width: '100%', maxHeight: '400px' }}>
            <source src={url} type={mimeType} />
            Your browser does not support the video element.
          </video>
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="text-center p-4">
        <Alert variant="info">
          <h5>Preview not available</h5>
          <p>This file type cannot be previewed. You can download it to view the content.</p>
          <p className="mb-0">
            <strong>File:</strong> {fileDocument?.name || 'Unknown'}<br />
            <strong>Type:</strong> {mimeType || 'Unknown'}<br />
            <strong>Size:</strong> {docData?.formattedFileSize || (fileDocument?.size ? `${(fileDocument.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown')}
          </p>
        </Alert>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-eye me-2"></i>
          Preview: {fileDocument?.name || 'File'}
          {fileDocument?.shareableLink && <small className="text-muted"> (via share link)</small>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {renderPreviewContent()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        {fileDocument && (
          <Button 
            variant="primary" 
            onClick={() => {
              // Download the file using the blob URL
              if (previewData?.url && previewData?.filename) {
                const link = document.createElement('a');
                link.href = previewData.url;
                link.download = previewData.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                onSuccess && onSuccess('File download started!');
              }
            }}
            disabled={!previewData}
          >
            <i className="bi bi-download me-1"></i>
            Download
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

// Component for CSV file preview
const CSVFilePreview = ({ url, fileName }) => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCSVContent = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const parsedData = rows.map(row => {
          // Simple CSV parser - handles basic cases
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());
          return values;
        });
        setCsvData(parsedData);
      } catch (err) {
        console.error('Failed to load CSV content:', err);
        setError(`Failed to load CSV content: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      loadCSVContent();
    }
  }, [url]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Loading CSV data...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="warning">{error}</Alert>;
  }

  if (csvData.length === 0) {
    return <Alert variant="info">No data found in CSV file</Alert>;
  }

  const headers = csvData[0] || [];
  const dataRows = csvData.slice(1);
  const maxRowsToShow = 50; // Limit to prevent performance issues

  return (
    <div>
      <div className="mb-2">
        <small className="text-muted">File: {fileName}</small>
        {dataRows.length > maxRowsToShow && (
          <div>
            <small className="text-warning">
              Showing first {maxRowsToShow} rows of {dataRows.length} total rows
            </small>
          </div>
        )}
      </div>
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        <Table striped bordered hover size="sm" className="mb-0">
          <thead className="table-dark">
            <tr>
              {headers.map((header, index) => (
                <th key={index} style={{ minWidth: '100px' }}>
                  {header || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.slice(0, maxRowsToShow).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((_, colIndex) => (
                  <td key={colIndex} style={{ wordBreak: 'break-word' }}>
                    {row[colIndex] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

// Component for office document preview
const OfficeDocumentPreview = ({ url, fileName, fileExtension, mimeType, fileSize }) => {
  const getFileTypeInfo = () => {
    switch (fileExtension.toLowerCase()) {
      case 'doc':
      case 'docx':
        return {
          icon: 'bi-file-earmark-word',
          type: 'Microsoft Word Document',
          color: '#1f5694'
        };
      case 'xlsx':
        return {
          icon: 'bi-file-earmark-excel',
          type: 'Microsoft Excel Spreadsheet',
          color: '#0f7b0f'
        };
      default:
        return {
          icon: 'bi-file-earmark',
          type: 'Office Document',
          color: '#6c757d'
        };
    }
  };

  const fileInfo = getFileTypeInfo();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <i 
          className={`${fileInfo.icon} display-1`} 
          style={{ color: fileInfo.color, fontSize: '5rem' }}
        ></i>
      </div>
      <div className="mb-3">
        <h5>{fileName}</h5>
        <p className="text-muted mb-1">{fileInfo.type}</p>
        <small className="text-muted">Size: {fileSize}</small>
      </div>
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-center justify-content-center">
          <i className="bi bi-info-circle me-2"></i>
          <span>Microsoft Office documents cannot be previewed directly in the browser. Please download to view.</span>
        </div>
      </Alert>
      <Button 
        variant="primary" 
        size="lg"
        onClick={handleDownload}
        className="px-4"
      >
        <i className="bi bi-download me-2"></i>
        Download {fileInfo.type.split(' ')[1]} File
      </Button>
    </div>
  );
};

// Component for text file preview
const TextFilePreview = ({ url, fileName }) => {
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTextContent = async () => {
      try {
        // Fetch the blob content and read as text
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        setTextContent(text);
      } catch (err) {
        console.error('Failed to load text content:', err);
        setError(`Failed to load text content: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      loadTextContent();
    }
  }, [url]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Loading text...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="warning">{error}</Alert>;
  }

  return (
    <div>
      <div className="mb-2">
        <small className="text-muted">File: {fileName}</small>
      </div>
      <pre 
        style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px', 
          border: '1px solid #dee2e6',
          maxHeight: '400px',
          overflow: 'auto',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {textContent}
      </pre>
    </div>
  );
};

export default FilePreviewModal; 