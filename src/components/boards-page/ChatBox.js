import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function ChatBox({ boardId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [connected, setConnected] = useState(false);

    const connectWebSocket = () => {
        if (stompClientRef.current?.connected) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                stompClient.subscribe(`/topic/chat/${boardId}`, (msg) => {
                    const received = JSON.parse(msg.body);
                    const normalized = {
                        text: received.message || received.text || '',
                        sender: received.sender || 'Unknown',
                        timestamp: received.timestamp || '',
                    };
                    setMessages(prev => [...prev, normalized]);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message'], frame.body);
            },
            onWebSocketError: (error) => {
                console.error('WebSocket error:', error);
            },
        });
        stompClientRef.current = stompClient;
        stompClient.activate();
    };

    const disconnectWebSocket = () => {
        stompClientRef.current?.deactivate();
        setConnected(false);
        stompClientRef.current = null;
    };

    useEffect(() => {
        if (isOpen && boardId) {
            fetchInitialMessages();
            connectWebSocket();
        } else {
            disconnectWebSocket();
        }

        return () => {
            disconnectWebSocket();
        };
    }, [isOpen, boardId]);

    const fetchInitialMessages = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8080/api/boards/${boardId}/chat`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.map(msg => ({
                    text: msg.message,
                    sender: msg.sender.username,
                    timestamp: msg.timestamp,
                })));
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const sendMessage = () => {
        const client = stompClientRef.current;
        if (!input.trim()) return;
        if (!client || !client.connected) {
            console.warn('STOMP client not connected');
            return;
        }
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        client.publish({
            destination: `/app/chat/${boardId}`,
            body: JSON.stringify({ message: input }),
            headers: { 'Authorization': `Bearer ${token}` },
        });

        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    return (
        <div className="navbar-chat-container">
            <button className="navbar-chat-toggle" onClick={() => setIsOpen(!isOpen)}>
                Chat <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className="navbar-chat-dropdown">
                    <div className="chat-messages">
                        {messages.length ? messages.map((msg, i) => (
                            <div key={i} className="chat-message">
                                <strong>{msg.sender}:</strong> {msg.text}
                            </div>
                        )) : <div className="no-messages">No messages yet</div>}

                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-container">
                        <textarea
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                        />
                        <button
                            className="chat-send-btn"
                            onClick={sendMessage}
                            disabled={!connected || !input.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBox;
