import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export default function SARAAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am SARA-AI, your Autonomous Recovery Assistant powered by Groq high-speed inference. Ask me anything about lost item recovery, satellite search stages, or ownership verification!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.getAIStatus()
      .then(res => {
        if (res.success) setAiStatus(res);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setLoading(true);

    try {
      // Send last 6 messages
      const apiHistory = newHistory.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await api.askAIChat(text.trim(), apiHistory);
      if (res.success && res.data?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Autonomous Recovery Assistant is active. Please check the dashboard missions.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection temporarily interrupted. AI failover pipeline active.' }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'How does SARA narrow search perimeters?',
    'What private clues should I register?',
    'How does Level 3 Ground Vision work?'
  ];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1050 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary d-flex align-items-center gap-2 shadow-lg px-3 py-2 rounded-pill font-mono"
          style={{
            background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 24px rgba(13, 110, 253, 0.45)',
            fontSize: '0.85rem'
          }}
        >
          <span className="spinner-grow spinner-grow-sm text-info" role="status" style={{ width: '0.65rem', height: '0.65rem' }}></span>
          <i className="bi bi-robot"></i>
          <span className="fw-semibold">SARA AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          className="card shadow-2xl rounded-4 text-light border border-secondary border-opacity-25 d-flex flex-column"
          style={{
            width: '360px',
            height: '480px',
            background: 'rgba(11, 15, 25, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)'
          }}
        >
          {/* Header */}
          <div className="card-header bg-dark bg-opacity-75 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-2 px-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-20 text-info"
                style={{ width: '28px', height: '28px' }}
              >
                <i className="bi bi-cpu-fill" style={{ fontSize: '0.9rem' }}></i>
              </div>
              <div>
                <div className="fw-bold font-mono" style={{ fontSize: '0.85rem' }}>SARA-AI Engine</div>
                <div className="text-secondary font-mono" style={{ fontSize: '0.65rem' }}>
                  {aiStatus ? `Groq • ${aiStatus.model} (Failover Active)` : 'Groq High-Speed Inference'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-link text-secondary text-decoration-none p-1"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Messages Body */}
          <div className="card-body p-3 overflow-y-auto flex-grow-1 font-sans" style={{ fontSize: '0.82rem', maxHeight: '330px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`d-flex mb-2.5 ${m.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-2.5 rounded-3 ${
                    m.role === 'user'
                      ? 'bg-primary text-white ms-4'
                      : 'bg-dark bg-opacity-80 text-light border border-secondary border-opacity-25 me-4'
                  }`}
                  style={{ wordBreak: 'break-word', lineHeight: '1.4' }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="d-flex justify-content-start mb-2">
                <div className="p-2 rounded-3 bg-dark bg-opacity-80 text-info border border-secondary border-opacity-25 d-flex align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span className="font-mono" style={{ fontSize: '0.75rem' }}>Groq AI thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1 border-top border-secondary border-opacity-10 d-flex gap-1 overflow-x-auto" style={{ whiteSpace: 'nowrap' }}>
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="btn btn-outline-secondary btn-sm rounded-pill font-mono text-truncate"
                style={{ fontSize: '0.65rem', padding: '2px 8px', maxWidth: '160px' }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="card-footer bg-dark bg-opacity-50 border-top border-secondary border-opacity-25 p-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="d-flex gap-2"
            >
              <input
                type="text"
                className="form-control form-control-sm bg-black border-secondary border-opacity-50 text-light"
                placeholder="Ask SARA-AI anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                style={{ fontSize: '0.8rem' }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm px-3"
                disabled={loading || !inputValue.trim()}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
