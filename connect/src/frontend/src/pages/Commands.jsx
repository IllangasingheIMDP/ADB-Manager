import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCommands, addCommand } from '../components/commands';
import { useNavigate } from 'react-router-dom';
function Commands() {
    const navigate = useNavigate();
  const { deviceId } = useParams();
  const [commands, setCommands] = useState([]);
  const [newCommand, setNewCommand] = useState({ name: '', command: '', description: '' });
  const [output, setOutput] = useState('');

  useEffect(() => {
    setCommands(getCommands());
  }, []);

  const handleAddCommand = (e) => {
    e.preventDefault();
    const added = addCommand(newCommand);
    if (added) {
      setCommands(getCommands());
      setNewCommand({ name: '', command: '', description: '' });
    }
  };

  const executeCommand = async (command) => {
    try {
      const result = await window.electronAPI.adbShell(deviceId, command);
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shell Commands for Device: {deviceId}</h2>
      <button className='text-xl bg-blue-300 p-4 rounded-3xl r-0 border-b-2' onClick={() => navigate('/')}>Back</button>
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="text-xl font-bold mb-3">Add New Command</h3>
        <form onSubmit={handleAddCommand} className="space-y-3">
          <input
            type="text"
            placeholder="Command Name"
            value={newCommand.name}
            onChange={(e) => setNewCommand({...newCommand, name: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Shell Command"
            value={newCommand.command}
            onChange={(e) => setNewCommand({...newCommand, command: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newCommand.description}
            onChange={(e) => setNewCommand({...newCommand, description: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
            Add Command
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-bold mb-3">Saved Commands</h3>
          <div className="space-y-2">
            {commands.map((cmd) => (
              <div key={cmd.id} className="bg-white p-4 rounded shadow">
                <h4 className="font-bold">{cmd.name}</h4>
                <p className="text-gray-600 text-sm">{cmd.description}</p>
                <code className="block bg-gray-100 p-2 my-2">{cmd.command}</code>
                <button
                  onClick={() => executeCommand(cmd.command)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Execute
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">Command Output</h3>
          <pre className="bg-black text-green-400 p-4 rounded h-[400px] overflow-auto">
            {output || 'No output yet'}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Commands;