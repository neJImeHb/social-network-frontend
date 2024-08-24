import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register(props) {
    const navigate = useNavigate()

    const [isOpen, setIsOpen] = useState(false);

    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordRepeat) {
            setErrorMessage('Passwords do not match.');
        } else {
            setErrorMessage('');
        }
        try {
            await axios.post('http://localhost:8000/api/register/', { first_name, last_name, username, email, phone, password });
            navigate('/login', {state: 'You are successfully registered! Sign in.'})
        } catch (error) {
            if (error.response && error.response.data) {
                setFieldErrors(error.response.data);
                console.log(fieldErrors.email)
            } else {
                alert('Registration failed');
            }
        }
    };

    useEffect(() => {
        if (props.auth === true) {
            navigate('/profile')
        }
        setIsOpen(true);
    }, [navigate, props.auth]);

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
            <title>Registration</title>
            <div style={{ flex: 1, backgroundColor: '#404040', color: 'rgb(0, 112, 224)', display: 'flex', 
                justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '-70px'}}>
                <h1>Flour <br /> Network</h1>
                <Link className='bar_a' to='https://www.youtube.com/watch?v=dQw4w9WgXcQ'>PLACE FOR IDEAS</Link>
            </div>
            <div style={{transition: '1s ease all', flex: 1, backgroundColor: '#000807', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{position: 'absolute', top: '0px'}}>REGISTRATION</p>
                    <div className="group"> 
                        <input type="text" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setFirstName(e.target.value)}/>
                        <span className="bar"></span>
                        <label className="lbl">Name*</label>
                    </div>
                    <div className="group">      
                        <input type="text" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setLastName(e.target.value)}/>
                        <span className="bar"></span>
                        <label className="lbl">Surname*</label>
                    </div>
                    <div className="group">      
                        <input type="text" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setUsername(e.target.value)}/>
                        <span className="bar"></span>
                        <label className="lbl">Username* {fieldErrors.username && <span className='errMsg'>{fieldErrors.username}</span>}</label>
                    </div>
                    <div className="group">      
                        <input type="text" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setEmail(e.target.value)}/>
                        <span className="bar"></span>
                        <label className="lbl">Email* {fieldErrors.email && <span className='errMsg'>{fieldErrors.email}</span>}</label>
                    </div>
                    <div className="group">      
                        <input type="text" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setPhone(e.target.value)}/>
                        <span className="bar"></span>
                        <label className="lbl">Phone* {fieldErrors.phone && <span className='errMsg'>{fieldErrors.phone}</span>}</label>
                    </div>
                    <div className="group">      
                        <input type="password" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setPassword(e.target.value)}/>
                        <span className="bar"></span>
                        <label className="lbl">Password*</label>
                    </div>
                    <div className="group">      
                        <input type="password" required 
                        style={{background: 'none', color: 'white', width: '100%', marginBottom: '10px'}} 
                        onChange={(e) => setPasswordRepeat(e.target.value)}/>
                        <span className="bar"></span>
                        <label className="lbl">Password (repeat)* <span className='errMsg'>{errorMessage}</span></label>
                    </div>
                    <button type="submit" className='reg_butt'>Register</button>
                    <Link className='acc' to='/login'>Already have an account?</Link>
                </form>
            </div>
        </div>
    );
}

export default Register;
