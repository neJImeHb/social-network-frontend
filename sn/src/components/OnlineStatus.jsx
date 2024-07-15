import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OnlineStatus = (props) => {
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
        axios.get('http://localhost:8000/api/online/',
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .catch(error => {
            console.log(error)
        });
    } else {
        navigate('/login', { state: 'You did not authenticated!' });
    }
  }, [props.username, navigate])

  return null;
};

export {OnlineStatus};
