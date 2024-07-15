import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

import { CreateChat } from "../components/CreateChat";

const Friends = () => {
    const { username } = useParams()

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
                })
                .catch(error => {
                    console.log(error)
                })
            setIsGetted(false)
            CheckNewRequests()
            CheckFriendList()
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
                })
                .catch(error => {
                    console.log(error)
                })
            setIsGetted(false)
            CheckNewRequests()
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

    return (
        <div style={{ width: '100%' }}>
            <title>{username}'s friends</title>
            {notFound ? <h1>{notFound}</h1> :
                <div>
                    {!loader &&
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
                                            <span style={{ color: '#858585' }}> {userList.filter(f => f.last_activity === true).length}</span>
                                        </button>
                                    </div>
                                    <input className='friend_inp' placeholder='Find friends' onChange={(e) => setFindUser(e.target.value)} />
                                    {changeButton ?
                                        <div>
                                            {filteredFriends && filteredFriends.map((el, index) => {
                                                const u = userList.find(usr => usr.id === el.from_user || usr.id === el.to_user);
                                                return (
                                                    <div style={{ margin: '20px' }} key={el.id}>
                                                        <Link className="sender_link" to={`/profile/${u.username}`}>{u.first_name} {u.last_name}</Link>
                                                        <p style={{ opacity: '0.3' }}>You have been friends since {el.date_friend}</p>
                                                        <Link className="send_msg" onClick={() => CreateChat(u.id)}>Send message</Link>
                                                        {index !== filteredFriends.length - 1 && <hr style={{ opacity: '0.5', borderTop: '1px solid #333' }}></hr>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        :
                                        <div>
                                            {filteredFriends && filteredFriends.map((el, index) => {
                                                const user = userList.find(usr => usr.id === el.from_user || usr.id === el.to_user);
                                                const isActive = user?.last_activity === true;
                                                return (
                                                    <div key={el.id}>
                                                        {isActive &&
                                                            <div style={{ margin: '20px' }}>
                                                                <Link className="sender_link" to={`/profile/${user.username}`}>{user.first_name} {user.last_name}</Link>
                                                                <p style={{ opacity: '0.3' }}>You have been friends since {el.date_friend}</p>
                                                                <Link className="send_msg" onClick={() => CreateChat(user.id)}>Send message</Link>
                                                                {index === filteredFriends.length - 1 && <hr style={{ opacity: '0.5', borderTop: '1px solid #333' }}></hr>}
                                                            </div>
                                                        }
                                                    </div>
                                                )
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
