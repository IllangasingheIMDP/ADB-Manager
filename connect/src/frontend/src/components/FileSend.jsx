import { useState } from "react";
import { useNotification } from "../hooks/useNotification";

function FileSend({ deviceId, onClose }) {
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { showSuccess, showError, showInfo } = useNotification();

  const handleFileSelect = async () => {
    try {
      const result = await window.electronAPI.showOpenDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fileName = filePath.split(/[\\/]/).pop(); // Get filename from path
        setSelectedFile({ path: filePath, name: fileName });
      }
    } catch (error) {
      showError(`Failed to open file dialog: ${error.message}`);
    }
  };

  const handleSend = async () => {
    if (!selectedFile) {
      showError('Please select a file to send.');
      return;
    }
    setSending(true);
    showInfo('Sending file...');
    try {
      console.log(`Sending file: ${selectedFile.path} to device: ${deviceId}`);
      const result = await window.electronAPI.adbPush(deviceId, selectedFile.path);
      showSuccess(`File sent successfully: ${result}`);
      onClose(); // Close the dialog after successful send
    } catch (error) {
      showError(`Failed to send file: ${error.message}`);
    }
    setSending(false);
    setSelectedFile(null); // Clear the selected file
  };

  return (
    <div className="p-6 bg-white/80 rounded-2xl shadow-lg border border-[#04806b]/30 min-w-[320px] relative">
      <h3 className="text-xl font-bold mb-4 text-[#04806b] text-center">Send File to Device</h3>
      <div className="flex flex-col items-center gap-3">
        <button 
          onClick={handleFileSelect}
          className="w-full flex flex-col items-center px-4 py-6 bg-emerald-50 text-[#04806b] rounded-lg shadow border-2 border-dashed border-[#04806b] cursor-pointer hover:bg-emerald-100 transition"
        >
          <span className="mb-2 text-base font-semibold">Choose a file</span>
          {selectedFile && (
            <span className="mt-2 text-sm text-emerald-900 font-medium truncate w-full text-center">{selectedFile.name}</span>
          )}
        </button>
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
      </div>
    </div>
  );
}

export default FileSend;