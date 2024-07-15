import axios from 'axios';
import {useNavigate} from 'react-router-dom'

const Logout = (props) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');

        try {
            await axios.post('http://localhost:8000/api/logout/', {
                refresh: refreshToken
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            axios.defaults.headers.common['Authorization'] = null;
            props.setAuth(false)
            navigate('/login', {state: 'You have successfully logged out.'});
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
};

export default Logout;