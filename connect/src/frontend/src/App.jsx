import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DeviceList from './components/DeviceList';
import ConnectDevice from './components/ConnectDevice';
import Commands from './pages/Commands';
import FileExplorer from './pages/FileExplorer';
import Device from './pages/Device';
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
        <div className="flex flex-col h-full w-full  items-center justify-center overflow-y-auto min-h-screen bg-[url('/home_bg.jpg')] bg-cover bg-top bg-no-repeat hide-scrollbar">
          <h1 className="text-4xl font-bold text-teal-600 mb-8 "

          >ADB Manager</h1>
          <Routes>
            <Route path="/" element={
              <>
                <div
                  className="w-full hover:scale-105 transition-transform duration-200 max-w-md rounded-2xl border border-white/20 shadow-emerald-800 shadow-md relative overflow-visible"
                >
                  <div
                    className="absolute rounded-2xl inset-0 bg-emerald-800/10"
                    style={{ backdropFilter: 'blur(8px)' }}
                  ></div>
                  <div className="relative z-10">
                    <ConnectDevice />
                  </div>
                </div>
                <div
                  className="w-full hover:scale-105 transition-transform duration-200 max-w-md rounded-2xl border border-white/20 shadow-emerald-800 shadow-md mt-16 relative overflow-vertical"
                >
                  <div
                    className="absolute rounded-2xl inset-0 bg-emerald-800/10"
                    style={{ backdropFilter: 'blur(15px)' }}
                  ></div>
                  <div className="relative z-10">
                    <DeviceList />
                  </div>
                </div>
              </>
            } />
            <Route path="/device/:deviceId" element={<Device />} />
            <Route path="/commands/:deviceId" element={<Commands />} />
            <Route path="/explorer/:deviceId" element={<FileExplorer />} />

          </Routes>
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;