import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";

import { CreateChat } from "../components/CreateChat";

import { FaCircle } from "react-icons/fa6";

const Friends = () => {
    const { username } = useParams()
    const navigate = useNavigate();

    const [from, setFrom] = useState({
        'id': '',
        'first_name': '',
        'last_name': '',
        'sender_username': '',
        'date_send': '',
    })

    const [isGetted, setIsGetted] = useState(false)

    const token = localStorage.getItem('access_token');

    const CheckNewRequests = useCallback(async () => {
        return axios.get('http://localhost:8000/api/check_friend_request/',
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            .then(response => {
                if (response.data) {
                    setFrom({
                        'id': response.data.id,
                        'first_name': response.data.first_name,
                        'last_name': response.data.last_name,
                        'sender_username': response.data.sender_username,
                        'date_send': response.data.date_send,
                    })
                    setIsGetted(true)
                } else { setIsGetted(false) }
            })
            .catch(error => {
                console.log(error)
            });
    }, [token])

    const [friendList, setFriendList] = useState([])
    const [userList, setUsersList] = useState([])
    const [avatarList, setAvatarList] = useState([])
    const [notFound, setNotFound] = useState('')

    const CheckFriendList = useCallback(async () => {
        return axios.post('http://localhost:8000/api/check_friend_list/',
            {
                'username': username
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            .then(response => {
                if (response.data.not_found) {
                    setNotFound(response.data.not_found)
                } else {
                    setAvatarList(response.data.avatarList)
                    console.log(response.data.avatarList)
                    setFriendList(response.data.friend_data)
                    setUsersList(response.data.user_data)
                }
            })
            .catch(error => {
                console.log(error)
            });
    }, [token, username])

    const accept = async (request_id) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.post('http://localhost:8000/api/accept_friend_request/', {
                'request_id': request_id
            },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                .then(response => {
                    console.log(response.data)
                    CheckNewRequests()
                    CheckFriendList()
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }
    const reject = async (request_id) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.post('http://localhost:8000/api/reject_friend_request/', {
                'request_id': request_id
            },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                .then(response => {
                    console.log(response.data)
                    CheckNewRequests()
                })
                .catch(error => {
                    console.log(error)
                })
            setIsGetted(false)
        }
    }

    const [loader, setLoader] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([CheckNewRequests(), CheckFriendList()]);
            setLoader(false);
        };
        fetchData()
    }, [CheckNewRequests, CheckFriendList]);

    const [changeButton, setChangeButton] = useState(true)

    const button_styles = {
        backgroundColor: '#2e2e2e',
        color: 'white'
    }

    const [findUser, setFindUser] = useState('')

    const filteredFriends = friendList.filter(el => {
        const user = userList.find(usr => usr.id === el.from_user || usr.id === el.to_user);
        return user && (user.first_name.toLowerCase().includes(findUser.toLowerCase()) || user.last_name.toLowerCase().includes(findUser.toLowerCase()));
    });

    const CreatingChat = async (user_id) => {
        const chatID = await CreateChat(user_id);
        if (chatID !== null) {
            navigate(`/messages/chat/${chatID}/companion/${user_id}`);
        } else { console.log('Error using CreateChat function') }
    }

    const socketRef = useRef(null);

    const [currentStatus, setCurrentStatus] = useState([]);

    useEffect(() => {
        const initializeWebSocket = async () => {
            const userIds = [];

            filteredFriends.forEach(el => {
                const u = userList.find(usr => usr.id === el.from_user || usr.id === el.to_user);
                if (u) userIds.push(u.id);
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
    }, [loader, filteredFriends, userList, currentStatus]);

    return (
        <div style={{ width: '100%' }}>
            <title>{username}'s friends</title>
            {notFound ? <h1>{notFound}</h1> :
                <div>
                    {currentStatus && !loader &&
                        <div>
                            {isGetted &&
                                <div style={{ display: 'flex' }}>
                                    <div className='element' style={{ width: '100%' }}>
                                        <div style={{ margin: '20px' }}>
                                            <h3>Friend request</h3>
                                            <Link className="friend_link" to='/friends/all-request'>All requests ≻</Link>
                                            <hr style={{ opacity: '0.5', borderTop: '1px solid #333' }}></hr>
                                            <Link className="sender_link" to={`/profile/${from.sender_username}`}>{from.first_name} {from.last_name}</Link>
                                            <p style={{ opacity: '0.8' }}>Date the request was sent: {from.date_send}</p>
                                            <button className="accept_butt" onClick={() => accept(from.id)}>Accept</button>
                                            <button className="reject_butt" onClick={() => reject(from.id)}>Reject</button>
                                        </div>
                                    </div>
                                </div>}
                            <div style={{ display: 'flex' }}>
                                <div className='element' style={{ width: '100%' }} >
                                    <div>
                                        <button className="option_friend" style={changeButton ? button_styles : {}} onClick={() => setChangeButton(true)}>
                                            All friends
                                            <span style={{ color: '#858585' }}> {friendList.length}</span>
                                        </button>
                                        <button className="option_friend" style={changeButton ? {} : button_styles} onClick={() => setChangeButton(false)}>
                                            Online friends
                                            <span style={{ color: '#858585' }}> {currentStatus.filter(f => f.new_status === true).length}</span>
                                        </button>
                                    </div>
                                    <input className='friend_inp' placeholder='Find friends' onChange={(e) => setFindUser(e.target.value)} />
                                    {changeButton ?
                                        <div>
                                            {filteredFriends && filteredFriends.map((el, index) => {
                                                const u = userList.find(usr => usr.id === el.from_user || usr.id === el.to_user);
                                                const a = avatarList.find(avtr => avtr.id === el.from_user || avtr.id === el.to_user);
                                                const status = currentStatus.find(status =>
                                                    status.new_status === true &&
                                                    String(status.user_id) === String(u.id)
                                                );
                                                return (
                                                    <div style={{ margin: '20px' }} key={el.id}>
                                                        <div style={{ display: 'flex', position: 'relative' }}>
                                                            {status && <FaCircle style={{ color: '#2ed600', position: 'absolute', top: '90px', zIndex: '1', left: '93px' }} />}
                                                            {a && <img src={a.avatar_url} alt='some' style={{ width: '125px', height: '150px', clipPath: 'circle(40%)', marginTop: '-15px', marginRight: '10px' }} />}
                                                            <div style={{ marginTop: '15px' }}>
                                                                <Link className="sender_link" to={`/profile/${u.username}`}>{u.first_name} {u.last_name}</Link>
                                                                <p style={{ opacity: '0.3' }}>You have been friends since {el.date_friend}</p>
                                                                <Link className="send_msg" onClick={() => CreatingChat(u.id)}>Send message</Link>
                                                            </div>
                                                        </div>
                                                        {index !== filteredFriends.length - 1 && <hr style={{ opacity: '0.5', borderTop: '1px solid #333', marginTop: '-10px' }}></hr>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        :
                                        <div>
                                            {currentStatus && filteredFriends && filteredFriends.map((el, index) => {
                                                const user = userList.find(usr => usr.id === el.from_user || usr.id === el.to_user);
                                                const a = avatarList.find(avtr => avtr.id === el.from_user || avtr.id === el.to_user);

                                                // Найдем статус этого пользователя
                                                const status = currentStatus.find(status =>
                                                    status.new_status === true &&
                                                    String(status.user_id) === String(user.id)
                                                );

                                                const statusLength = currentStatus.filter(f => f.new_status === true).length

                                                // Пропускаем рендеринг, если статус не онлайн
                                                if (!status) return null;

                                                return (
                                                    <div key={el.id} style={{ margin: '20px' }}>
                                                        <div style={{ display: 'flex', position: 'relative' }}>
                                                            {status && <FaCircle style={{ color: '#2ed600', position: 'absolute', top: '90px', zIndex: '1', left: '93px' }} />}
                                                            {a && <img src={a.avatar_url} alt='some' style={{ width: '125px', height: '150px', clipPath: 'circle(40%)', marginTop: '-15px', marginRight: '10px' }} />}
                                                            <div style={{ marginTop: '15px' }}  >
                                                                <Link className="sender_link" to={`/profile/${user.username}`}>{user.first_name} {user.last_name}</Link>
                                                                <p style={{ opacity: '0.3' }}>You have been friends since {el.date_friend}</p>
                                                                <Link className="send_msg" onClick={() => CreatingChat(user.id)}>Send message</Link>
                                                            </div>
                                                        </div>
                                                        {index !== statusLength && statusLength > 1 && <hr style={{ opacity: '0.5', borderTop: '1px solid #333', marginTop: '-10px' }}></hr>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>}
                </div>}
        </div>
    )
}

export { Friends }
