import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { Info } from '../components/Info';
import { OnlineStatus } from '../components/OnlineStatus';
import { SendRequest } from '../components/SendRequset';
import { ToBeFriends } from '../components/ToBeFriends';
import { ModalWindow } from '../components/ModalWindow';
import { CreateChat } from '../components/CreateChat';

import { Publicate } from '../components/Publicate';
import { UploadImage } from '../components/UploadImage';
import { MoreInformation } from '../components/MoreInformation';
import { ImageInput } from '../components/ImageInput';
import { ModalPost } from '../components/ModalPost';

import { MdAddPhotoAlternate } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import { FaRegCommentAlt } from "react-icons/fa";
import { GoShareAndroid } from "react-icons/go";
import { BsThreeDots } from "react-icons/bs";
import { Like } from '../functions/Like';

const Profile = ({ userID }) => {
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
        avatar: '',
        bio: {},
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
                if (response.data !== false) {
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
                } else { navigate('/404') }
            });
    }, [username, navigate]);

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
                    avatar: response.data.user_data.avatar,
                    bio: response.data.user_data.bio,
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

    const [avatarUrl, setAvatarUrl] = useState(null);

    const ProfileAvatar = useCallback(async () => {
        if (profile.avatar) {
            try {
                const response = await axios.get('http://localhost:8000/api/get_avatar/', { params: { username } });
                if (response.data.avatar_url) {
                    setAvatarUrl(response.data.avatar_url);
                }
            } catch (error) {
                console.error('Error fetching avatar:', error);
            }
        }
    }, [profile.avatar, username])

    const [posts, setPosts] = useState([])
    const [postsImages, setPostsImages] = useState([])
    const [postsDate, setPostsDate] = useState([])
    const [postsLikes, setPostsLikes] = useState([])

    const Posts = useCallback(async () => {
        if (profile.id) {
            const token = localStorage.getItem('access_token');
            try {
                const response = await axios.post('http://localhost:8000/api/posts/get_profile_posts/', {
                    'user_id': profile.id,
                    'is_friends': isFriends.is_accept
                },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                if (response.data.posts) {
                    setPosts(response.data.posts)
                    setPostsDate(response.data.posts_date)

                    if (response.data.posts_images) {
                        setPostsImages(response.data.posts_images)
                    }

                    if (response.data.likes) {
                        setPostsLikes(response.data.likes)
                        console.log(response.data.likes)
                    }
                }
            } catch (error) {
                console.error('Error fetching avatar:', error);
            }
        }
    }, [profile.id, isFriends.is_accept])

    const [infoMessage, setInfoMessage] = useState()

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([Profile(), ProfileAvatar(), ProfileFriends(), Posts()]).then(() => { setLoader(false) });
        };

        fetchData();

        const timer = async () => {
            setTimeout(() => setNoTime(true), 5000);
        };
        if (state || infoMessage) {
            timer();
        }

    }, [navigate, state, ProfileFriends, Profile, ProfileAvatar, infoMessage, Posts]);

    const [currentStatus, setCurrentStatus] = useState()
    const [lastActivity, setLastActivity] = useState()

    const socketRef = useRef(null);

    useEffect(() => {
        if (!loader && profile.id && !socketRef.current) {
            // Пример: передача списка user_ids через WebSocket URL
            const userIds = [profile.id]; // anotherUserIds - это список идентификаторов других пользователей

            socketRef.current = new WebSocket(`ws://localhost:8000/ws/users/status/${userIds.join(',')}/`);

            socketRef.current.onopen = () => {
                console.log('WebSocket connection established');
            };

            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setCurrentStatus(data.new_status)
                setLastActivity(data.last_activity)
                // Ожидаем, что data содержит user_id, new_status и last_activity
                console.log(`User ${data.user_id} status: ${data.new_status}, last activity: ${data.last_activity}`);
                // Обновление состояния для каждого пользователя
                console.log(data)
            };

            socketRef.current.onclose = () => {
                console.log('WebSocket connection closed');
            };

            return () => {
                socketRef.current.close();
            };
        }
    }, [profile.id, loader]);

    const [text, setText] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isUpload, setIsUpload] = useState(false)
    const [moreInfo, setMoreInfo] = useState(false)


    const UseModal = (currentText) => {
        setText(currentText);
        setIsActive(true);
    };

    const CreatingChat = async (user_id) => {
        const chatID = await CreateChat(user_id);
        if (chatID !== null) {
            navigate(`/messages/chat/${chatID}/companion/${user_id}`);
        } else { console.log('Error using CreateChat function') }
    }

    const [addPostForm, setAddPostForm] = useState('')
    const [modalImageInput, setModalImageInput] = useState(false)
    const [getSelectedImg, setGetSelectedImg] = useState()
    const [onlyFriendsCanSee, setOnlyFriendsCanSee] = useState(false)
    const [selectedImageFromInput, setSelectedImageFromInput] = useState(null);
    const textareaRef = useRef(null);

    const isAddPostFormNotEmpty = addPostForm !== '';

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            // Устанавливаем курсор в конец текста
            textareaRef.current.setSelectionRange(addPostForm.length, addPostForm.length);
        }
    }, [isAddPostFormNotEmpty, addPostForm]);

    const [openControl, setOpenControl] = useState({ 'id': null, 'is_open': false })

    function changeLikeButton(like_id, post_id, deleting) {
        const existingRecord = postsLikes.find(item => item.id === like_id);

        const lastRecord = postsLikes[postsLikes.length - 1];

        let updatedData;

        if (existingRecord) {
            // If record is exist - deleting her
            updatedData = postsLikes.filter(item => item.id !== like_id);
        } else {
            // If record is'nt exist - creating her
            updatedData = [
                ...postsLikes,
                { id: lastRecord.id + 1, post_id: post_id, from_user: userID }
            ];
        }

        // Updating state
        setPostsLikes(updatedData);
        // Updating information about likes under post on server
        Like(post_id, deleting)
    }

    const [showMore, setShowMore] = useState()

    return (
        <div style={{ width: '100%' }}>
            {loader ? <title>⠀</title> : <title>{profile.first_name} {profile.last_name}</title>}
            {!loader && avatarUrl && posts &&
                <div>
                    <title>{profile.first_name} {profile.last_name}</title>
                    {(state || infoMessage) &&
                        <div style={noTime
                            ? { position: 'absolute', right: '-500px', top: '90px', opacity: '0', transition: '2s ease all', zIndex: '1' }
                            : { position: 'absolute', right: '10px', top: '90px', zIndex: '1' }}>
                            <Info info={state} infoMessage={infoMessage} />
                        </div>
                    }
                    <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
                        {isOwner ?
                            <div className='avatar-div' style={{ width: '250px', height: '300px', position: 'relative' }} onClick={() => setIsUpload(true)}>
                                <p className='avatar-text' style={{ position: 'absolute' }}>Change photo</p>
                                {avatarUrl && <img src={avatarUrl} alt='' className='avatar' style={{ width: '250px', height: '300px', marginLeft: '0px', marginTop: '0px' }} />}
                            </div>
                            :
                            <div className='avatar-div-2' style={{ width: '250px', height: '300px', position: 'relative' }}>
                                <p className='avatar-text' style={{ position: 'absolute' }}>Change photo</p>
                                {avatarUrl && <img src={avatarUrl} alt='' className='avatar' style={{ width: '250px', height: '300px', marginLeft: '0px', marginTop: '0px' }} />}
                            </div>
                        }
                        <div className='element' style={{ width: '100%', height: '300px' }}>
                            <div style={{ marginTop: '-15px', marginLeft: '15px', marginRight: '15px' }}>
                                <div style={{ display: 'flex', width: '100%' }}>
                                    <h1 style={{ marginTop: '30px', marginRight: '10px' }}>{profile.first_name} {profile.last_name}</h1>
                                    {isOwner ?
                                        <Link to='/profile/edit' style={{ marginLeft: 'auto' }}>
                                            <button className='edit_butt' to='/edit'>Edit profile</button>
                                        </Link>
                                        :
                                        <p style={{ marginLeft: 'auto', marginTop: '35px' }}>{currentStatus ? 'Online' : lastActivity}</p>
                                    }
                                </div>
                                <p style={{ marginTop: '-15px', wordBreak: 'break-all' }}>{profile.bio.status}</p>
                                <div style={{ marginTop: '50px' }}>
                                    {!profile.bio.show && profile.bio.birthday_day && profile.bio.birthday_month && profile.bio.birthday_year &&
                                        <p>Birthday: <span style={{ color: 'rgb(0, 112, 224)' }}>{profile.bio.birthday_day} {profile.bio.birthday_month} {profile.bio.birthday_year}</span></p>
                                    }
                                    <Link className='more-detail' onClick={() => setMoreInfo(true)}>More information about user</Link>
                                </div>
                                {!isOwner &&
                                    <div style={{ top: '250px', position: 'absolute', right: '25px', display: 'flex' }}>
                                        <button className='request_butt' style={{ marginRight: '20px' }} onClick={() => CreatingChat(profile.id)}>Send message</button>
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
                    {userID === profile.id &&
                        <div>
                            {addPostForm === '' && !getSelectedImg ?
                                <div style={{ marginTop: '20px', marginBottom: '20px', width: 'calc(100% - 20px)', height: '50px', backgroundColor: '#212121', display: 'flex', marginLeft: '10px', boxSizing: 'border-box', borderRadius: '5px' }}>
                                    <div style={{ display: 'flex', width: '100%' }}>
                                        <input style={{ width: '100%', backgroundColor: '#212121', color: 'white', borderRadius: '5px 0 0 5px' }}
                                            value={addPostForm} onChange={(e) => setAddPostForm(e.target.value)} placeholder="What's new?" />
                                    </div>
                                    <MdAddPhotoAlternate className='add-photo' style={{ float: 'right', width: '25px', height: '25px', marginRight: '10px', marginTop: '10px', cursor: 'pointer' }} onClick={() => setModalImageInput(true)} />
                                </div>
                                :
                                <div style={{ marginTop: '10px', width: 'calc(100% - 20px)', height: '100%', backgroundColor: '#212121', marginLeft: '10px', boxSizing: 'border-box', borderRadius: '5px' }}>
                                    <div style={{ cursor: 'pointer', display: 'flex', width: '100%' }}>
                                        <textarea
                                            ref={textareaRef}
                                            value={addPostForm}
                                            onChange={(e) => setAddPostForm(e.target.value)}
                                            placeholder="Come on, add a description, it will be cooler!"
                                            style={{ height: '100px', marginLeft: '10px', marginTop: '10px', resize: 'none', width: '100%', backgroundColor: '#212121', color: 'white', outline: 'none', border: 'none' }}
                                        />
                                    </div>
                                    <hr style={{ opacity: '0.5', borderTop: '1px solid #333', marginLeft: '10px', marginRight: '10px', marginTop: '10px' }}></hr>
                                    <div className='image-div' style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                                        {selectedImageFromInput && <img src={selectedImageFromInput} alt="Uploaded" className='main-image' style={{ marginTop: '20px', maxWidth: '50%', maxHeight: '50%' }}
                                            onClick={() => setSelectedImageFromInput(null)} />}
                                        <p className='image-text'>Remove image</p>
                                    </div>
                                    {selectedImageFromInput && <hr style={{ opacity: '0.5', borderTop: '1px solid #333', marginLeft: '10px', marginRight: '10px', marginTop: '10px' }}></hr>}
                                    <div style={{ display: 'flex', opacity: '0.7' }}>
                                        <p style={{ marginLeft: '10px', marginTop: '7px' }}>Who can see?</p>
                                        <select className="edit_select" style={{ marginLeft: '-10px', marginTop: '-3px', transform: 'scale(0.8)' }} onChange={(e) => setOnlyFriendsCanSee(e.target.value)}>
                                            <option value={false}>All users</option>
                                            <option value={true}>Only friends</option>
                                        </select>
                                    </div>
                                    <hr style={{ opacity: '0.5', borderTop: '1px solid #333', marginLeft: '10px', marginRight: '10px', marginTop: '-20px' }}></hr>
                                    <div style={{ marginTop: '20px' }}>
                                        <div className='add-picture' style={{ position: 'relative', marginLeft: '10px', bottom: '10px', width: '120px' }}>
                                            <div style={{ cursor: 'pointer', width: '100px' }} onClick={() => setModalImageInput(true)}>
                                                <p style={{ position: 'absolute', left: '30px', top: '-2px' }}>Add picture</p>
                                                <MdAddPhotoAlternate style={{ width: '25px', height: '25px', marginRight: '10px', marginTop: '10px' }} />
                                            </div>
                                        </div>
                                        <button className="publicate_butt" style={{ float: 'right', marginTop: '-50px', marginRight: '10px' }}
                                            onClick={() => Publicate(addPostForm, getSelectedImg, onlyFriendsCanSee, setAddPostForm, setGetSelectedImg, setOnlyFriendsCanSee, setInfoMessage, Posts)}>Publicate</button>
                                    </div>
                                </div>
                            }
                        </div>
                    }
                    {posts && postsImages &&
                        <div>
                            <div>
                                {posts.map((el) => {
                                    const imgs = postsImages.find(i => i.file_name === el.file_name)
                                    const dates = postsDate.find(d => d.id === el.id)
                                    const likes = postsLikes.find(l => l.from_user === userID && l.post_id === el.id)
                                    const likesLength = postsLikes.filter(l => l.post_id === el.id)

                                    return (
                                        <div key={el.id} className='post-div' style={{ width: 'calc(100% - 20px)', marginLeft: '10px', backgroundColor: '#212121', display: 'flex', marginTop: '10px', borderRadius: '5px', maxWidth: '100%', marginBottom: '20px' }}>
                                            <div style={{ width: '100%', margin: '10px' }}>
                                                <div style={{ display: 'flex', position: 'relative' }}>
                                                    {avatarUrl && <img src={avatarUrl} alt='some' style={{ width: '50px', height: '60px', clipPath: 'circle(40%)', marginTop: '-5px', marginRight: '0px', marginLeft: '-5px' }} />}
                                                    <div style={{ marginLeft: '5px' }}>
                                                        <p style={{ marginTop: '5px' }}>{profile.first_name} {profile.last_name}</p>
                                                        {dates && <p style={{ opacity: '0.5', marginTop: '-15px' }}>{dates.date}</p>}
                                                    </div>
                                                    <BsThreeDots className='post-control' style={{ right: '10px', position: 'absolute', top: '5px' }} onClick={() => setOpenControl({ 'id': el.id, 'is_open': openControl.is_open ? false : true })} />
                                                    {openControl.id === el.id && openControl.is_open &&
                                                        <div className='opened-div' style={{ right: '0px', position: 'absolute' }}>
                                                            <BsThreeDots className='post-control' style={{ right: '10px', position: 'absolute', top: '5px', opacity: '0.5' }} onClick={() => setOpenControl({ 'id': el.id, 'is_open': openControl.is_open ? false : true })} />
                                                            {profile.id === userID ?
                                                                <div>
                                                                    <div style={{ marginTop: '3px' }}>
                                                                        <button className='opened-button'>Edit</button>
                                                                    </div>
                                                                    <div>
                                                                        <button className='opened-button'>Pin</button>
                                                                    </div>
                                                                    <div>
                                                                        <button className='opened-button'>Disable comments</button>
                                                                    </div>
                                                                    <div>
                                                                        <button className='opened-button'>Archivate</button>
                                                                    </div>
                                                                    <div>
                                                                        <button className='opened-button' style={{ borderRadius: '0 0 5px 5px', color: 'red' }}>Delete</button>
                                                                    </div>
                                                                </div>
                                                                :
                                                                <div>
                                                                    <div>
                                                                        <button className='opened-button' style={{ borderRadius: '0 0 5px 5px', color: 'red' }}>Report</button>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>}
                                                </div>
                                                <pre style={{ marginTop: '-5px', whiteSpace: 'pre-wrap', wordWrap: 'break-word', }}>
                                                    {el.description.length > 500 ? showMore !== el.id ? el.description.slice(0, 500) + '...' : el.description : el.description}
                                                </pre>
                                                {el.description.length > 500 &&
                                                    <div style={{ marginBottom: '10px', marginTop: '-10px' }}>
                                                        {showMore === el.id ?
                                                            <Link style={{ marginBottom: '10px', color: 'rgb(0, 112, 224)' }} onClick={() => setShowMore()}>Show less</Link>
                                                            :
                                                            <Link style={{ marginBottom: '10px', color: 'rgb(0, 112, 224)' }} onClick={() => setShowMore(el.id)}>Show more</Link>
                                                        }
                                                    </div>
                                                }
                                                {imgs && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                                    <img src={imgs.url} alt='url not found' style={{ maxWidth: '100%', maxHeight: '600px' }} />
                                                </div>}
                                                {likesLength && likesLength.length > 0 && <p style={{ opacity: '0.5' }}>{likesLength.length + 150} likes</p>}
                                                <div style={likesLength.length > 0 ? { marginTop: '-10px' } : {}}>
                                                    {likes ?
                                                        <BiSolidLike className='like' style={{ color: 'rgb(0, 112, 224)' }} onClick={() => changeLikeButton(likes.id, el.id, true)} />
                                                        :
                                                        <BiLike className='like' onClick={() => changeLikeButton(0, el.id, false)} />
                                                    }
                                                    <FaRegCommentAlt className='comment' />
                                                    <GoShareAndroid className='like' />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    }
                    {isActive && <ModalWindow setIsActive={setIsActive} setIsFriends={setIsFriends} friend_id={isFriends.id} text={text} />}
                    {isUpload && <UploadImage setIsUpload={setIsUpload} ProfileAvatar={ProfileAvatar} />}
                    {moreInfo && <MoreInformation setMoreInfo={setMoreInfo} bio={profile.bio} />}
                    {modalImageInput && <ImageInput setModalImageInput={setModalImageInput} setGetSelectedImg={setGetSelectedImg} setSelectedImageFromInput={setSelectedImageFromInput} />}
                    <OnlineStatus />
                </div>}
        </div >
    );

};

export default Profile;
