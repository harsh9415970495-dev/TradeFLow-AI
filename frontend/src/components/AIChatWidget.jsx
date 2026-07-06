import React, { useState } from 'react';
import axios from 'axios';
import { Brain, X, MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am TradeFlow AI, your personalized assistant. Ask me about your portfolio, balance, or general trading strategies!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedQuestions = [
    { label: "My Portfolio Status", action: "How is my portfolio doing today?" },
    { label: "Check Cash Balance", action: "What is my current cash balance?" },
    { label: "Recent Orders", action: "What were my last few orders?" }
  ];

  const handleSend = async (text, action = null) => {
    const userText = action || text || input;
    if (!userText.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/ai/chat`, { message: userText });
      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: res.data.data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: "I couldn't process that right now." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: 'bot', text: "Sorry, I ran into an issue connecting to the AI analytics server. Please make sure the backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200"
        >
          <Brain className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 h-[480px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden fade-in">
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-zinc-100 flex items-center gap-1.5">
                  TradeFlow AI
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </h3>
                <span className="text-[10px] text-zinc-500">Autonomous Assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-850 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] text-xs ${
                  msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white font-semibold' : 'bg-zinc-800 text-indigo-400'
                }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`p-3 rounded-2xl whitespace-pre-line leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-zinc-800 text-zinc-300 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[80%] self-start">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-zinc-800/60 p-3 rounded-2xl rounded-tl-none text-zinc-500 text-xs flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Predefined prompts */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-zinc-850/60 bg-zinc-950/20">
              {predefinedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.label, q.action)}
                  className="text-[10px] bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 px-2 py-1 rounded-lg border border-zinc-750 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-zinc-850 bg-zinc-950/40 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask TradeFlow AI..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
