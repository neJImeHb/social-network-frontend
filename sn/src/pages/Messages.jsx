import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import '../css/messages.css'

const Messages = () => {
    const token = localStorage.getItem('access_token');

    const [chats, setChats] = useState()
    const [users, setUsers] = useState()
    const [messages, setMessages] = useState()
    const [currentUserID, setCurrentUserID] = useState()

    const GetChats = useCallback(async() => {
        if (token) {
            return axios.get('http://localhost:8000/api/messages/get_chat/',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                .then(response => {
                    if (response.data.chats[0]) {
                        setChats(response.data.chats)
                        setUsers(response.data.users)
                        setMessages(response.data.messages)
                        setCurrentUserID(response.data.current_user_id)
                    }
                    console.log(response.data)
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }, [token])

    const [loader, setLoader] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([GetChats()]);
            setLoader(false);
        };
        fetchData()
    }, [GetChats])

    return (
        <div style={{ width: '100%', marginRight: '20px'}}>
            <title>Messages</title>
            {!loader &&
                <div className="element">
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '100%' }}>
                            <input className='friend_inp' placeholder='Find chats' />
                            {chats ?
                                <div>
                                    {chats.map((el) => {
                                        const user = users.find(usr => usr.id === el.first_user || usr.id === el.second_user);
                                        const message = messages.find(msg => msg.chat_id === el.id)
                                        return (
                                            <div style={{ display: 'flex', justifyContent: 'center' }} key={el.id}>
                                                <div className="chats-list">
                                                    <Link style={{ color: 'white', textDecoration: 'none' }} to={`/messages/chat/${el.id}/companion/${user.id}`}>
                                                        <div style={{ margin: '10px' }}>
                                                            <p style={{ marginTop: '0px' }}>{user.first_name} {user.last_name}</p>
                                                            <p style={{ opacity: '0.5' }}>{message.sender_id !== currentUserID ? user.first_name : 'You'}: {message.text}</p>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                :
                                <div><h2 style={{ textAlign: 'center' }}>You don't have any chat :(</h2></div>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export { Messages }