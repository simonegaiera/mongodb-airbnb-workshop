'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import ExerciseStatus from '../../components/ExerciseStatus';

export default function Home() {
  const [username, setUsername] = useState('Stays');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Function to generate a unique session ID
  const generateSessionId = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${randomString}`;
  };

  // Function to convert property IDs to links
  const formatMessageWithLinks = (text) => {
    const propertyIdRegex = /Property ID:\s*([a-zA-Z0-9]+)/gi;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    return text.replace(propertyIdRegex, (match, id) => {
      return `Property ID: [${id}](${baseUrl}/rooms?id=${id})`;
    });
  };

  // Custom markdown components to override typography plugin defaults
  const markdownComponents = {
    // Custom link styling to match your design
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-medium"
      >
        {children}
      </a>
    ),
    // Ensure headings work well in chat bubbles
    h1: ({ children }) => (
      <h1 className="text-lg font-bold mb-2 mt-1">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold mb-2 mt-1">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-medium mb-1 mt-1">{children}</h3>
    ),
    // Better paragraph spacing for chat
    p: ({ children }) => (
      <p className="mb-2 last:mb-0">{children}</p>
    ),
    // Better list styling
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
    ),
  };

  // Initialize username and session ID on component mount
  useEffect(() => {
    // Generate initial session ID
    const initialSessionId = generateSessionId();
    setSessionId(initialSessionId);

    // Fetch username
    fetch(`${process.env.BASE_URL}/api/results/whoami`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setUsername(data.name))
      .catch(error => {
        console.error('Error fetching username:', error);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: username, text: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: input, 
            sessionId: sessionId,
            username: username
        })
      });
      if (!response.ok) throw new Error(response.statusText);
      const { reply } = await response.json();
      setMessages(prev => [...prev, { sender: 'Bot', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'Bot', text: 'Oops, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      // Start a new session instead of clearing history
      const response = await fetch(`${process.env.BASE_URL}/api/chat/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: sessionId,
          username: username 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Use the new session ID from server response, or generate a new one
        const newSessionId = data.newSessionId || generateSessionId();
        setSessionId(newSessionId);
        console.log(`Started new session: ${newSessionId}`);
      } else {
        // If server call fails, still generate a new session ID
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        console.log(`Generated new session (fallback): ${newSessionId}`);
      }
      
      // Clear frontend messages
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
      // Still clear frontend messages and generate new session ID
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      setMessages([]);
      console.log(`Generated new session (error fallback): ${newSessionId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 font-sans">
      <div className="flex flex-wrap gap-4 px-4 py-4">
        <ExerciseStatus exerciseName="vector-search-index" />
        <ExerciseStatus exerciseName="vector-search-1" />
      </div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Where to next?</h2>
          <p className="text-xs text-gray-500 mt-1">
            Session: {sessionId.substring(0, 20)}...
          </p>
        </div>
        <button
          onClick={handleClear}
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Clear Chat
        </button>
      </div>

      <div className="border border-gray-300 rounded-lg h-[60vh] overflow-y-auto p-4 bg-gray-50 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex ${m.sender === username ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`px-4 py-3 rounded-lg max-w-[85%] ${
                m.sender === username
                  ? 'bg-[rgb(255,56,92)] text-white'
                  : 'bg-white text-gray-800 border shadow-sm'
              }`}>
              <span className="block text-xs font-medium mb-2 opacity-75">{m.sender}</span>
              <div className="text-sm">
                {m.sender === 'Bot' ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-current prose-p:text-current prose-strong:text-current prose-a:text-blue-600 prose-ul:text-current prose-ol:text-current">
                    <ReactMarkdown components={markdownComponents}>
                      {formatMessageWithLinks(m.text)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-3 flex justify-start">
            <div className="px-4 py-2 rounded-lg bg-white text-gray-800 border shadow-sm">
              <span className="block text-xs font-medium mb-1">Bot</span>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-[rgb(255,56,92)] text-white rounded-lg hover:bg-[rgb(255,56,92)/0.9] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
        >
          {loading
            ? '…'
            : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                  />
                </svg>
                Send
              </>
            )}
        </button>
      </form>

      <div>
        <h3 className="text-sm font-medium mb-2">Try:</h3>
        <div className="flex gap-2 flex-wrap">
          {[
            "Best view in hawaii?",
            "Find me a clean place with good reviews",
            "What properties are near the beach?"
          ].map((p, idx) => (
            <button
              key={idx}
              onClick={() => setInput(p)}
              className="px-3 py-1 border border-gray-300 rounded-full text-xs hover:bg-gray-100 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
