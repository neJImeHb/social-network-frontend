import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import Logout from '../components/Logout';
import { Info } from '../components/Info';
import { OnlineStatus } from '../components/OnlineStatus';
import { SendRequest } from '../components/SendRequset';
import { ToBeFriends } from '../components/ToBeFriends';
import { ModalWindow } from '../components/ModalWindow';

const Profile = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const [loader, setLoader] = useState(true)

    const { username } = useParams();

    const [noTime, setNoTime] = useState(false);

    const [profile, setProfile] = useState({
        id: '',
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone: '',
        bio: {},
        last_activity: ''
    });
    
    const [isOwner, setIsOwner] = useState(false);
    const [isFriends, setIsFriends] = useState({
        id: '',
        from_user: '',
        to_user: '',
        is_accept: '',
        in_subscribe: ''
    });
    const [YouAreSubscriber, setYouAreSubscriber] = useState();
    const [RequestIsSended, setRequestIsSended] = useState();
    const [YouDidRejected, setYouDidRejected] = useState();
    const [YouCanToAccept, setYouCanToAccept] = useState()

    const ProfileFriends = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        return axios.post('http://localhost:8000/api/profile_friends/', 
        {
            username: username
        }, 
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(response => {
            if (response.data.friend[0]) {
                setIsFriends({
                    id: response.data.friend[0].id,
                    from_user: response.data.friend[0].from_user,
                    to_user: response.data.friend[0].to_user,
                    is_accept: response.data.friend[0].is_accept,
                    in_subscribe: response.data.friend[0].in_subscribe
                });
            }
            setRequestIsSended(response.data.RequestIsSended);
            setYouAreSubscriber(response.data.YouAreSubscriber);
            setYouDidRejected(response.data.YouDidRejected);
            setYouCanToAccept(response.data.YouCanToAccept);
        });
    }, [username]);

    const Profile = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        return axios.post('http://localhost:8000/api/profile/', 
        {   
            username: username
        }, 
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(response => {
            setProfile({
                id: response.data.user_data.id, 
                first_name: response.data.user_data.first_name, 
                last_name: response.data.user_data.last_name, 
                username: response.data.user_data.username, 
                email: response.data.user_data.email,
                phone: response.data.user_data.phone,
                bio: response.data.user_data.bio,
                last_activity: response.data.user_data.last_activity
            });
            setIsOwner(response.data.isOwner);
        })
        .catch(error => {
            setProfile(prevState => ({
                ...prevState,
                message: 'Authentication failed'
            }));
        });
    }, [username]);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([Profile(), ProfileFriends()]);
            setLoader(false);
        };

        fetchData();

        const timer = async () => {
            setTimeout(() => setNoTime(true), 5000);
        };
        if (state) {
            timer();
        }
    }, [navigate, state, ProfileFriends, Profile]);

    const [text, setText] = useState('');
    const [isActive, setIsActive] = useState(false);

    const UseModal = (currentText) => {
        setText(currentText);
        setIsActive(true);
    };

    return (
        <div style={{ width: '100%' }}>
            {loader ? <title>⠀</title> : <title>{profile.first_name} {profile.last_name}</title>}
            {!loader &&
            <div>
                <title>{profile.first_name} {profile.last_name}</title>
            {state && 
                <div style={noTime 
                ? { position: 'absolute', right: '-500px', top: '90px', opacity: '0', transition: '2s ease all' } 
                : { position: 'absolute', right: '10px', top: '90px' }}>
                    <Info info={state}/>
                </div>
            }   
            <div style={{ display: 'flex', position: 'relative' }}>
                <div className='element' style={{ width: '300px', height: '300px' }}></div>
                <div className='element' style={{ width: '100%', height: '300px'}}>
                    <div style={{ marginTop: '-15px', marginLeft: '15px', marginRight: '15px' }}>
                        <div style={{ display: 'flex', width: '100%' }}>
                            <h1 style={{ marginTop: '30px', marginRight: '10px' }}>{profile.first_name} {profile.last_name}</h1>
                            {isOwner ?
                                <Link to='/profile/edit' style={{ marginLeft: 'auto' }}>
                                    <button className='edit_butt' to='/edit'>Edit profile</button>
                                </Link>
                                : 
                                <p style={{ marginLeft: 'auto', marginTop: '35px' }}>{profile.last_activity}</p>
                            }
                        </div>
                        <p style={{ marginTop: '-15px', wordBreak: 'break-all' }}>{profile.bio.status}</p>
                        <div style={{marginTop: '50px'}}>
                            {profile.bio.birthday_day && profile.bio.birthday_month && profile.bio.birthday_year &&
                                <p>Birthday: <span style={{ color: 'rgb(0, 112, 224)'}}>{profile.bio.birthday_day} {profile.bio.birthday_month} {profile.bio.birthday_year}</span></p>
                            }
                            <Link className='more-detail'>More information about user</Link>
                        </div>
                        {!isOwner &&  
                            <div style={{top: '250px', position: 'absolute', right: '25px', display: 'flex' }}>
                                <button className='request_butt' style={{marginRight: '20px'}}>Send message</button>
                                {isFriends.id ? 
                                <div>
                                    {isFriends.is_accept && <button className='is_friend_butt' onClick={() => UseModal('Remove user from friends?')}>You are friends</button>}
                                    {RequestIsSended && <button className='is_friend_butt' onClick={() => UseModal('Cancel friend request?')}>Request is sended</button>}
                                    {YouAreSubscriber && <button className='is_friend_butt' onClick={() => UseModal('Unsubscribe from user?')}>You are subscribed</button>}
                                    {YouDidRejected && <button onClick={() => ToBeFriends(isFriends.id, ProfileFriends)} className='request_butt'>To be friends</button>}
                                    {YouCanToAccept && <button onClick={() => ToBeFriends(isFriends.id, ProfileFriends)} className='request_butt'>Accept request</button>}
                                </div>
                                :
                                <button onClick={() => SendRequest(profile.id, ProfileFriends)} className='request_butt'>Add to friend</button>
                                }
                            </div>
                        }
                    </div>
                </div>  
            </div>
            {isActive && <ModalWindow setIsActive={setIsActive} setIsFriends={setIsFriends} friend_id={isFriends.id} text={text}/>}
            <OnlineStatus />
            <Logout setAuth={props.setAuth}/>
            </div>}
        </div>
    );
    
};

export default Profile;
