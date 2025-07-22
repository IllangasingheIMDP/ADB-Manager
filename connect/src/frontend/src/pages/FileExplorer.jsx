import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { getErrorMessage, getSuccessMessage } from '../utils/errorHandler';

function FileExplorer() {
  const { deviceId } = useParams();
  const [currentPath, setCurrentPath] = useState('/sdcard');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    
    fetchEntries(currentPath);
    // eslint-disable-next-line
  }, [currentPath, deviceId]);

const fetchEntries = async (path) => {
  setLoading(true);
  setMessage('');
  console.log('Fetching entries for path:', path);
  try {
    // Escape quotes and spaces
    const escapedPath = path.replace(/"/g, '\\"').replace(/ /g, '\\ ');
    let result;
    try {
      result = await window.electronAPI.adbShell(deviceId, `ls -p "${escapedPath}"`);
      console.log('Raw ls -p output:', result);
    } catch (err) {
      if (err.message.includes('device offline')) {
        setMessage('Device offline, attempting to reconnect...');
        showError('Device offline, attempting to reconnect...');
        await window.electronAPI.adbConnect(deviceId.split(':')[0], deviceId.split(':')[1] || '5555');
        result = await window.electronAPI.adbShell(deviceId, `ls -p "${escapedPath}"`);
        console.log('Raw ls -p output after reconnect:', result);
      } else {
        throw err;
      }
    }
    const files = result
      .split(/\r?\n/)
      .filter(Boolean)
      .map(name => {
        const cleanName = name.trim().replace(/\r$/, '');
        const isDir = cleanName.endsWith('/');
        const finalName = cleanName.replace(/\/$/, '');
        return {
          name: finalName,
          isDir,
        };
      });
    console.log('Parsed entries:', files);
    setEntries(files);
  } catch (err) {
    const errorMsg = getErrorMessage(err.message);
    setMessage(`Failed to load directory: ${errorMsg}`);
    showError(errorMsg);
    console.error('ADB Error:', err);
  }
  setLoading(false);
};

  const handleEntryClick = (entry) => {
    console.log('Clicked entry:', entry.name, 'isDir:', entry.isDir);
  if (entry.isDir) {
    setCurrentPath(currentPath.endsWith('/') ? currentPath + `${entry.name}` : currentPath + '/' + entry.name);
  }
  };

  const handleBack = () => {
    if (currentPath === '/sdcard') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  const handleDownload = async (entry) => {
    setMessage('Downloading...');
    try {
      // You may want to prompt for a save location
      await window.electronAPI.adbPull(deviceId, `"${currentPath}/${entry.name}"` ,);
      const successMsg = getSuccessMessage('download', entry.name);
      setMessage(successMsg);
      showSuccess(successMsg);
    } catch (err) {
      const errorMsg = getErrorMessage(err.message);
      setMessage(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <div className="h-full font-custom2 w-3/4 flex items-center justify-center py-8 hide-scrollbar">
      <div className="w-full max-w-2xl rounded-2xl border border-emerald-400/30 shadow-emerald-800 shadow-lg relative overflow-hidden">
        {/* Glassmorphism background */}
        <div 
          className="absolute inset-0 bg-emerald-900/20 rounded-2xl" 
          style={{ backdropFilter: 'blur(16px)' }}
        ></div>
        
        <div className="relative z-10 h-[70vh] p-8">
          <h2 className="text-2xl font-bold m-4 bg-gradient-to-r from-emerald-300 to-white text-transparent bg-clip-text"
            style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
            File Explorer: <span className="text-emerald-300">{deviceId}</span>
          </h2>
          
          {/* Navigation controls with glassmorphism */}
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              Back
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-emerald-400/30 bg-emerald-800/20 text-emerald-200 hover:bg-emerald-800/30 transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPath === '/sdcard'}
            >
              Up
            </button>
            <div className="ml-2 px-3 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm">
              <span className="font-mono text-sm text-emerald-100 truncate">{currentPath}</span>
            </div>
          </div>
          
          {/* Status messages */}
          {loading && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-800/20 border border-emerald-400/30 backdrop-blur-sm">
              <div className="text-emerald-200 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-800/20 border border-emerald-400/30 backdrop-blur-sm">
              <div className="text-emerald-200">{message}</div>
            </div>
          )}
          
          {/* File list with enhanced glassmorphism */}
          <div className="rounded-xl border border-white/20 relative overflow-hidden max-h-[400px]">
            {/* Background blur layer */}
            <div 
              className="absolute inset-0 bg-white/5" 
              style={{ backdropFilter: 'blur(12px)' }}
            ></div>
            
            <div className="relative z-10 p-4 overflow-auto max-h-[400px] hide-scrollbar">
              <ul className="space-y-1">
                {entries.map(entry => (
                  <li 
                    key={entry.name} 
                    className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                  >
                    <div
                      className={`flex items-center gap-3 cursor-pointer flex-1 ${
                        entry.isDir ? 'hover:text-emerald-300' : 'text-white'
                      } transition-colors duration-200`}
                      onClick={() => handleEntryClick(entry)}
                    >
                      {entry.isDir ? (
                        <span className="text-xl">📁</span>
                      ) : (
                        <span className="text-xl">📄</span>
                      )}
                      <span className="text-white/90">{entry.name}</span>
                    </div>
                    {!entry.isDir && (
                      <button
                        onClick={() => handleDownload(entry)}
                        className="px-3 py-1.5 rounded-lg border border-emerald-400/30 bg-emerald-800/30 text-emerald-200 text-sm hover:bg-emerald-700/40 hover:border-emerald-400/50 transition-all duration-200 backdrop-blur-sm ml-2"
                      >
                        Download
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileExplorer;