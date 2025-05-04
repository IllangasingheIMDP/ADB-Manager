import DeviceList from './components/DeviceList';
import ConnectDevice from './components/ConnectDevice';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">ADB Manager</h1>
      <div className="w-full max-w-md">
        <ConnectDevice />
      </div>
      <div className="w-full max-w-md mt-8">
        <DeviceList />
      </div>
    </div>
  );
}

export default App;