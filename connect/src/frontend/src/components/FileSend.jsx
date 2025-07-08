import { useState, useRef } from "react";

function FileSend({ deviceId, onClose }) {
  const fileInputRef = useRef();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file ? file.name : '');
  };

  const handleSend = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      setMessage('Please select a file to send.');
      return;
    }
    setSending(true);
    setMessage('Sending file...');
    try {
      const result = await window.electronAPI.adbPush(deviceId, file.path);
      setMessage(`File sent successfully: ${result}`);
    } catch (error) {
      setMessage(`Failed to send file: ${error.message}`);
    }
    setSending(false);
    fileInputRef.current.value = ''; // Clear the file input
    setFileName(''); // Clear the file name
  };

  return (
    <div className="p-6 bg-white/80 rounded-2xl shadow-lg border border-[#04806b]/30 min-w-[320px] relative">
      <h3 className="text-xl font-bold mb-4 text-[#04806b] text-center">Send File to Device</h3>
      <div className="flex flex-col items-center gap-3">
        <label className="w-full flex flex-col items-center px-4 py-6 bg-emerald-50 text-[#04806b] rounded-lg shadow border-2 border-dashed border-[#04806b] cursor-pointer hover:bg-emerald-100 transition">
          <span className="mb-2 text-base font-semibold">Choose a file</span>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          {fileName && (
            <span className="mt-2 text-sm text-emerald-900 font-medium truncate w-full text-center">{fileName}</span>
          )}
        </label>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={handleSend}
            disabled={sending}
            className={`flex-1 px-4 py-2 rounded font-semibold transition 
              ${sending
                ? 'bg-emerald-300 text-white cursor-not-allowed'
                : 'bg-[#04806b] text-white hover:bg-emerald-700 hover:scale-105'}`}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
        {message && (
          <div className={`mt-3 text-center text-sm rounded p-2 w-full
            ${message.startsWith('Failed') ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-[#04806b]'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileSend;