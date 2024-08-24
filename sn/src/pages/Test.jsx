import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Test() {
    const [avatarUrl, setAvatarUrl] = useState(null);

    const username = 'neJImeHb'

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/get_avatar', { params: { username } });
                if (response.data.avatar_url) {
                    setAvatarUrl(response.data.avatar_url);
                }
            } catch (error) {
                console.error('Error fetching avatar:', error);
            }
        };

        fetchAvatar();
    }, [username]);

    return (
        <div>
            {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar"/>
            ) : (
                <p>Avatar not found</p>
            )}
        </div>
    );
}

export {Test};
