'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatApi, getUser } from '../utils/api';
import { socketService } from '../services/socket.service';

interface Contact {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
}

interface Message {
    id: number;
    sender: 'admin' | 'customer';
    text: string;
    time: string;
}

export default function MessagesPage({ onToast }: { onToast: (msg: string, type: any) => void }) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeContactId, setActiveContactId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketInitialized = useRef(false);
    const user = getUser();

    const fetchContacts = useCallback(async () => {
        setLoadingContacts(true);
        try {
            const res = await chatApi.getContacts();
            if (res.success) {
                setContacts(res.data);
                if (res.data.length > 0 && !activeContactId) {
                    setActiveContactId(res.data[0].id);
                }
            }
        } catch (error) {
            onToast('Lỗi tải danh sách liên hệ', 'error');
        } finally {
            setLoadingContacts(false);
        }
    }, [activeContactId, onToast]);

    const fetchMessages = useCallback(async (id: string) => {
        setLoadingMessages(true);
        try {
            const res = await chatApi.getMessages(id);
            if (res.success) {
                const mappedMessages = res.data.map((m: any) => ({
                    id: m.id,
                    sender: m.senderId === null ? 'admin' : 'customer',
                    text: m.content,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(mappedMessages);
            }
        } catch (error) {
            onToast('Lỗi tải tin nhắn', 'error');
        } finally {
            setLoadingMessages(false);
        }
    }, [onToast, user?.id]);

    useEffect(() => {
        if (!socketInitialized.current && user) {
            fetchContacts();
            // Admins join their own ID AND the admin-placeholder room
            socketService.connect('admin-placeholder'); 
            socketService.onReceiveMessage((m) => {
                const mappedMsg = {
                    id: m.id,
                    sender: m.senderId === null ? 'admin' : 'customer',
                    text: m.content,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                setMessages(prev => {
                    if (prev.find(old => old.id === mappedMsg.id)) return prev;
                    return [...prev, mappedMsg as Message];
                });

                // Update contact list last message
                setContacts(prev => prev.map(c => 
                    (c.id === m.senderId || c.id === m.receiverId) 
                        ? { ...c, lastMessage: m.content, time: 'Vừa xong' } 
                        : c
                ));
            });
            socketInitialized.current = true;
        }
        return () => {
            if (socketInitialized.current) {
                socketService.offReceiveMessage();
            }
        };
    }, [user?.id, fetchContacts]);

    useEffect(() => {
        if (activeContactId) {
            fetchMessages(activeContactId);
        }
    }, [activeContactId, fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeContactId) return;

        const text = inputText;
        setInputText('');

        try {
            console.log('Admin: Sending message to', activeContactId, 'content:', text);
            socketService.sendMessage({ receiverId: activeContactId, content: text });
            
            // Optimistic update
            const tempMsg: Message = {
                id: Date.now(),
                sender: 'admin',
                text: text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, tempMsg]);
            
            // Update contact list last message
            setContacts(prev => prev.map(c => 
                c.id === activeContactId 
                    ? { ...c, lastMessage: text, time: 'Vừa xong' } 
                    : c
            ));
        } catch (error) {
            console.error('Admin: Error sending message:', error);
            onToast('Lỗi gửi tin nhắn', 'error');
        }
    };

    const activeContact = contacts.find(c => c.id === activeContactId);

    return (
        <div id="messages-page" className="animate-fade-in" style={{ height: 'calc(100vh - 180px)', display: 'flex' }}>
            {/* Contacts Sidebar */}
            <div className="glass-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '0', marginRight: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Hội thoại</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {loadingContacts ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                            <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                        </div>
                    ) : (
                        contacts.map(contact => (
                            <div 
                                key={contact.id}
                                className={`chat-item ${activeContactId === contact.id ? 'active' : ''}`}
                                onClick={() => setActiveContactId(contact.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                    transition: 'all 0.2s ease',
                                    background: activeContactId === contact.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    border: activeContactId === contact.id ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                                }}
                            >
                                <div style={{ position: 'relative', marginRight: '12px' }}>
                                    <div style={{ 
                                        width: '44px', 
                                        height: '44px', 
                                        borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '16px'
                                    }}>
                                        {contact.name.charAt(0)}
                                    </div>
                                    {contact.online && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            bottom: '2px', 
                                            right: '2px', 
                                            width: '12px', 
                                            height: '12px', 
                                            background: 'var(--primary-500)', 
                                            border: '2px solid #fff', 
                                            borderRadius: '50%' 
                                        }}></div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{contact.time}</div>
                                    </div>
                                    <div style={{ 
                                        fontSize: '13px', 
                                        color: contact.unread > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                                        fontWeight: contact.unread > 0 ? 600 : 400,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {contact.lastMessage}
                                    </div>
                                </div>
                                {contact.unread > 0 && (
                                    <div style={{ 
                                        background: 'var(--primary-500)', 
                                        color: '#fff', 
                                        borderRadius: '10px', 
                                        padding: '2px 8px', 
                                        fontSize: '10px', 
                                        fontWeight: 700,
                                        marginLeft: '8px'
                                    }}>
                                        {contact.unread}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                {activeContact ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.01)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '14px', fontWeight: 600 }}>
                                {activeContact.name.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{activeContact.name}</div>
                                <div style={{ fontSize: '12px', color: activeContact.online ? '#10b981' : 'var(--text-muted)' }}>
                                    {activeContact.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                </div>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loadingMessages ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                                            maxWidth: '100%'
                                        }}
                                    >
                                        <div style={{ 
                                            maxWidth: '70%', 
                                            background: msg.sender === 'admin' ? 'var(--primary-500)' : 'rgba(0,0,0,0.05)',
                                            color: msg.sender === 'admin' ? '#fff' : 'var(--text-primary)',
                                            padding: '12px 18px',
                                            borderRadius: msg.sender === 'admin' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                            border: msg.sender === 'admin' ? 'none' : '1px solid rgba(0,0,0,0.03)'
                                        }}>
                                            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.text}</div>
                                            <div style={{ 
                                                fontSize: '10px', 
                                                opacity: 0.7, 
                                                marginTop: '4px', 
                                                textAlign: 'right' 
                                            }}>
                                                {msg.time}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    className="form-input"
                                    placeholder="Nhập tin nhắn..." 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    style={{ flex: 1, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }}
                                />
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={!inputText.trim()}
                                    style={{ padding: '0 24px', borderRadius: '12px' }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5 }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <p style={{ marginTop: '16px' }}>Chọn một hội thoại để bắt đầu</p>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .chat-item:hover {
                    background: rgba(16, 185, 129, 0.03) !important;
                }
                .chat-item.active:hover {
                    background: rgba(16, 185, 129, 0.1) !important;
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
