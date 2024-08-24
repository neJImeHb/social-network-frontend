import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'

import { LuLogOut } from "react-icons/lu";
import { IoIosSettings } from "react-icons/io";

function Dropdown({ name, setAuth }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }

        // Очистка эффекта
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    const navigate = useNavigate();

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');

        try {
            await axios.post('http://localhost:8000/api/logout/', {
                refresh: refreshToken
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            axios.defaults.headers.common['Authorization'] = null;
            setAuth(false)
            navigate('/login', {state: 'You have successfully logged out.'});
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    return (
        <div ref={dropdownRef}>
            <div onClick={toggleDropdown} className='header_list_div' style={isOpen ? { backgroundColor: 'rgb(55, 55, 55)', boxShadow: '0 0 10px rgb(55, 55, 55)' } : {}}>{name}</div>
            {isOpen && (
                <div style={{ backgroundColor: 'rgb(50, 50, 50)', boxShadow: '0 0 10px rgb(55, 55, 55)', marginRight: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button onClick={() => alert('Кнопка 1 нажата')} className='header_list_button'>
                            <span style={{ float: 'left' }}>Settings</span>
                            <IoIosSettings style={{ position: 'absolute', top: '12px', right: '5px' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleLogout} className='header_list_button' style={{ color: 'red', borderRadius: '0 0 5px 5px'}}>
                            <span style={{ float: 'left' }}>Logout</span>
                            <LuLogOut style={{ position: 'absolute', top: '12px', right: '5px' }} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dropdown;
