import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const AllRequest = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);

    const getRequests = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.get('http://localhost:8000/api/check_all_friend_request/', 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            .then(response => {
                if (response.data.data !== null) {
                    setRequests(response.data.data.friends); 
                    setUsers(response.data.data.users);
                    console.log(response.data.data);  
                }
            })
            .catch(error => {
                console.log(error);
            });
        } else {
            navigate('/login', { state: 'You did not authenticated!' });
        }
    }, [navigate]);

    useEffect(() => {
        getRequests();
    }, [getRequests]);

    const accept = async(request_id) => {
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
            .catch(error => {
                console.log(error)
            })
        }
        getRequests()
    }

    return (
        <div style={{width: '100%'}}>
            {requests ?
                <div>
                    {requests.map((request) => {
                        const user = users.find(user => user.id === request.from_user);
                        return (
                            <div style={{display: 'flex'}} key={request.id}>
                                <div className='element' style={{width: '100%'}}>
                                    <div style={{margin: '20px'}}>
                                        <Link className="sender_link" to={`/profile/${user.username}`}>{user.first_name} {user.last_name}</Link>
                                        <p>Date the request was sent: {request.date_send}</p>
                                        <button className="accept_butt" onClick={() => accept(request.id)}>Accept</button>
                                        <button className="reject_butt">Reject</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            : <h1 style={{textAlign: 'center'}}>Nobody wants to be your friend anymore :(</h1>}
        </div>
    );
}

export { AllRequest };
