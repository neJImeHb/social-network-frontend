import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { Info } from '../components/Info';

function Login(props) {
    const navigate = useNavigate();

    const location = useLocation();
    const { state } = location;

    const [noTime, setNoTime] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/login/', { username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            await props.checkAuth();
            navigate('/', { state: 'You are successful logined!' });
        } catch (error) {
            setErrorMessage('Email and password do not match');
        }
    };

    useEffect(() => {
        const timer = async() => {
            setTimeout(() => setNoTime(true), 5000)
        }
        if (state) {
            timer()
        }
        if (props.auth === true) {
            navigate(`/profile/${props.current_username}`)
        }
        setIsOpen(true);
    }, [navigate, props.auth, state, props.current_username]);

    const opening = {
        display: 'flex', height: '110vh', marginLeft: '-220px', marginRight: '-220px', marginBottom: '-20px', 
        transition: '1s ease all', opacity: '1', marginTop: '-100px'
    }

    const closing = {
        display: 'flex', height: '110vh', marginLeft: '-220px', marginRight: '-220px', marginBottom: '-20px', 
        transition: '1s ease all', opacity: '0', marginTop: '-100px'
    }

    return (
        <div style={isOpen ? opening : closing}>
            <title>Authorisation</title>
            {state && 
                <div style={noTime 
                ? {position: 'absolute', right: '-500px', top: '90px', opacity: '0', transition: '2s ease all'} 
                : {position: 'absolute', right: '10px', top: '90px'}}>
                    <Info info={state}/>
                </div>
            }  
            <div style={{ flex: 1, backgroundColor: '#404040', color: 'rgb(0, 112, 224)', display: 'flex', 
                justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '-70px'}}>
                <h1>Flour <br /> Network</h1>
                <Link className='bar_a' to='/'>RETURN AT HOME</Link>
            </div>
            <div style={{transition: '1s ease all', flex: 1, backgroundColor: '#000807', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{position: 'absolute', top: '200px'}}>AUTHORISATION</p>
                    <div className="group"> 
                        <input type="text" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setUsername(e.target.value)} />
                        <span className="bar"></span>
                        <label className="lbl">Email*</label>
                    </div>
                    <div className="group"> 
                        <input type="password" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setPassword(e.target.value)} />
                        <span className="bar"></span>
                        <label className="lbl">Password* <span className='errMsg'>{errorMessage}</span></label>
                    </div>
                    <button type="submit" className='reg_butt'>Log in</button>
                    <Link className='acc' to='/register'>Don't have an account?</Link>
                </form>
            </div>
        </div>
    );
}

export default Login;
