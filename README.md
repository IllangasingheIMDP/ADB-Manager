# ADB Manager

ADB Manager is a modern Electron-based desktop application that provides a beautiful, intuitive interface for managing Android devices via ADB (Android Debug Bridge). The application features a glassmorphism-inspired UI design with smooth transitions and offers comprehensive device management capabilities for both WiFi and USB connected Android devices.

## 🎯 Project Overview

This full-stack desktop application demonstrates modern development practices and clean architecture, combining the power of Electron with React's component-based architecture to create a seamless Android device management experience.

## ✨ Key Features

### Device Management
- **Multi-connection Support**: Connect to Android devices via WiFi or USB with automated TCP/IP mode switching
- **Real-time Device Monitoring**: Live device status tracking with automatic refresh intervals
- **Smart Reconnection**: Intelligent device reconnection with fallback mechanisms
- **Device Information Display**: View detailed device specs including model, Android version, and manufacturer

### File Operations
- **File Explorer**: Browse device file system with intuitive navigation
- **File Transfer**: Download files from device to PC and upload files to device storage
- **Batch Operations**: Support for multiple file operations

### Advanced Features
- **Shell Command Execution**: Execute custom ADB shell commands with saved command presets
- **Audio Streaming**: Stream device audio to PC using scrcpy integration
- **Screen Mirroring**: Mirror device screen for debugging and presentation (scrcpy integration)
- **Command History**: Save and reuse frequently used ADB commands

### User Experience
- **Modern UI/UX**: Glassmorphism design with backdrop blur effects and smooth animations
- **Responsive Design**: Optimized for different screen sizes and resolutions
- **Error Handling**: Comprehensive error handling with user-friendly feedback
- **Background Processing**: Non-blocking operations for seamless user experience

## 🛠️ Technologies Used

### Frontend Stack
- **React 19**: Modern component-based UI library with latest features
- **Vite**: Fast build tool and development server
- **Tailwind CSS 4.1.5**: Utility-first CSS framework for rapid styling
- **React Router DOM**: Client-side routing for single-page application navigation
- **PostCSS & Autoprefixer**: CSS processing and browser compatibility

### Desktop Framework
- **Electron 25.9.8**: Cross-platform desktop application framework
- **IPC Communication**: Secure communication between main and renderer processes
- **Process Management**: Background process handling for audio/video streaming

### Backend & APIs
- **Node.js**: JavaScript runtime for backend operations
- **Express.js 5.1.0**: Web application framework for API endpoints
- **SQLite3**: Lightweight database for local data storage
- **ADB (Android Debug Bridge)**: Command-line tool for Android device communication
- **scrcpy**: Screen mirroring and audio streaming utility

### Development Tools
- **ESLint**: Code linting and style enforcement
- **Electron Builder**: Application packaging and distribution
- **Concurrently**: Parallel script execution during development

## 🏗️ Architecture Highlights

### Application Architecture
- **Multi-process Architecture**: Separate main and renderer processes for security and performance
- **Component-based Design**: Modular React components for maintainability and reusability
- **Error Boundary Implementation**: Robust error handling with React Error Boundaries
- **Cross-platform Compatibility**: Built for Windows, macOS, and Linux

### Technical Implementation
- **Shell Command Integration**: Direct ADB command execution with comprehensive error handling
- **File System Integration**: Native file operations with OS-specific optimizations
- **Real-time Updates**: Automated device polling and status synchronization
- **Dynamic Path Resolution**: Smart binary path resolution for different platforms and build environments

### Security & Performance
- **Context Isolation**: Secure communication between processes
- **Resource Management**: Efficient memory and process management
- **Background Operations**: Non-blocking UI with background task processing

## 📸 Screenshots

![Main UI](image.png)

## ▶️ Demo

https://drive.google.com/file/d/1HXOIdp18AiDtgUeQJrNmLJw5rW7ZLkEC/view?usp=sharing

## 🎨 Design Features

- **Glassmorphism UI**: Modern design with backdrop blur effects and transparency
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Responsive Layout**: Adaptive design that works across different screen sizes
- **Color Scheme**: Emerald and teal color palette with gradient effects
- **Typography**: Clean, readable fonts with proper hierarchy

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [ADB](https://developer.android.com/tools/adb) installed and available in your system PATH

### Installation

1. **Clone the repository:**
   ```sh
   git https://github.com/IllangasingheIMDP/Connect.git
   cd connect
   ```
2. **Install dependencies:**
   ```sh
   npm install
   cd frontend/src
   npm install
   cd .. && cd ..
   ```
3. **Run the application:**
   ```sh
   npm start
   ```

## 📱 Usage Guide

### Initial Setup
1. Connect your Android device to your computer via USB or ensure it's on the same WiFi network
2. Enable **USB Debugging** on your Android device (Settings > Developer Options > USB Debugging)
3. Launch ADB Manager
4. Your device should appear in the device list. If not, click **Refresh**

### WiFi Connection
1. For WiFi connections, the app will automatically detect your device's IP address
2. Use the "Connect via WiFi" option in the interface
3. The app handles TCP/IP mode switching automatically

### Available Features
- **Device Management**: View device info, reconnect, and manage connections
- **File Operations**: Browse device storage, download/upload files
- **Shell Commands**: Execute custom ADB commands with saved presets
- **Media Streaming**: Stream audio and mirror screen (requires scrcpy)

## 🔧 Development Practices

### Code Quality
- **Modern JavaScript/ES6+**: Latest JavaScript features and syntax
- **Component Architecture**: Clean separation of concerns between UI and business logic
- **Consistent Styling**: ESLint configuration for code consistency
- **Error Handling**: Comprehensive error handling and user feedback systems

### Build & Development
- **Fast Development**: Vite for rapid development and hot module replacement
- **Optimized Builds**: Production-ready builds with proper optimization
- **Cross-platform Support**: Consistent behavior across different operating systems

## 🛠️ Troubleshooting

### Common Issues
- **ADB Not Found**: Ensure ADB is properly installed and available in your system PATH
- **Device Not Detected**: Try restarting the ADB server with `adb kill-server` followed by `adb start-server`
- **USB Connection Issues**: Ensure your device is unlocked and screen is on
- **WiFi Connection Problems**: Verify both devices are on the same network

### Resources
- Check [ADB documentation](https://developer.android.com/studio/command-line/adb) for more troubleshooting tips
- Ensure Developer Options and USB Debugging are enabled on your Android device
- For scrcpy issues, verify the binary is properly installed and accessible

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/YourFeature`
3. **Make your changes** with proper testing
4. **Follow coding standards**: Ensure your code adheres to the existing style and conventions
5. **Commit your changes**: `git commit -m 'Add some feature'`
6. **Push to the branch**: `git push origin feature/YourFeature`
7. **Submit a pull request** with a clear description of your changes

### Code Standards
- Follow existing code style and formatting
- Write clear, descriptive commit messages
- Test your changes thoroughly before submitting
- Update documentation when necessary

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author & Maintenance

**ADB Manager** is developed and maintained with ❤️ by [I.M.D.P.Illangasinghe](https://github.com/IllangasingheIMDP).

### Project Stats
- **Repository**: [ADB-Manager](https://github.com/IllangasingheIMDP/ADB-Manager)
- **Current Branch**: Device-page
- **Technologies**: Electron + React + Node.js
- **License**: MIT

---

*This project demonstrates modern desktop application development practices, combining cross-platform compatibility with beautiful UI design and robust functionality.*

