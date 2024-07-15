import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const CurrentChat = () => {
    const { chat_id, user_id } = useParams();

    const [companion, setCompanion] = useState();
    const [messageList, setMessageList] = useState([]);
    const messagesEndRef = useRef(null);

    const token = localStorage.getItem('access_token');

    const getCompanion = useCallback(() => {
        if (token) {
            axios.post('http://localhost:8000/api/messages/get_companion/',
                {
                    'id': user_id
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                .then(response => {
                    setCompanion(response.data);
                    console.log(response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [token, user_id]);

    const getMessages = useCallback(() => {
        axios.post('http://localhost:8000/api/messages/get_messages/',
            {
                'current_chat': chat_id
            })
            .then(response => {
                setMessageList(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [chat_id]);

    const [message, setMessage] = useState('');

    const sendMessage = (e) => {
        e.preventDefault();
        if (token && message) {
            axios.post('http://localhost:8000/api/messages/send_message/',
                {
                    'current_chat': chat_id,
                    'message': message
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                .then(response => {
                    console.log(response.data);
                    getMessages(); // Вызов после успешной отправки сообщения
                    setMessage('');
                })
                .catch(error => {
                    console.log(error);
                });
        }
    };

    useEffect(() => {
        getCompanion();
        getMessages();
    }, [getCompanion, getMessages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messageList]);


    return (
        <div style={{ width: '100%', height: '88vh' }}>
            <title>Messages</title>
            {companion &&
                <div className="element" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', backgroundColor: '#2e2e2e', height: '70px', borderRadius: '5px 5px 0 0', alignItems: 'center' }}>
                                <Link style={{ color: 'white' }} className="msg-back-butt" to='/messages'>Back</Link>
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ marginTop: '20px' }}>
                                        <Link style={{ color: 'white', textDecoration: 'none' }} to={`/profile/${companion.username}`}>{companion.first_name} {companion.last_name}</Link>
                                        <p style={{ textAlign: 'center', marginTop: '10px', opacity: '0.7' }}>{companion.last_activity ? 'Online' : 'Offline'}</p>
                                    </div>
                                </div>
                            </div>
                            <div ref={messagesEndRef} style={{ position: 'absolute', bottom: '100px', width: '100%', height: 'calc(100% - 170px)', overflowY: 'scroll', display: 'flex', flexDirection: 'column-reverse' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                                    {messageList.sort((a, b) => new Date(a.date_send) - new Date(b.date_send)).map((el) => (
                                        <div key={el.id} className={el.sender_id === companion.id ? 'msg-div-2' : 'msg-div'}>
                                            {el.sender_id === companion.id ? <h4 className="msg-h4-2">{companion.first_name}</h4> : <h4 className="msg-h4">You</h4>}
                                            <p>{el.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ position: 'absolute', bottom: '20px', width: '100%' }}>
                                <form onSubmit={sendMessage} style={{ display: 'flex', justifyContent: 'center' }}>
                                    <input value={message} onChange={(e) => setMessage(e.target.value)} className="message-input" placeholder="Write message" />
                                    <button type="submit" className="message-button">Enter</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export { CurrentChat };
