import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { EVENTS } from '../constants/events';
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'bot' | 'user';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am your Rasayan 2026 assistant. How can I help you today? I can tell you about events, rules, and schedules.' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMsg } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = `You are the official Rasayan 2026 Fest Assistant. 
      Rasayan 2026 is a chemistry-themed festival with the theme "Panchtatva" (The Five Elements).
      
      EVENT KNOWLEDGE BASE:
      ${EVENTS.map(e => `
      - EVENT: ${e.name}
        CATEGORY: ${e.type}
        SUMMARY: ${e.description}
        RULES: ${e.rules.join('. ')}
        CONTACT: ${e.headName} (Phone: ${e.headPhone})
      `).join('\n')}

      FALLBACK CONTACT:
      - Fest Coordinator: Dr. Aryan Sharma (+91 98765 43210)

      CONSTRAINTS:
      1. Use only the provided information. 
      2. Format your response for readability using markdown (bolding, lists).
      3. **FALLBACK PROTOCOL**: If you are 100% unsure, or if the information is not in the knowledge base, DO NOT hallucinate. Instead, say exactly: "I don't have that specific information in my database, but I recommend contacting the event head for clarification:" followed by the relevant Head's name and phone number from the list above.
      4. If the query is about an event not listed, refer them to Dr. Aryan Sharma.
      5. Sound enthusiastic but professional, like a chemistry expert.
      `;

      const history = newMessages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.5,
        }
      });

      const botText = response.text || "I'm having a small catalytic failure in my logic. Please try again or contact Dr. Aryan Sharma at +91 98765 43210.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "The reaction failed! Please try again or call our coordinator Dr. Aryan Sharma at +91 98765 43210." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 sm:w-96 glass-card overflow-hidden rounded-3xl shadow-2xl flex flex-col h-[500px]"
          >
            <div className="bg-brand-primary p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-bold tracking-tight">Rasayan Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-paper" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-white text-brand-dark shadow-sm border border-brand-soft rounded-tl-none'
                  }`}>
                    <div className="prose prose-sm max-w-none prose-brand dark:prose-invert">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-brand-soft">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-brand-soft">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me something..."
                  className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 rounded-xl text-sm p-3"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-brand-primary text-white p-3 rounded-xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-brand-primary text-white p-4 rounded-full shadow-2xl shadow-brand-primary/40 flex items-center justify-center group"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </motion.button>
    </div>
  );
}
