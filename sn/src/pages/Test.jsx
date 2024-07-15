import React, { useEffect, useState } from "react";

const Test = () => {
    const [randomInt, setRandomInt] = useState();
    const [socket, setSocket] = useState(null); // Состояние для хранения объекта WebSocket

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:8000/ws/messages/');
        setSocket(newSocket); // Сохраняем WebSocket в состоянии

        newSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            setRandomInt(data.message);
            if (data.msg) {
                console.log(data.msg)
            }
        };

        newSocket.onclose = function (e) {
            console.log('WebSocket closed unexpectedly', 200);
        };

        // Cleanup function to close the socket
        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = () => {
        if (socket) {
            const jsonMessage = JSON.stringify({ message: 'Hello, server!' });
            socket.send(jsonMessage);
        }
    };

    return (
        <div>
            <h1>{randomInt}</h1>
            <button onClick={sendMessage}>Enter</button>
        </div>
    );
};

export { Test };
