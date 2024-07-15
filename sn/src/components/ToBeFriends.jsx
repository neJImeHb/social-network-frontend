import axios from "axios";

const ToBeFriends = async(friend_id, ProfileFriends) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        axios.post('http://localhost:8000/api/to_be_friends/', {
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
    ProfileFriends()
    
}

export {ToBeFriends}