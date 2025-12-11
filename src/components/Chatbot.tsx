import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, sendChatMessage } from '../services/chatbot';
import '../styles/Chatbot.css';

/**
 * تنسيق محتوى الرسالة بشكل احترافي
 */
const formatMessageContent = (content: string) => {
  // تنظيف النص من الرموز المزعجة
  let cleanContent = content
    // إزالة ## و # من العناوين
    .replace(/^###?\s*/gm, '')
    // إزالة ** من النص الغامق
    .replace(/\*\*/g, '')
    // إزالة الرموز الغريبة
    .replace(/[✅❌🔴🟡🟢📎💡⚠️]/g, '')
    // تنظيف المسافات الزائدة
    .replace(/\n{3,}/g, '\n\n');

  const lines = cleanContent.split('\n');

  return lines.map((line, i) => {
    const trimmedLine = line.trim();

    // سطر فارغ للتنفس
    if (!trimmedLine) {
      return <div key={i} className="msg-space" />;
    }

    // عنوان رئيسي (يبدأ بحرف كبير وينتهي بـ :)
    if (trimmedLine.endsWith(':') && trimmedLine.length < 60) {
      return (
        <div key={i} className="msg-section-title">
          {trimmedLine}
        </div>
      );
    }

    // نقطة في قائمة (يبدأ بـ • أو - أو *)
    if (/^[•\-\*]\s/.test(trimmedLine)) {
      return (
        <div key={i} className="msg-bullet">
          <span className="bullet-point">•</span>
          <span className="bullet-text">{trimmedLine.replace(/^[•\-\*]\s/, '')}</span>
        </div>
      );
    }

    // رقم في قائمة (يبدأ برقم ونقطة)
    if (/^\d+\.\s/.test(trimmedLine)) {
      const [num, ...rest] = trimmedLine.split(/\.\s/);
      return (
        <div key={i} className="msg-numbered">
          <span className="number-label">{num}</span>
          <span className="number-text">{rest.join('. ')}</span>
        </div>
      );
    }

    // نص عادي
    return (
      <div key={i} className="msg-paragraph">
        {trimmedLine}
      </div>
    );
  });
};

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'مرحباً! كيف أقدر أساعدك اليوم؟\n\nتقدر تسألني عن:\n• الاعتراضات المرورية وكيفية تقديمها\n• القوانين والأنظمة\n• أي استفسار يخص الخدمة',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get bot response
      const botReply = await sendChatMessage(userMessage.content, messages);

      const botMessage: ChatMessage = {
        role: 'assistant',
        content: botReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('خطأ في الشات بوت:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '⚠️ عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'كيف أقدم اعتراض؟',
    'ما هي القوانين المتاحة؟',
    'كيف تتم المراجعة؟',
    'متى أستلم الرد؟',
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="فتح المساعد الذكي"
        >
          <span className="chatbot-badge">مساعد موجز+</span>
          <span className="chatbot-icon">⚡</span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">⚡</div>
              <div className="chatbot-header-text">
                <h3>مساعد موجز+</h3>
                <p className="chatbot-status">
                  <span className="status-dot"></span>
                  متصل الآن
                </p>
              </div>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="message-avatar">⚡</div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    {formatMessageContent(msg.content)}
                  </div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message bot-message">
                <div className="message-avatar">⚡</div>
                <div className="message-content">
                  <div className="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="chatbot-quick-questions">
              <p className="quick-questions-title">أسئلة شائعة:</p>
              <div className="quick-questions-grid">
                {quickQuestions.map((q, index) => (
                  <button
                    key={index}
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-container">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="اكتب سؤالك هنا..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={isLoading}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              aria-label="إرسال"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 11L12 6L17 11M12 18V7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="chatbot-footer">
            <p> مُوجَز + AI - فريق صف</p>
          </div>
        </div>
      )}
    </>
  );
};
