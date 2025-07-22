import React, { useState, useRef, useEffect } from 'react';

// Import the chatbot image
import chatbotIcon from '/chatbot.png';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your ADB assistant. Ask me anything about ADB commands, device management, troubleshooting, or screen mirroring with scrcpy.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSize, setChatSize] = useState({ width: 400, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const resizeRef = useRef(null);

  // Add custom styles for scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .hide-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }
      .hide-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(4, 128, 107, 0.6);
        border-radius: 3px;
      }
      .hide-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(4, 128, 107, 0.8);
      }
      .message-content {
        word-wrap: break-word;
        overflow-wrap: break-word;
        line-height: 1.5;
      }
      .message-content pre {
        max-width: 100%;
        overflow-x: auto;
      }
      .markdown-content {
        line-height: 1.6;
      }
      .markdown-content h3 {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
      .markdown-content h3:first-child {
        margin-top: 0;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle copying message to clipboard
  const handleCopyMessage = async (messageText, messageId) => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedMessageId(messageId);
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = messageText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedMessageId(messageId);
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Format message text with proper markdown formatting
  const formatMessage = (text) => {
    // Split by code blocks (triple backticks) first
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const code = part.slice(3, -3).trim();
        return (
          <div key={index} className="my-3">
            <div className="bg-black/30 rounded-md p-3 font-mono text-sm border border-white/20">
              <pre className="whitespace-pre-wrap break-all">{code}</pre>
            </div>
          </div>
        );
      } else {
        // Process markdown formatting for regular text
        return (
          <div key={index} className="markdown-content">
            {formatMarkdownText(part)}
          </div>
        );
      }
    });
  };

  // Helper function to format markdown text
  const formatMarkdownText = (text) => {
    // Split text into lines to handle headers and lists properly
    const lines = text.split('\n');
    const elements = [];
    let currentElement = [];
    let inList = false;

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Handle headers
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
        // Flush current element
        if (currentElement.length > 0) {
          elements.push(
            <div key={`text-${elements.length}`} className="mb-2">
              {formatInlineMarkdown(currentElement.join('\n'))}
            </div>
          );
          currentElement = [];
        }
        
        const headerText = trimmedLine.slice(2, -2).trim();
        elements.push(
          <h3 key={`header-${lineIndex}`} className="text-lg font-bold text-emerald-300 mb-2 mt-4 first:mt-0">
            {headerText}
          </h3>
        );
        inList = false;
      }
      // Handle section dividers (===== or -----)
      else if (trimmedLine.match(/^[=-]{5,}$/)) {
        // Flush current element
        if (currentElement.length > 0) {
          elements.push(
            <div key={`text-${elements.length}`} className="mb-2">
              {formatInlineMarkdown(currentElement.join('\n'))}
            </div>
          );
          currentElement = [];
        }
        
        elements.push(
          <hr key={`divider-${lineIndex}`} className="border-white/20 my-3" />
        );
        inList = false;
      }
      // Handle bullet points
      else if (trimmedLine.startsWith('* ')) {
        // Flush current element if not already in a list
        if (currentElement.length > 0 && !inList) {
          elements.push(
            <div key={`text-${elements.length}`} className="mb-2">
              {formatInlineMarkdown(currentElement.join('\n'))}
            </div>
          );
          currentElement = [];
        }
        
        const listItem = trimmedLine.slice(2).trim();
        elements.push(
          <div key={`bullet-${lineIndex}`} className="flex items-start mb-1 ml-4">
            <span className="text-emerald-400 mr-2 mt-1 text-xs">•</span>
            <span>{formatInlineMarkdown(listItem)}</span>
          </div>
        );
        inList = true;
      }
      // Handle numbered steps
      else if (trimmedLine.match(/^\d+\.\s+/)) {
        // Flush current element if not already in a list
        if (currentElement.length > 0 && !inList) {
          elements.push(
            <div key={`text-${elements.length}`} className="mb-2">
              {formatInlineMarkdown(currentElement.join('\n'))}
            </div>
          );
          currentElement = [];
        }
        
        const match = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
        if (match) {
          const [, number, content] = match;
          elements.push(
            <div key={`number-${lineIndex}`} className="flex items-start mb-2 ml-4">
              <span className="text-emerald-400 mr-3 mt-0.5 font-semibold text-sm min-w-[20px]">
                {number}.
              </span>
              <span>{formatInlineMarkdown(content)}</span>
            </div>
          );
        }
        inList = true;
      }
      // Empty line - flush current element
      else if (trimmedLine === '') {
        if (currentElement.length > 0) {
          elements.push(
            <div key={`text-${elements.length}`} className="mb-2">
              {formatInlineMarkdown(currentElement.join('\n'))}
            </div>
          );
          currentElement = [];
        }
        inList = false;
      }
      // Regular text
      else {
        currentElement.push(line);
        inList = false;
      }
    });

    // Flush any remaining content
    if (currentElement.length > 0) {
      elements.push(
        <div key={`text-${elements.length}`} className="mb-2">
          {formatInlineMarkdown(currentElement.join('\n'))}
        </div>
      );
    }

    return elements;
  };

  // Helper function to format inline markdown (bold, italic, code)
  const formatInlineMarkdown = (text) => {
    // Handle inline code first
    const parts = text.split(/(`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <span 
            key={index} 
            className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono border border-white/10 mx-0.5"
          >
            {part.slice(1, -1)}
          </span>
        );
      } else {
        // Handle bold text (**text**)
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((boldPart, boldIndex) => {
          if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
            return (
              <strong key={`${index}-${boldIndex}`} className="font-semibold text-emerald-200">
                {boldPart.slice(2, -2)}
              </strong>
            );
          }
          return <span key={`${index}-${boldIndex}`}>{boldPart}</span>;
        });
      }
    });
  };

  // Resize functionality
  const handleResizeStart = (e) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = chatSize.width;
    const startHeight = chatSize.height;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(320, Math.min(800, startWidth + (e.clientX - startX)));
      const newHeight = Math.max(400, Math.min(700, startHeight + (e.clientY - startY)));
      setChatSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await window.electronAPI.chatbotAsk(inputValue);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${error.message || "Please try again."}`,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 font-custom2 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatRef}
          className="mb-4 rounded-2xl border border-white/20 shadow-emerald-800 shadow-lg relative overflow-hidden"
          style={{ 
            width: `${chatSize.width}px`, 
            height: `${chatSize.height}px`,
            minWidth: '320px',
            minHeight: '400px',
            maxWidth: '800px',
            maxHeight: '700px'
          }}
        >
          {/* Glassmorphism background */}
          <div
            className="absolute rounded-2xl inset-0 bg-emerald-800/10"
            style={{ backdropFilter: 'blur(15px)' }}
          ></div>
          
          {/* Resize handle */}
          <div
            ref={resizeRef}
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 opacity-50 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z"/>
            </svg>
          </div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Custom Icon Placeholder */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center">
                    {/* Replace this div with your custom icon */}
                    <img src={chatbotIcon} alt="AI Icon" className="w-5 h-5 bg-white/20 rounded-sm flex items-center justify-center" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">ADB Assistant</h3>
                    <p className="text-xs text-white/60">Expert help for ADB commands</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto hide-scrollbar">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-2' : 'mr-2'}`}>
                        {message.sender === 'user' ? (
                          <div className="w-7 h-7 rounded-full bg-[#04806b] flex items-center justify-center text-xs font-semibold text-white">
                            U
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden">
                            <img src={chatbotIcon} alt="AI Assistant" className="w-7 h-7 rounded-full" />
                          </div>
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div
                        className={`
                          p-3 rounded-2xl text-sm leading-relaxed
                          ${message.sender === 'user'
                            ? 'bg-[#04806b] text-white rounded-br-md'
                            : 'bg-black/30 text-white rounded-bl-md border border-white/10'
                          }
                        `}
                        style={message.sender === 'bot' ? { backdropFilter: 'blur(8px)' } : {}}
                      >
                        <div className="message-content">
                          {formatMessage(message.text)}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs opacity-60">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.sender === 'bot' && (
                            <button 
                              onClick={() => handleCopyMessage(message.text, message.id)}
                              className="text-xs opacity-60 hover:opacity-100 transition-all p-1 rounded hover:bg-white/10 flex items-center gap-1"
                              title={copiedMessageId === message.id ? "Copied!" : "Copy message"}
                            >
                              {copiedMessageId === message.id ? (
                                <>
                                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                  </svg>
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex flex-row">
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden">
                          <img src={chatbotIcon} alt="AI Assistant" className="w-7 h-7 rounded-full object-cover" />
                        </div>
                      </div>
                      <div className="bg-white/20 text-white p-4 rounded-2xl rounded-bl-md border border-white/10 max-w-[85%]"
                           style={{ backdropFilter: 'blur(8px)' }}>
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-emerald-300">Analyzing your request...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about ADB commands, troubleshooting, or device management..."
                  className="flex-1 px-4 py-3 bg-white/20 border border-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  style={{ backdropFilter: 'blur(8px)' }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-3 bg-[#04806b] text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-transparent rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {isOpen ? (
          <svg className="w-12 h-12 p-2 bg-gradient-to-br from-[#04806b] to-emerald-700 rounded-4xl transition-transform  duration-200" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="relative">
            {/* Custom Icon Placeholder - Replace this div with your custom icon */}
            <img src={chatbotIcon} alt="AI Icon" className="w-16 h-16 rounded-lg" />
            {/* Notification dot for new features */}
             </div>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
