'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [username, setUsername] = useState('Stays');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
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
      const res = await fetch(`${process.env.BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      if (!res.ok) throw new Error(res.statusText);
      const { reply } = await res.json();
      setMessages(prev => [...prev, { sender: 'Bot', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'Bot', text: 'Oops, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Where to next?</h2>
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Clear Chat
        </button>
      </div>

      <div className="border border-gray-300 rounded-lg h-96 overflow-y-auto p-4 bg-gray-50 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex ${m.sender === username ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`px-4 py-2 rounded-lg max-w-[70%] ${
                m.sender === username
                  ? 'bg-[rgb(255,56,92)] text-white'
                  : 'bg-white text-gray-800 border'
              }`}>
              <span className="block text-sm font-medium mb-1">{m.sender}</span>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-[rgb(255,56,92)] text-white rounded-lg hover:bg-[rgb(255,56,92)/0.9] transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading
            ? '…'
            : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2"
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

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Try:</h3>
        <div className="flex gap-2">
          {["Best view in hawaii?"].map((p, idx) => (
            <button
              key={idx}
              onClick={() => setInput(p)}
              className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}