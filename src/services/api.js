import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Auth API (no auth needed)
export const authAPI = {
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials),
  register: (userData) => axios.post(`${API_BASE_URL}/auth/register`, userData),
};

// Document API (with direct auth headers)
export const documentAPI = {
  uploadDocument: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/documents/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getMyDocuments: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/documents/my-files`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  
  getTeamDocuments: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/documents/team-files`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  
  getDocumentById: (id) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/documents/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  
  downloadDocument: (id) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'blob',
    });
  },
  
  shareDocument: (id, shareData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/documents/${id}/share`, shareData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  
  updateDocument: (id, updateData) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/documents/${id}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  
  deleteDocument: (id) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_BASE_URL}/documents/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  searchDocuments: (searchTerm) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/documents/search?q=${encodeURIComponent(searchTerm)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};

// Public Shareable Link API (no authentication needed)
export const publicAPI = {
  getSharedDocument: (shareableLink) => {
    return axios.get(`${API_BASE_URL}/documents/share/${shareableLink}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  downloadSharedDocument: (shareableLink) => {
    return axios.get(`${API_BASE_URL}/documents/share/${shareableLink}`, {
      responseType: 'blob',
    });
  },
};

// Admin API (with direct auth headers)
export const adminAPI = {
  getAllUsers: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  
  createUser: (userData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/admin/users`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  
  updateUser: (id, userData) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/admin/users/${id}`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  
  deleteUser: (id) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Admin Document APIs
  getAllDocuments: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/documents/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  getTeamDocuments: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/documents/admin/team`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // Admin delete team document
  deleteTeamDocument: (id) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_BASE_URL}/documents/admin/team/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Get user by ID
  getUserById: (id) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/admin/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // Get active users
  getActiveUsers: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/admin/users/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};

// File utilities
export const downloadFile = async (blob, fileName) => {
  try {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Updated preview functions
export const previewFile = async (shareableLink) => {
  try {
    // Extract shareable link ID from the full URL if needed
    const shareableLinkId = shareableLink.includes('/') ? shareableLink.split('/').pop() : shareableLink;
    
    // Get the file content directly from the share endpoint
    const response = await axios.get(`${API_BASE_URL}/documents/share/${shareableLinkId}`, {
      responseType: 'blob', // Important: get response as blob
    });
    
    // Create a blob URL from the response
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/octet-stream' 
    });
    const url = URL.createObjectURL(blob);
    
    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : 'file';
    
    return {
      url: url,
      contentType: response.headers['content-type'] || 'application/octet-stream',
      filename: filename,
      document: {
        name: filename,
        fileType: response.headers['content-type'] || 'application/octet-stream',
        size: response.data.size || 0
      },
      cleanup: () => {
        URL.revokeObjectURL(url);
      }
    };
  } catch (error) {
    console.error('Preview failed:', error);
    throw error;
  }
};

// Utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType) => {
  const type = fileType.toLowerCase();
  if (type.includes('image')) return 'bi-file-earmark-image';
  if (type.includes('pdf')) return 'bi-file-earmark-pdf';
  if (type.includes('word') || type.includes('document')) return 'bi-file-earmark-word';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'bi-file-earmark-excel';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'bi-file-earmark-ppt';
  if (type.includes('video')) return 'bi-file-earmark-play';
  if (type.includes('audio')) return 'bi-file-earmark-music';
  if (type.includes('text')) return 'bi-file-earmark-text';
  if (type.includes('zip') || type.includes('archive')) return 'bi-file-earmark-zip';
  return 'bi-file-earmark';
}; 