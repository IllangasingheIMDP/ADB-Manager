import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DeviceList from './components/DeviceList';
import ConnectDevice from './components/ConnectDevice';
import Commands from './pages/Commands';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h1 className="text-4xl font-bold text-blue-600 mb-8">ADB Manager</h1>
          <Routes>
            <Route path="/" element={
              <>
                <div className="w-full max-w-md">
                  <ConnectDevice />
                </div>
                <div className="w-full max-w-md mt-8">
                  <DeviceList />
                </div>
              </>
            } />
            <Route path="/commands/:deviceId" element={<Commands />} />
          </Routes>
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;