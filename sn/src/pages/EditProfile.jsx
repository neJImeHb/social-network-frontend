import React, { useEffect, useState } from "react";
import axios from "axios";

import { Info } from "../components/Info";

const EditProfile = () => {

    const [status, setStatus] = useState('');
    const [biography, setBiography] = useState('')
    const [day, setDay] = useState(0);
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);

    const [msg, setMsg] = useState('')

    const getBio = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await axios.get(
                    'http://localhost:8000/api/get_bio/',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                if (response.data.status) {
                    setStatus(response.data.status);
                }
                if (response.data.biography) {
                    setBiography(response.data.biography)
                }
                if (response.data.birthday_day) {
                    setDay(response.data.birthday_day);
                }
                if (response.data.birthday_month) {
                    setMonth(response.data.birthday_month);
                }
                if (response.data.birthday_year) {
                    setYear(response.data.birthday_year);
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('Token not found');
        }
    };

    useEffect(() => {
        getBio();
    }, []);

    const [noTime, setNoTime] = useState(false);

    const editBio = async() => {

        setNoTime(false)

        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await axios.post(
                    'http://localhost:8000/api/get_bio/', {
                        'status': status,
                        'biography': biography,
                        'birthday_day': day,
                        'birthday_month': month,
                        'birthday_year': year,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setMsg(response.data.msg)
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('Token not found');
        }

        const timer = async() => {
            setTimeout(() => setNoTime(true), 5000)
        }
        
        timer()
    }

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div style={{ width: '100%' }}>
            <title>Edit</title>
            {msg && 
                <div style={noTime 
                ? {position: 'absolute', right: '-500px', top: '90px', opacity: '0', transition: '2s ease all'} 
                : {position: 'absolute', right: '10px', top: '90px'}}>
                    <Info info={msg}/>
                </div>
            } 
            <h1>Edit profile</h1>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <p className="width_p" style={{ marginRight: '10px' }}>Status:</p>
                <input
                    className="edit_inp"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    maxLength='50'
                    style={{ flex: '1' }}
                />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <p className="width_p" style={{ marginRight: '10px' }}>Biography:</p>
                <textarea
                    className="edit_area"
                    style={{ flex: '1' }}
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                />
            </div>


            <div style={{ display: 'flex', alignItems: 'center' }}>
                <p className="width_p" style={{ marginRight: '10px' }}>Birthday:</p>
                <select className="edit_select" style={{ marginRight: '10px' }} onChange={(e) => setDay(e.target.value)}>
                    {day ? <option>{day}</option> : <option value=''>Day</option>}
                    {days.map((el) => (
                        <option className="edit_opt" key={el} value={el}>{el}</option>
                    ))}
                </select>
                <select className="edit_select" style={{ marginRight: '10px' }} onChange={(e) => setMonth(e.target.value)}>
                    {month ? <option>{month}</option> : <option value=''>Month</option>}
                    {months.map((el) => (
                        <option className="edit_opt" key={el} value={el}>{el}</option>
                    ))}
                </select>
                <select className="edit_select" onChange={(e) => setYear(e.target.value)}>
                    {year ? <option>{year}</option> : <option value=''>Year</option>}
                    {years.map((el) => (
                        <option className="edit_opt" key={el} value={el}>{el}</option>
                    ))}
                </select>
            </div>
            <button className="save_butt" onClick={editBio}>Save</button>
        </div>
    );
};

export { EditProfile };