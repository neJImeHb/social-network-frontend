import React, { useEffect, useState } from "react";
import axios from "axios";

const CheckAuth = () => {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.get('http://localhost:8000/api/protected/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAuth(response.data);
        } catch (error) {
            console.error('Error during request: ', error);
            alert('Error during request');
        }
    };

    return (
        <div>
            <h1>{auth ? "Authenticated" : "Not Authenticated"}</h1>
        </div>
    );
}

export { CheckAuth };
