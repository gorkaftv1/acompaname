'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import { Card } from '@/components/ui/Card';
import { Textarea, Button } from '@/components/ui';
import { ChatService } from '@/lib/services/chat.service';
import { EmotionType } from '@/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  emotion?: EmotionType;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('calm');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll only the messages area (not the page)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const loadChatHistory = async () => {
    setIsLoadingHistory(true);

    try {
      const result = await ChatService.getChatHistory({ limit: 100 });

      if (result.success && result.messages) {
        const chatMessages: ChatMessage[] = result.messages
          .map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            emotion: msg.emotion || undefined,
          }));

        setMessages(chatMessages);

        // Set emotion based on last message
        const lastAssistantMessage = chatMessages
          .filter(m => m.role === 'assistant' && m.emotion)
          .pop();

        if (lastAssistantMessage?.emotion) {
          setCurrentEmotion(lastAssistantMessage.emotion);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    const tempUserId = `temp-${Date.now()}`;

    // Add user message immediately to UI for instant feedback
    const userMessage: ChatMessage = {
      id: tempUserId,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message and get AI response
      const result = await ChatService.sendMessage({
        content: messageContent,
        emotion: currentEmotion,
      });

      if (!result.success) {
        console.error('Error sending message:', result.error);
        // Remove temporary user message and restore input
        setMessages((prev) => prev.filter(msg => msg.id !== tempUserId));
        setInputValue(messageContent);
        return;
      }

      // Update user message with real ID from DB
      if (result.userMessage) {
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === tempUserId
              ? {
                ...msg,
                id: result.userMessage!.id,
                timestamp: new Date(result.userMessage!.createdAt),
              }
              : msg
          )
        );
      }

      // Add AI response
      if (result.aiMessage) {
        const aiMessage: ChatMessage = {
          id: result.aiMessage.id,
          role: 'assistant',
          content: result.aiMessage.content,
          timestamp: new Date(result.aiMessage.createdAt),
          emotion: result.aiMessage.emotion || undefined,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Update current emotion based on AI response
        if (result.aiMessage.emotion) {
          console.log('🎨 Actualizando emoción del blob:', {
            anterior: currentEmotion,
            nueva: result.aiMessage.emotion
          });
          setCurrentEmotion(result.aiMessage.emotion);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temporary message and restore input
      setMessages((prev) => prev.filter(msg => msg.id !== tempUserId));
      setInputValue(messageContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="flex-shrink-0">
          <EmotionalCompanion
            size={200}
            emotion={currentEmotion}
            animated={true}
            intensity="medium"
          />
        </div>
        <div className="flex-1 text-center sm:text-right">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2C5F7C] mb-2">
            Tu Compañero de IA
          </h1>
          <p className="text-gray-600">
            Estoy aquí para escucharte
          </p>
        </div>

      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-[#F5F3EF] rounded-lg shadow-md border border-gray-200"
      >
        <Card className="p-0 overflow-hidden border-0 shadow-none">
          <div className="flex flex-col h-[70vh] min-h-[600px] md:h-[600px]">
            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <p className="text-gray-500">
                    Comienza la conversación contándome cómo te sientes
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      <div
                        className={`flex flex-col max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'
                          }`}
                      >
                        <div
                          className={`px-4 py-3 ${message.role === 'user'
                              ? 'bg-[#4A9B9B] text-white rounded-2xl rounded-br-sm'
                              : 'bg-[#A8C5B5]/20 text-[#2C5F7C] rounded-2xl rounded-bl-sm'
                            }`}
                        >
                          <p className="text-base leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#A8C5B5]/20 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex space-x-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-[#4A9B9B] rounded-full"
                          animate={{
                            y: [0, -8, 0],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  rows={2}
                  className="flex-1 resize-none"
                  aria-label="Mensaje para el compañero IA"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  variant="primary"
                  className="px-6"
                  aria-label="Enviar mensaje"
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar</span>
                  </motion.div>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
