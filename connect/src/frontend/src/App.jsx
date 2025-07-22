import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DeviceList from './components/DeviceList';
import ConnectDevice from './components/ConnectDevice';
import ChatBot from './components/ChatBot';
import Commands from './pages/Commands';
import FileExplorer from './pages/FileExplorer';
import Device from './pages/Device';
import Background from './components/Background';
import { NotificationProvider } from './components/NotificationProvider';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
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
      <NotificationProvider>
        <HashRouter>
          <Background>
          
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent mt-10 mb-8 tracking-wider drop-shadow-lg font-custom"
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
          
          {/* Chatbot - appears on all pages */}
          <ChatBot />
        </Background>
      </HashRouter>
    </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;