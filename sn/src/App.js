import './App.css';
import './css/input.css';
import './index.css';
import './css/pages.css';
import './css/components.css';
import './css/friends.css'
import './css/modal.css'
import './css/loader.css'
import React, { useEffect, useState, useCallback } from 'react';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import { Home } from './pages/Home';
import { CheckAuth } from './pages/CheckAuth';
import { CheckPsw } from './components/CheckPsw';
import { EditProfile } from './pages/EditProfile';
import { OnlineStatus } from './components/OnlineStatus';
import { Friends } from './pages/Friends';
import { AllRequest } from './pages/AllRequest';
import { Messages } from './pages/Messages';
import { CurrentChat } from "./components/CurrentChat";
import { Test } from './pages/Test';

import { CiSearch } from "react-icons/ci";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isReg = location.pathname === '/register' || location.pathname === '/login';

  const withBack = {
    backgroundColor: '#212121',
    height: '60px',
    boxShadow: '0 0 10px #212121',
  };

  const withoutBack = {
    height: '0px',
    opacity: '0',
    transition: '1s ease all',
  };

  const offLink = {
    marginTop: '-80px',
    display: 'flex',
    transition: '1s ease all',
  };

  const onLink = {
    marginTop: '20px',
    display: 'flex'
  };

  const [auth, setAuth] = useState(false);
  const [Name, setName] = useState('');
  const [username, setUsername] = useState('')

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (token || isReg) {
      try {
        const response = await axios.get('http://localhost:8000/api/protected/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAuth(response.data.auth);
        setName(response.data.first_name);
        setUsername(response.data.username);
      } catch (error) {
        console.error('Error during request: user is not authenticated');
      }
    } else {
      navigate('/login', { state: 'You did not authenticate!' });
    }
  }, [navigate, isReg]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div>
      <header className='static-block'>
        <div style={isReg ? withoutBack : withBack}>
          <div style={{ marginTop: '0px' }}>
            <div style={{ display: 'flex', marginLeft: '210px', marginRight: '210px', justifyContent: 'space-between' }}>
              <div style={isReg ? offLink : onLink}>
                <div style={{ marginTop: '-5px', display: 'flex' }}>
                  <Link className='header_a' style={{ color: 'rgb(0, 112, 224)' }} to='/'>Flour network</Link>
                  <input className='header_inp' placeholder='Find new friends' />
                  <CiSearch style={{ position: 'absolute', marginLeft: '200px', marginTop: '5px' }} />
                </div>
              </div>
              <div className='right_box' style={{ marginTop: '15px' }}>
                {auth ?
                  <Link className='header_l'>{Name}</Link>
                  : <Link className='header_l' to='/login'>Login</Link>
                }
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="App">
        <div className='Routes' style={isReg ? {} : { display: 'flex' }}>
          {!isReg &&
            <div style={{ marginTop: '10px', marginRight: '10px' }}>
              <div className='for_d'>
                <Link className='for_a' to={`/profile/${username}`}>My profile</Link>
              </div>
              <div className='for_d'>
                <Link className='for_a' to='/messages'>Messages</Link>
              </div>
              <div className='for_d'>
                <Link className='for_a' to={`/${username}/friends`}>Friends</Link>
              </div>
              <OnlineStatus />
            </div>
          }
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register auth={auth} />} />
            <Route path="/login" element={<Login auth={auth} checkAuth={checkAuth} current_username={username} />} />
            <Route path='/profile/:username' element={<Profile setAuth={setAuth} />} />
            <Route path="/auth" element={<CheckAuth />} />
            <Route path="/psw" element={<CheckPsw />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/:username/friends" element={<Friends />} />
            <Route path="/friends/all-request" element={<AllRequest />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/chat/:chat_id/companion/:user_id" element={<CurrentChat />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
