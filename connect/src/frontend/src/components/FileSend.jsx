import { useState, useEffect } from "react";
import { useNotification } from "../hooks/useNotification";

function FileSend({ deviceId, onClose }) {
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        // Use the exposed Electron utility
        const filePath = window.electronAPI.getPathForFile(file);
        if (filePath && file.name) {
          setSelectedFile({ path: filePath, name: file.name });
        } else {
          showError('Dropped file is invalid or missing file path. Please use the file selector.');
        }
      }
    } catch (error) {
      showError(`Error handling dropped file: ${error.message}`);
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

  // Add clipboard paste handler
  const handlePaste = async (e) => {
    e.preventDefault();
    try {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          // Convert blob to base64
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Data = reader.result.split(',')[1];
            // Send the base64 data to electron to save as temp file
            try {
              const tempFilePath = await window.electronAPI.saveTempImage(base64Data);
              setSelectedFile({ 
                path: tempFilePath, 
                name: `clipboard_image_${new Date().getTime()}.png` 
              });
            } catch (error) {
              showError(`Failed to process clipboard image: ${error.message}`);
            }
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    } catch (error) {
      showError(`Error handling clipboard paste: ${error.message}`);
    }
  };

  // Add paste event listener
  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <div className="p-6 bg-white/80 rounded-2xl shadow-lg border border-[#04806b]/30 min-w-[320px] relative">
      <h3 className="text-xl font-bold mb-4 text-[#04806b] text-center">Send File to Device</h3>
      <div className="flex flex-col items-center gap-3">
        <div 
          onClick={handleFileSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full flex flex-col items-center px-4 py-6 rounded-lg shadow border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'bg-emerald-200 border-[#04806b] border-solid scale-105'
              : selectedFile
              ? 'bg-emerald-100 border-[#04806b] text-[#04806b]'
              : 'bg-emerald-50 border-[#04806b] text-[#04806b] hover:bg-emerald-100'
          }`}
        >
          <span className="mb-2 text-base font-semibold">
            {isDragOver ? 'Drop file here' : 'Choose a file or drag & drop'}
          </span>
          <span className="text-sm text-emerald-700 opacity-75">
            Click to browse or drag files here
          </span>
          {selectedFile && (
            <span className="mt-2 text-sm text-emerald-900 font-medium truncate w-full text-center">
              📄 {selectedFile.name}
            </span>
          )}
        </div>
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