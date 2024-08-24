import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import strftime from 'strftime';
import { useParams, Link } from "react-router-dom";

import { FaTrashCan } from "react-icons/fa6";
import { LuPencilLine } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";

const CurrentChat = ({ userID }) => {
    const { chat_id, user_id } = useParams();

    const [companion, setCompanion] = useState();
    const [messageList, setMessageList] = useState([]);
    const messagesEndRef = useRef(null);

    const [loader, setLoader] = useState(false)

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
            setLoader(true)
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

    useEffect(() => {
        getCompanion();
        getMessages();
    }, [getCompanion, getMessages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messageList]);

    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        if (loader && !socketRef.current) {
            socketRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${userID}/${chat_id}/`);

            socketRef.current.onopen = () => {
                console.log('WebSocket connection established');
            };

            socketRef.current.onmessage = () => {
                getMessages();
            };

            socketRef.current.onclose = () => {
                console.log('WebSocket connection closed');
            };

            return () => {
                socketRef.current.close();
            };
        }
    }, [chat_id, getMessages, loader, userID]);

    const [currentStatus, setCurrentStatus] = useState()

    const socketRef2 = useRef(null);

    useEffect(() => {
        const initializeWebSocket = async () => {
            if (!loader && !socketRef2.current && user_id) {
                socketRef2.current = new WebSocket(`ws://localhost:8000/ws/users/status/${user_id}/`);

                socketRef2.current.onopen = () => {
                    console.log('WebSocket connection established');
                };

                socketRef2.current.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log(`User ${data.user_id} status: ${data.new_status}, last activity: ${data.last_activity}`);

                    // Обновление currentStatus с использованием setState
                    setCurrentStatus(data.new_status)
                };

                socketRef2.current.onclose = () => {
                    console.log('WebSocket connection closed');
                };

                return () => {
                    socketRef2.current.close();
                };
            }
        };

        initializeWebSocket();
    }, [loader, user_id, currentStatus]);

    const sendMessage = (e) => {
        e.preventDefault();

        if (newMessage) {
            socketRef.current.send(JSON.stringify({ message: newMessage, userID: userID, recipient: companion.id, action: 'save_message' }));
            setNewMessage('');
        }
    };

    const sendEditedMessage = (e) => {
        e.preventDefault()

        if (newMessage) {
            socketRef.current.send(JSON.stringify({ message: newMessage, userID: userID, message_id: currentMsgID, action: 'edit_message' }));
            setNewMessage('');
        }

        CancelEdit()
    }

    const deleteMessage = (id, msg, current_id) => {
        if (id) {
            socketRef.current.send(JSON.stringify({ message: msg, userID: current_id, message_id: id, action: 'delete_message' }));
        }
    }

    function dateConverter(currentDate) {
        var now = new Date(currentDate);
        return strftime('%H:%M', now);
    }


    const [isEditing, setIsEditing] = useState(false)
    const [editingMessage, setEditingMessage] = useState()
    const [currentMsgID, setCurrentMsgID] = useState()

    function editMessage(id, text) {
        setNewMessage(text)
        setCurrentMsgID(id)
        setEditingMessage(text)
        setIsEditing(true)
    }

    function CancelEdit() {
        setNewMessage('')
        setCurrentMsgID(null)
        setEditingMessage(null)
        setIsEditing(false)
    }

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
                                        <p style={{ textAlign: 'center', marginTop: '10px', opacity: '0.7' }}>{currentStatus ? 'Online' : 'Offline'}</p>
                                    </div>
                                </div>
                            </div>
                            <div ref={messagesEndRef} style={{ position: 'absolute', bottom: '100px', width: '100%', height: 'calc(100% - 170px)', overflowY: 'scroll', display: 'flex', flexDirection: 'column-reverse' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                                    {messageList.sort((a, b) => new Date(a.date_send) - new Date(b.date_send)).map((el) => {
                                        return (
                                            <div key={el.id} style={{ maxWidth: '80%' }} className={el.sender_id === companion.id ? 'msg-div-2' : 'msg-div'}>
                                                <div style={{ display: 'flex' }}>
                                                    <p className={el.sender_id === companion.id ? 'date-text' : 'date-text-2'}>{dateConverter(el.date_send)}</p>
                                                    {el.date_change &&
                                                        <p className={el.sender_id === companion.id ? 'date-change-text' : 'date-change-text-2'}>Edited at {dateConverter(el.date_change)}</p>
                                                    }
                                                    <div>
                                                        {el.sender_id === companion.id ? <h4 className="msg-h4-2">{companion.first_name}</h4> : <h4 className="msg-h4">You</h4>}
                                                        <p>{el.text}</p>
                                                        {el.sender_id !== companion.id &&
                                                            <div>
                                                                <FaTrashCan className="msg-trash" onClick={() => deleteMessage(el.id, el.text, el.sender_id)} />
                                                                <LuPencilLine className='msg-pencil' onClick={() => editMessage(el.id, el.text)} />
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div style={{ position: 'absolute', bottom: '20px', width: '100%' }}>
                                {!isEditing ?
                                    <form onSubmit={sendMessage} style={{ display: 'flex', justifyContent: 'center' }}>
                                        <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="message-input" placeholder="Write message" />
                                        <button type="submit" className="message-button">Enter</button>
                                    </form>
                                    :
                                    <div>
                                        <form onSubmit={sendEditedMessage} style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                                            <div style={{ display: 'flex' }}>
                                                <RxCross1 style={{ position: 'absolute', cursor: 'pointer', zIndex: '1', width: '20px', height: '20px', marginTop: '15px', marginLeft: '10px', opacity: '0.7' }} onClick={CancelEdit} />
                                                <p style={{ position: 'absolute', zIndex: '1', marginLeft: '40px', opacity: '0.7' }}>{editingMessage.length > 70 ? editingMessage.slice(0, 70) + '...' : editingMessage}</p>
                                            </div>
                                            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="message-input-2" placeholder="Please write the text" />
                                            <button type="submit" className="message-button">Edit</button>
                                        </form>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export { CurrentChat };
