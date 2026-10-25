import React, { useState, useEffect } from 'react';
import API from './api';
import { Upload, HardDrive, Trash2, Download, LogOut, FileText } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  // Dashboard state
  const [files, setFiles] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0); // in bytes
  const [uploading, setUploading] = useState(false);

  const STORAGE_LIMIT = 20 * 1024 * 1024; // 20MB limit

  useEffect(() => {
    if (token) {
      fetchFiles();
      fetchStorageUsage();
    }
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await API.post('/auth/register', { name, email, password });
        setIsRegister(false);
        setPassword('');
        alert('Registration successful! Please sign in.');
      } else {
        const res = await API.post('/auth/login', { email, password });
        const receivedToken = res.data.token || res.data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : 'Authentication failed.');
      setError(errorMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setFiles([]);
    setEmail('');
    setPassword('');
    setName('');
  };

  const fetchFiles = async () => {
    try {
      const res = await API.get('/files');
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load files', err);
    }
  };

  const fetchStorageUsage = async () => {
    try {
      const res = await API.get('/files/storage/usage');
      setStorageUsed(res.data.usedBytes ?? res.data ?? 0);
    } catch (err) {
      console.error('Failed to load storage quota', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (storageUsed + file.size > STORAGE_LIMIT) {
      alert('Upload failed: File exceeds your 20MB storage limit!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      await API.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchFiles();
      fetchStorageUsage();
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/files/${id}`);
      fetchFiles();
      fetchStorageUsage();
    } catch (err) {
      alert('Failed to delete file.');
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const response = await API.get(`/files/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download file.');
    }
  };

  const usedMB = (storageUsed / (1024 * 1024)).toFixed(2);
  const percentage = Math.min((storageUsed / STORAGE_LIMIT) * 100, 100).toFixed(1);

  // Authentication View
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
            {isRegister ? 'Create Account' : 'Cloud Storage Login'}
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                  placeholder="Sagar"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                placeholder="sagar@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition duration-200"
            >
              {isRegister ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <HardDrive className="text-blue-600 w-8 h-8" />
            <span className="text-xl font-bold text-slate-800">CloudVault</span>
          </div>

          {/* Storage Quota Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
              <span>Storage Used</span>
              <span>{usedMB} / 20 MB</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage > 80 ? 'bg-red-500' : 'bg-blue-600'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">{percentage}% of quota used</span>
          </div>

          {/* Upload Button */}
          <label className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg cursor-pointer shadow transition duration-200">
            <Upload size={18} />
            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium pt-4 border-t border-slate-200 transition duration-150"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Files</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500 w-8 h-8 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-slate-800 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDownload(file.id, file.filename)}
                  className="p-1 text-slate-400 hover:text-blue-600 transition duration-150"
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition duration-150"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <div className="col-span-full text-slate-400 py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
              No files uploaded yet. Upload your first file using the sidebar.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}