import axios from 'axios'

const Publicate = (addPostForm, getSelectedImg, onlyFriendsCanSee, setAddPostForm, setGetSelectedImg, setOnlyFriendsCanSee, setInfoMessage, Posts) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    if (getSelectedImg) {
        formData.append('file', getSelectedImg); // getSelectedImg теперь объект файла
    }
    formData.append('description', addPostForm);
    formData.append('only_friends_can_see', onlyFriendsCanSee);

    axios.post('http://localhost:8000/api/posts/publicate/', formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });

    setAddPostForm('')
    setGetSelectedImg(null)
    setOnlyFriendsCanSee(false)
    setInfoMessage('Published successfully!')
    Posts()
}


export { Publicate }