import axios from "axios"

const CreateChat = async(user_id) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        axios.post('http://localhost:8000/api/messages/create_chat/', {
            user_id: user_id
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
}

export {CreateChat}