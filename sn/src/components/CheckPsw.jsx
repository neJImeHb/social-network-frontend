import React, { useState } from "react";
import axios from "axios";

const CheckPsw = () => {
    const [psw, setPsw] = useState('');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await axios.post(
                    'http://localhost:8000/api/check_psw/', 
                    { password: psw }, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setMsg(response.data.msg);
                console.log(response.data.msg);
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('Token not found');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" onChange={(e) => setPsw(e.target.value)} />
                <button type="submit">Continue</button>
            </form>
            {msg && <p>{msg}</p>}
        </div>
    );
};

export { CheckPsw };
