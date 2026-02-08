
import React, { useState, useRef, useEffect } from 'react';
// import { aiService } from '../services/ai';

const LuxeConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'model', text: 'Welcome to LuxeDrive. I am your personal automotive concierge. How may I assist your journey today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // const response = await aiService.getConciergeResponse(input, messages);
    
    setIsTyping(false);
    // setMessages(prev => [...prev, { role: 'model', text: response || '' }]);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 gold-bg rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-all duration-300"
      >
        {isOpen ? (
          <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
             <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] h-[550px] glass rounded-sm shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
              <h4 className="text-sm font-bold gold-text uppercase tracking-widest">Luxe Concierge</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Powered by Gemini Intelligence</p>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-grow p-6 overflow-y-auto space-y-6 no-scrollbar bg-black/20"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 text-xs leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-white/10 border border-white/10 rounded-tl-xl rounded-tr-xl rounded-bl-xl' 
                  : 'bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-tl-xl rounded-tr-xl rounded-br-xl'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 p-4 rounded-xl flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-black/40 border-t border-white/10">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about a vehicle or event..."
                className="w-full bg-white/5 border border-white/10 py-3 px-4 pr-12 text-xs focus:outline-none focus:border-[#d4af37] text-white"
              />
              <button 
                onClick={handleSend}
                className="absolute right-3 top-2.5 text-[#d4af37] hover:scale-110 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <p className="text-[8px] text-center text-white/20 mt-3 uppercase tracking-widest">AI may provide simulated availability and details</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuxeConcierge;
