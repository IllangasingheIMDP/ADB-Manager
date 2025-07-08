import { useState,useRef } from "react";

function FileSend({ deviceId,onClose }) {
    const fileInputRef = useRef();
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () =>{
        const file=fileInputRef.current.files[0];
        if(!file){
            setMessage('Please select a file to send.');
            return;
        }
        setSending(true);
        setMessage('Sending file...');
        try {
            const result=await window.electronAPI.adbPush(deviceId,file.path);
            setMessage(`File sent successfully: ${result}`);

        }catch (error) {
            setMessage(`Failed to send file: ${error.message}`);
        }
        setSending(false);
        fileInputRef.current.value = ''; // Clear the file input

    }
    return (
    <div className="p-4">
      <input type="file" ref={fileInputRef} className="mb-2" />
      <div className="flex gap-2">
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  );


}
export default FileSend;