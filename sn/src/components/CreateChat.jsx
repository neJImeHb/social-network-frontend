import axios from "axios";

const CreateChat = async (user_id) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            const response = await axios.post('http://localhost:8000/api/messages/create_chat/', {
                user_id: user_id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            return response.data;  // возвращаем ID чата
        } catch (error) {
            console.log(error);
            return null;  // можно вернуть null или бросить ошибку, в зависимости от логики
        }
    }
    return null;
}

export { CreateChat };
