import React, {useState, useEffect} from 'react'
import axios from 'axios';

const UsersList = () => {
    const [Data, setData] = useState([])

    useEffect(() => {
        fetchData();
      }, []);
    
      const fetchData = async () => {
        try {
        const response = await axios.get('http://localhost:8000/users', {
            params: { option: 'Accessories' }
            });
          setData(response.data)
          console.log(response.data)
        } catch (error) {
          console.error('Error during request: ', error);
          alert('Error during request');
        }
      };

    return(
        <div>
            <div>
                <h2>UserList</h2>
                {Data.map((el) => (
                    <div key={el.id}>
                        <h2>{el.id}</h2>
                        <h2>{el.Name}</h2>
                        <h2>{el.Surname}</h2>
                        <h2>{el.Email}</h2>
                        <h2>{el.Password}</h2>
                        <h2>{el.Data}</h2>
                        <hr></hr>
                    </div>
                ))}
            </div>
        </div>
    )
}

export {UsersList}
