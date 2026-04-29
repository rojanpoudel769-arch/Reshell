import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { MessageSquare, ChevronRight, Send, ArrowLeft, ShoppingBag, Inbox } from 'lucide-react';

const MessagesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { socket, setHasUnreadMessages } = useSocket() || {};
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [thread, setThread] = useState(null);
    const [reply, setReply] = useState('');
    const [loadingList, setLoadingList] = useState(true);
    const [loadingThread, setLoadingThread] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchConversations();
        if (setHasUnreadMessages) {
            setHasUnreadMessages(false);
        }
    }, [user, setHasUnreadMessages]);

    const fetchConversations = async () => {
        setLoadingList(true);
        try {
            const res = await axios.get('/api/messages');
            setConversations(res.data);
        } catch {
            setError('Failed to load conversations.');
        } finally {
            setLoadingList(false);
        }
    };

    const fetchThread = useCallback(async (conv) => {
        setSelected(conv);
        setLoadingThread(true);
        setReply('');
        try {
            const res = await axios.get(`/api/messages/${conv._id}`);
            setThread(res.data);
            
            // Join socket room
            if (socket) {
                socket.emit('join_conversation', conv._id);
            }
        } catch {
            setError('Failed to load conversation.');
        } finally {
            setLoadingThread(false);
        }
    }, [socket]);

    // Cleanup socket room on unmount or selection change
    useEffect(() => {
        return () => {
            if (socket && selected) {
                socket.emit('leave_conversation', selected._id);
            }
        };
    }, [socket, selected]);

    // Handle real-time incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            if (selected && data.conversationId === selected._id) {
                setThread(prev => ({
                    ...prev,
                    messages: [...prev.messages, data.message],
                    lastMessageAt: data.message.createdAt
                }));
            }
            // Update conversation list ordering/latest message
            setConversations(prev => {
                const updated = prev.map(c => 
                    c._id === data.conversationId 
                        ? { ...c, messages: [...c.messages, data.message], lastMessageAt: data.message.createdAt }
                        : c
                );
                return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
            });
        };

        socket.on('new_message', handleNewMessage);
        return () => socket.off('new_message', handleNewMessage);
    }, [socket, selected]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setSending(true);
        try {
            await axios.post(`/api/messages/${selected._id}/reply`, { body: reply });
            setReply('');
            // We no longer call fetchThread(selected) here. 
            // The socket 'new_message' event will append the message automatically!
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reply.');
        } finally {
            setSending(false);
        }
    };

    const getOtherPerson = (conv) => {
        if (!conv) return '';
        return conv.buyer?._id === user?._id ? conv.seller?.name : conv.buyer?.name;
    };

    const lastMessage = (conv) => {
        const msgs = conv.messages;
        if (!msgs?.length) return '';
        return msgs[msgs.length - 1].body;
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ minHeight: '70vh' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--clr-brand-primary)',
                    padding: '0.6rem', borderRadius: 'var(--radius-md)',
                }}>
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Messages</h1>
                    <p style={{ color: 'var(--clr-text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                        Your conversations with buyers and sellers
                    </p>
                </div>
            </div>

            {error && (
                <div style={{
                    backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid var(--clr-error)',
                    color: 'var(--clr-error)', padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem',
                }}>
                    {error}
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: selected ? '320px 1fr' : '1fr',
                gap: '1.5rem',
                alignItems: 'start',
            }} className="messages-grid">

                {/* Conversation List */}
                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--clr-border)',
                        fontWeight: 600, fontSize: '0.875rem',
                        color: 'var(--clr-text-secondary)',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        Inbox
                    </div>

                    {loadingList ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-tertiary)' }}>
                            Loading conversations…
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                            <Inbox size={40} style={{ color: 'var(--clr-text-tertiary)', marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--clr-text-secondary)', marginBottom: '1rem' }}>No messages yet.</p>
                            <Link to="/explore" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                Browse Listings
                            </Link>
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {conversations.map((conv) => (
                                <li
                                    key={conv._id}
                                    onClick={() => fetchThread(conv)}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--clr-border)',
                                        display: 'flex', gap: '0.875rem', alignItems: 'center',
                                        backgroundColor: selected?._id === conv._id
                                            ? 'rgba(99,102,241,0.08)' : 'transparent',
                                        borderLeft: selected?._id === conv._id
                                            ? '3px solid var(--clr-brand-primary)' : '3px solid transparent',
                                        transition: 'background-color var(--transition-fast)',
                                    }}
                                    onMouseEnter={e => {
                                        if (selected?._id !== conv._id)
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                    }}
                                    onMouseLeave={e => {
                                        if (selected?._id !== conv._id)
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {/* Item thumbnail */}
                                    <div style={{
                                        width: '3rem', height: '3rem', borderRadius: 'var(--radius-sm)',
                                        overflow: 'hidden', flexShrink: 0,
                                        backgroundColor: 'var(--clr-bg-tertiary)',
                                    }}>
                                        {conv.item?.images?.[0] ? (
                                            <img src={conv.item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShoppingBag size={18} color="var(--clr-text-tertiary)" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getOtherPerson(conv)}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-tertiary)', flexShrink: 0, marginLeft: '0.5rem' }}>
                                                {formatTime(conv.lastMessageAt)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {conv.item?.title || 'Unknown listing'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                                            {lastMessage(conv)}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} color="var(--clr-text-tertiary)" style={{ flexShrink: 0 }} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Thread Panel */}
                {selected && (
                    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '70vh' }}>

                        {/* Thread header */}
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderBottom: '1px solid var(--clr-border)',
                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                        }}>
                            <button
                                onClick={() => setSelected(null)}
                                className="back-btn-mobile"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-secondary)', padding: '0.25rem', display: 'none' }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            {thread?.item?.images?.[0] && (
                                <img
                                    src={thread.item.images[0]}
                                    alt=""
                                    style={{ width: '2.5rem', height: '2.5rem', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getOtherPerson(selected)}
                                </div>
                                <Link
                                    to={`/items/${thread?.item?._id}`}
                                    style={{ fontSize: '0.8rem', color: 'var(--clr-brand-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                                >
                                    Re: {thread?.item?.title || '…'}
                                </Link>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--clr-brand-primary)', fontSize: '0.9rem', flexShrink: 0 }}>
                                Rs. {thread?.item?.price?.toLocaleString()}
                            </span>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {loadingThread ? (
                                <div style={{ textAlign: 'center', color: 'var(--clr-text-tertiary)', paddingTop: '2rem' }}>Loading messages…</div>
                            ) : thread?.messages?.map((msg, i) => {
                                const isMine = msg.from?._id === user?._id || msg.from === user?._id;
                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '75%',
                                            backgroundColor: isMine ? 'var(--clr-brand-primary)' : 'var(--clr-bg-secondary)',
                                            color: isMine ? 'white' : 'var(--clr-text-primary)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: isMine
                                                ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)'
                                                : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.5,
                                            border: isMine ? 'none' : '1px solid var(--clr-border)',
                                        }}>
                                            {msg.body}
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-tertiary)', marginTop: '0.25rem' }}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Reply input */}
                        <form onSubmit={handleReply} style={{
                            padding: '1rem 1.25rem',
                            borderTop: '1px solid var(--clr-border)',
                            display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
                            backgroundColor: 'var(--clr-bg-secondary)',
                        }}>
                            <textarea
                                id="reply-input"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
                                placeholder="Type a reply… (Enter to send)"
                                rows={2}
                                style={{
                                    flex: 1, padding: '0.75rem',
                                    backgroundColor: 'var(--clr-bg-primary)',
                                    border: '1px solid var(--clr-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--clr-text-primary)',
                                    fontSize: '0.875rem', resize: 'none',
                                    outline: 'none', fontFamily: 'inherit',
                                }}
                            />
                            <button
                                id="send-reply-btn"
                                type="submit"
                                className="btn btn-primary"
                                disabled={sending || !reply.trim()}
                                style={{ padding: '0.75rem', flexShrink: 0 }}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .messages-grid {
                        grid-template-columns: ${selected ? '320px 1fr' : '1fr'} !important;
                    }
                }
                @media (max-width: 767px) {
                    .messages-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .back-btn-mobile { display: flex !important; }
                }
            `}</style>
        </div>
    );
};

export default MessagesPage;
