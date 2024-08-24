import React, { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import '../css/messages.css'

import { FaCircle } from "react-icons/fa6";

const Messages = () => {
    const token = localStorage.getItem('access_token');

    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [currentUserID, setCurrentUserID] = useState('');
    const [avatarList, setAvatarList] = useState([])

    const GetChats = useCallback(async () => {
        if (token) {
            return axios.get('http://localhost:8000/api/messages/get_chat/',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                .then(response => {
                    if (response.data.chats[0]) {
                        setChats(response.data.chats);
                        setUsers(response.data.users);
                        setMessages(response.data.messages);
                        setCurrentUserID(response.data.current_user_id);
                        setAvatarList(response.data.avatarList)
                    }
                    console.log(response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [token]);

    const [loader, setLoader] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([GetChats()]);
            setLoader(false);
        };
        fetchData();
    }, [GetChats]);

    const [findChat, setFindChat] = useState('');

    const filteredChats = chats
    .map(chat => {
        const lastMessage = messages
            .filter(msg => msg.chat_id === chat.id)
            .sort((a, b) => new Date(b.date_send) - new Date(a.date_send))[0];
        return { ...chat, lastMessage };
    })
    .filter(chat => {
        const user = users.find(usr => usr.id === chat.first_user || usr.id === chat.second_user);
        return user && (user.first_name.toLowerCase().includes(findChat.toLowerCase()) || user.last_name.toLowerCase().includes(findChat.toLowerCase()));
    })
    .sort((a, b) => new Date(b.lastMessage.date_send) - new Date(a.lastMessage.date_send));


    const socketRef = useRef(null);

    const [currentStatus, setCurrentStatus] = useState([]);

    useEffect(() => {
        const initializeWebSocket = async () => {
            const userIds = [];

            users.forEach(el => {
                userIds.push(el.id);
            });

            if (!loader && !socketRef.current && userIds.length > 0) {
                socketRef.current = new WebSocket(`ws://localhost:8000/ws/users/status/${userIds.join(',')}/`);

                socketRef.current.onopen = () => {
                    console.log('WebSocket connection established');
                };

                socketRef.current.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log(`User ${data.user_id} status: ${data.new_status}, last activity: ${data.last_activity}`);

                    // Обновление currentStatus с использованием setState
                    setCurrentStatus(prevState => {
                        const updatedStatus = prevState.filter(status => status.user_id !== data.user_id);
                        updatedStatus.push({ 'user_id': data.user_id, 'new_status': data.new_status, 'last_activity': data.last_activity });
                        return updatedStatus;
                    });
                };

                socketRef.current.onclose = () => {
                    console.log('WebSocket connection closed');
                };

                return () => {
                    socketRef.current.close();
                };
            }
        };

        initializeWebSocket();
    }, [loader, users, currentStatus]);

    return (
        <div style={{ width: '100%', marginRight: '20px' }}>
            <title>Messages</title>
            {!loader && currentStatus &&
                <div className="element">
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '100%' }}>
                            <input
                                className='friend_inp'
                                placeholder='Find chats'
                                onChange={(e) => setFindChat(e.target.value)}
                            />
                            {filteredChats.length > 0 &&
                                <div>
                                    {filteredChats.map((el) => {
                                        const user = users.find(usr => usr.id === el.first_user || usr.id === el.second_user);
                                        const avatar = avatarList.find(usr => usr.id === el.first_user || usr.id === el.second_user);
                                        const message = el.lastMessage;
                                        const status = currentStatus.find(status =>
                                            status.new_status === true &&
                                            String(status.user_id) === String(user.id)
                                        );
                            
                                        return (
                                            <div style={{ display: 'flex', justifyContent: 'center' }} key={el.id}>
                                                {message &&
                                                    <div className="chats-list">
                                                        <Link style={{ color: 'white', textDecoration: 'none', display: 'flex', position: 'relative' }} to={`/messages/chat/${el.id}/companion/${user.id}`}>
                                                            {status && <FaCircle style={{ color: '#2ed600', position: 'absolute', top: '45px', zIndex: '1', left: '40px', height: '10px', width: '10px' }} />}
                                                            {avatar && <img src={avatar.avatar_url} alt='some' style={{ width: '50px', height: '60px', clipPath: 'circle(40%)', marginTop: '5px', marginRight: '0px', marginLeft: '5px' }} />}
    
                                                            <div style={{ margin: '10px' }}>
                                                                <p style={{ marginTop: '0px' }}>{user.first_name} {user.last_name}</p>
                                                                <p style={{ opacity: '0.5' }}>{message.sender_id !== currentUserID ? user.first_name : 'You'}: {message.text}</p>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export { Messages }
