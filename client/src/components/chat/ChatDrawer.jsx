import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../store/gameStore';
import { SOCKET_EVENTS } from '../../shared/socketEvents.js';

const ChatDrawer = ({ isOpen, onClose, roomCode: roomCodeProp }) => {
    const { socket } = useSocket();
    const { roomCode: storeRoomCode, user } = useGameStore();
    const roomCode = roomCodeProp || storeRoomCode;
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;
        
        const handleMessage = (msg) => {
            setMessages(prev => [...prev, msg]);
        };
        
        socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
        return () => socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, { roomCode, message: inputValue, user });
        setInputValue('');
    };

    const quickChats = ["Hurry up!", "Oops!", "Good luck!", "Nice move!", "😭", "😂"];

    const handleQuickChat = (text) => {
        socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, { roomCode, message: text, user });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-[85%] md:w-96 bg-clay-bg shadow-clay z-50 flex flex-col"
                    >
                        <div className="p-4 bg-clay-surface shadow-clay font-black text-clay-blue text-xl flex justify-between items-center rounded-bl-3xl">
                            <span>LOBBY CHAT</span>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-clay text-gray-400 hover:text-gray-600 font-bold flex justify-center items-center active:shadow-clay-pressed transition-all">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            <div className="text-center text-xs font-bold text-gray-400 bg-white/50 py-1 rounded-pill w-max mx-auto px-4 shadow-inner">Messages are ephemeral and not saved.</div>
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === user?.username ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-gray-400 font-bold mb-1 px-1">{msg.sender}</span>
                                    <div className={`px-4 py-3 shadow-clay font-medium text-sm max-w-[85%] ${msg.sender === user?.username ? 'bg-clay-blue text-white rounded-2xl rounded-tr-sm' : 'bg-white rounded-2xl rounded-tl-sm text-slate-700'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className="p-4 bg-clay-surface shadow-[0_-8px_16px_rgba(0,0,0,0.05)] rounded-tl-3xl flex flex-col gap-3">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {quickChats.map((qc, i) => (
                                    <button 
                                        key={i} onClick={() => handleQuickChat(qc)}
                                        className="whitespace-nowrap px-4 py-2 bg-white rounded-pill shadow-clay text-xs font-black text-clay-primary active:shadow-clay-pressed transition-all"
                                    >
                                        {qc}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input 
                                    type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-5 py-3 rounded-pill shadow-clay-pressed bg-white outline-none text-sm font-medium border-2 border-transparent focus:border-clay-blue/20 transition-all"
                                />
                                <button type="submit" className="w-12 h-12 rounded-full shadow-clay bg-clay-primary text-white font-black flex justify-center items-center active:shadow-clay-pressed transition-all text-xl pb-1">
                                    ➤
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatDrawer;
