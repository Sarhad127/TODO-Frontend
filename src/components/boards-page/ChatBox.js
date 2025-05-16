import React, { useState, useRef, useEffect } from 'react';

function ChatBox({ boardId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && boardId) {
            fetchMessages();
        }
    }, [isOpen, boardId]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/boards/${boardId}/chat`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.map(msg => ({
                    id: msg.id,
                    text: msg.message,
                    sender: msg.sender.username,
                    timestamp: msg.timestamp,
                })));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        if (input.trim() === '') return;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/boards/${boardId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ message: input.trim() }),
            });

            if (response.ok) {
                const savedMessage = await response.json();
                setMessages(prev => [
                    ...prev,
                    {
                        id: savedMessage.id,
                        text: savedMessage.message,
                        sender: savedMessage.sender.username,
                        timestamp: savedMessage.timestamp,
                    },
                ]);
                setInput('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="navbar-chat-container">
            <button
                className="navbar-chat-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                Chat
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="navbar-chat-dropdown">
                    <div className="chat-messages">
                        {messages.length > 0 ? (
                            messages.map(msg => (
                                <div key={msg.id} className="chat-message">
                                    <strong>{msg.sender}: </strong>{msg.text}
                                </div>
                            ))
                        ) : (
                            <div className="no-messages">No messages yet</div>
                        )}
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
                        <button className="chat-send-btn" onClick={sendMessage}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBox;