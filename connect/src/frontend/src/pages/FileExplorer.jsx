import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function FileExplorer() {
  const { deviceId } = useParams();
  const [currentPath, setCurrentPath] = useState('/sdcard');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
    setMessage(`Failed to load directory: ${err.message}`);
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
      const result = await window.electronAPI.adbPull(deviceId, `"${currentPath}/${entry.name}"` ,);
      setMessage('Downloaded: ' + entry.name);
    } catch (err) {
      setMessage('Failed to download file');
    }
  };

  return (
    <div className="min-h-screen w-3/4 flex items-center justify-center bg-[url('/home_bg.jpg')] bg-cover bg-top bg-no-repeat py-8 hide-scrollbar">
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 shadow-emerald-800 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-800/10" style={{ backdropFilter: 'blur(15px)' }}></div>
        <div className="relative z-10 p-8">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#04806b] to-white text-transparent bg-clip-text"
            style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
            File Explorer: <span className="text-[#04806b]">{deviceId}</span>
          </h2>
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
            >Back</button>
            <button
              onClick={handleBack}
              className="px-3 py-1 rounded bg-[#04806b] text-white hover:bg-emerald-700 transition"
              disabled={currentPath === '/sdcard'}
            >Up</button>
            <span className="ml-2 font-mono text-sm text-gray-700 truncate">{currentPath}</span>
          </div>
          {loading && <div className="text-[#04806b] mb-2">Loading...</div>}
          {message && <div className="mb-2 text-emerald-700">{message}</div>}
          <div className="bg-white/80 rounded-xl p-4 shadow max-h-[400px] overflow-auto">
            <ul>
              {entries.map(entry => (
                <li key={entry.name} className="flex items-center justify-between py-2 border-b border-emerald-50 last:border-b-0">
                  <div
                    className={`flex items-center gap-2 cursor-pointer ${entry.isDir ? 'hover:text-[#04806b]' : ''}`}
                    onClick={() => handleEntryClick(entry)}
                  >
                    {entry.isDir ? (
                      <span className="text-lg">📁</span>
                    ) : (
                      <span className="text-lg">📄</span>
                    )}
                    <span>{entry.name}</span>
                  </div>
                  {!entry.isDir && (
                    <button
                      onClick={() => handleDownload(entry)}
                      className="px-2 py-1 rounded bg-[#04806b] text-white text-xs hover:bg-emerald-700 transition"
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
  );
}

export default FileExplorer;