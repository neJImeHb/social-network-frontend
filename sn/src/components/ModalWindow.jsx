import React from 'react';
import axios from 'axios';

const ModalWindow = ({setIsActive, setIsFriends, friend_id, text}) => {
    const RemoveFriend = async() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.post('http://localhost:8000/api/remove_friend/', {
                'friend_id': friend_id
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
        }
        setIsFriends({
            id: '',
            from_user: '',
            to_user: '',
            is_accept: '',
            in_subscribe: ''
        })
        setIsActive(false)
    }
  return (
    <div>
        <div className="modal">
            <div className="modal-content">
                <h2 style={{textAlign: 'center', marginTop: '0px'}}>{text}</h2>
                <button className='floating-button' onClick={RemoveFriend}>Yes</button>
                <button className='floating-button' style={{marginLeft: '200px'}} onClick={() => setIsActive(false)}>No</button>
            </div>
        </div>
    </div>
  );
};

export { ModalWindow };
