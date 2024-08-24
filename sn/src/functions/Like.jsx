import axios from 'axios'

const Like = async(post_id, deleting) => {
    const token = localStorage.getItem('access_token');
    try {
        await axios.post('http://localhost:8000/api/posts/like/', {
            'post_id': post_id,
            'deleting': deleting
        },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
    } catch (error) {
        console.error('Error fetching avatar:', error);
    }
}

export {Like}