import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCommands, addCommand } from '../components/commands';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { getErrorMessage, getSuccessMessage } from '../utils/errorHandler';
import { FiArrowLeft, FiPlus, FiPlay, FiTerminal } from 'react-icons/fi';

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
    
      <div className="w-full max-w-4xl rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-lg relative overflow-hidden">
        <div
          className="absolute inset-0 bg-emerald-900/20 rounded-2xl"
          style={{ backdropFilter: 'blur(12px)' }}
        ></div>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#029078] via-white text-transparent bg-clip-text"
              style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
              Shell Commands for Device: <span className="text-emerald-300">{deviceId}</span>
            </h2>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition backdrop-blur-sm border border-emerald-400/30"
              onClick={() => navigate(-1)}
            >
              <FiArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
          <div className="mb-8 rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-md relative overflow-hidden">
            <div
              className="absolute inset-0 bg-emerald-900/10 rounded-2xl"
              style={{ backdropFilter: 'blur(12px)' }}
            ></div>
            <div className="relative z-10 p-6">
              <h3 className="text-xl font-bold mb-4 text-emerald-100 flex items-center gap-2">
                <FiPlus className="w-5 h-5" /> Add New Command
              </h3>
              <form onSubmit={handleAddCommand} className="space-y-4">
                <input
                  type="text"
                  placeholder="Command Name"
                  value={newCommand.name}
                  onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
                  className="w-full p-3 border border-emerald-400/40 rounded-2xl bg-emerald-900/10 text-emerald-100 placeholder-emerald-300/70 focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Shell Command"
                  value={newCommand.command}
                  onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
                  className="w-full p-3 border border-emerald-400/40 rounded-2xl bg-emerald-900/10 text-emerald-100 placeholder-emerald-300/70 focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCommand.description}
                  onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                  className="w-full p-3 border border-emerald-400/40 rounded-2xl bg-emerald-900/10 text-emerald-100 placeholder-emerald-300/70 focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  required
                />
                <button
                  type="submit"
                  className="relative w-full p-4 rounded-2xl border border-emerald-400/40 text-emerald-100 font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-emerald-800/20 overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 bg-emerald-600/20 rounded-2xl"
                    style={{ backdropFilter: 'blur(12px)' }}
                  ></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <FiPlus className="w-4 h-4" /> Add Command
                  </span>
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-emerald-100 flex items-center gap-2">
                <FiTerminal className="w-5 h-5" /> Saved Commands
              </h3>
              <div className="space-y-4">
                {commands.map((cmd) => (
                  <div key={cmd.id} className="rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-md relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-emerald-900/10 rounded-2xl"
                      style={{ backdropFilter: 'blur(12px)' }}
                    ></div>
                    <div className="relative z-10 p-4">
                      <h4 className="font-bold text-emerald-100 mb-2">{cmd.name}</h4>
                      <p className="text-emerald-300/80 text-sm mb-3">{cmd.description}</p>
                      <code className="block bg-emerald-950/50 text-emerald-200 p-3 my-3 rounded-xl border border-emerald-400/30 backdrop-blur-sm font-mono text-sm">
                        {cmd.command}
                      </code>
                      <button
                        onClick={() => executeCommand(cmd.command)}
                        className="relative px-4 py-2 rounded-xl border border-emerald-400/40 text-emerald-100 font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-emerald-800/20 overflow-hidden"
                      >
                        <div 
                          className="absolute inset-0 bg-emerald-600/20 rounded-xl"
                          style={{ backdropFilter: 'blur(12px)' }}
                        ></div>
                        <span className="relative z-10 flex items-center gap-2">
                          <FiPlay className="w-4 h-4" /> Execute
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-emerald-100 flex items-center gap-2">
                <FiTerminal className="w-5 h-5" /> Command Output
              </h3>
              <div className="rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-md relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-black/90 rounded-2xl"
                  style={{ backdropFilter: 'blur(16px)' }}
                ></div>
                <pre className="relative z-10 text-emerald-200 p-4 h-[400px] overflow-auto font-mono text-sm">
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