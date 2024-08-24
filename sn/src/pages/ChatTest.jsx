import React, { useEffect, useState, useRef } from 'react';

const ChatRoom = () => {
    var roomName = 'someName'

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);

        socketRef.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        socketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages((prevMessages) => [...prevMessages, data.message]);
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            socketRef.current.close();
        };
    }, [roomName]);

    const sendMessage = () => {
        if (newMessage) {
            socketRef.current.send(JSON.stringify({ message: newMessage }));
            setNewMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, idx) => (
                    <p key={idx}>{msg}</p>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatRoom;
