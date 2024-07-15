import axios from 'axios';

const SendRequest = async (friend_id, ProfileFriends) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            const response = await axios.post(
                'http://localhost:8000/api/friend_request/',
                {
                    'friend_id': friend_id 
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log('Token not found');
    }
    ProfileFriends()
};

export { SendRequest };
