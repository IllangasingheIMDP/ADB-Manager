import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCommands, addCommand } from '../components/commands';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { getErrorMessage, getSuccessMessage } from '../utils/errorHandler';

function Commands() {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const [commands, setCommands] = useState([]);
  const [newCommand, setNewCommand] = useState({ name: '', command: '', description: '' });
  const [output, setOutput] = useState('');

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    setCommands(getCommands());
  }, []);

  const handleAddCommand = (e) => {
    e.preventDefault();
    const added = addCommand(newCommand);
    if (added) {
      setCommands(getCommands());
      setNewCommand({ name: '', command: '', description: '' });
      showSuccess(getSuccessMessage('command', 'Command added successfully'));
    } else {
      showError('Failed to add command - command name might already exist');
    }
  };

  const executeCommand = async (command) => {
    try {
      const result = await window.electronAPI.adbShell(deviceId, command);
      setOutput(result);
      showSuccess(getSuccessMessage('command', 'Command executed successfully'));
    } catch (err) {
      const errorMsg = getErrorMessage(err.message);
      setOutput(`Error: ${errorMsg}`);
      showError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/home_bg.jpg')] bg-cover bg-top bg-no-repeat py-8">
      <div className="w-full max-w-4xl rounded-2xl border border-white/20 shadow-emerald-800 shadow-md relative overflow-hidden">
        <div
          className="absolute inset-0 bg-emerald-800/10"
          style={{ backdropFilter: 'blur(15px)' }}
        ></div>
        <div className="relative z-10 p-8">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#04806b] to-white text-transparent bg-clip-text"
            style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
            Shell Commands for Device: <span className="text-[#04806b]">{deviceId}</span>
          </h2>
          <button
            className="text-lg bg-[#04806b] text-white px-6 py-2 rounded-2xl mb-6 border-b-2 border-emerald-900 hover:bg-emerald-700 transition"
            onClick={() => navigate(-1)}

          >
            Back
          </button>
          <div className="mb-8 bg-white/80 p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3 text-[#04806b]">Add New Command</h3>
            <form onSubmit={handleAddCommand} className="space-y-3">
              <input
                type="text"
                placeholder="Command Name"
                value={newCommand.name}
                onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
                className="w-full p-2 border border-[#04806b] rounded focus:ring-2 focus:ring-[#04806b] focus:outline-none bg-emerald-50/50"
              />
              <input
                type="text"
                placeholder="Shell Command"
                value={newCommand.command}
                onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
                className="w-full p-2 border border-[#04806b] rounded focus:ring-2 focus:ring-[#04806b] focus:outline-none bg-emerald-50/50"
              />
              <input
                type="text"
                placeholder="Description"
                value={newCommand.description}
                onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                className="w-full p-2 border border-[#04806b] rounded focus:ring-2 focus:ring-[#04806b] focus:outline-none bg-emerald-50/50"
              />
              <button
                type="submit"
                className="w-full p-2 bg-[#04806b] text-white rounded hover:bg-emerald-700 transition"
              >
                Add Command
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-3 text-[#04806b]">Saved Commands</h3>
              <div className="space-y-3">
                {commands.map((cmd) => (
                  <div key={cmd.id} className="bg-white/80 p-4 rounded-xl shadow border border-[#04806b]/20">
                    <h4 className="font-bold text-[#04806b]">{cmd.name}</h4>
                    <p className="text-gray-600 text-sm">{cmd.description}</p>
                    <code className="block bg-emerald-50 p-2 my-2 rounded">{cmd.command}</code>
                    <button
                      onClick={() => executeCommand(cmd.command)}
                      className="bg-[#04806b] text-white px-4 py-2 rounded hover:bg-emerald-700 transition"
                    >
                      Execute
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 text-[#04806b]">Command Output</h3>
              <pre className="bg-black/80 text-green-400 p-4 rounded-xl h-[400px] overflow-auto border border-[#04806b]/30">
                {output || 'No output yet'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Commands;