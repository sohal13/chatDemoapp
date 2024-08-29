import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackSharp } from 'react-icons/io5';
import { BiLogOut } from 'react-icons/bi';
import userConversation from '../../Zustan/userConversation';
import { useSocketContext } from '../../context/SocketContext';

const Sidebar = ({ onSelectUser }) => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();
    const { socket, onlineUser } = useSocketContext();
    const [searchInput, setSearchInput] = useState('');
    const [searchUser, setSearchUser] = useState([]);
    const [chatUser, setChatUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { message, selectedConversation, setSelectedConversation } = userConversation();
    const [newMessageUsers, setNewMessageUsers] = useState([]);

    // Fetch chat users
    useEffect(() => {
        const fetchChatUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/user/currentchatters');
                const data = response.data;
                if (Array.isArray(data)) {
                    // Validate each user object
                    const validData = data.filter(user => user && user._id && user.profilepic);
                    setChatUser(validData);
                } else {
                    console.error('Unexpected data format:', data);
                    setChatUser([]);
                }
            } catch (error) {
                console.error('Error fetching chat users:', error);
                setChatUser([]);
            } finally {
                setLoading(false);
            }
        };
        fetchChatUsers();
    }, []);

    // Handle search submit
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const search = await axios.get(`/api/user/search?search=${searchInput}`);
            const data = search.data;
            if (data.success === false) {
                setLoading(false);
                console.log(data.message);
            }
            setLoading(false);
            if (data.length === 0) {
                toast.info("User Not Found");
            } else {
                setSearchUser(data);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    // Handle user click
    const handleUserClick = (user) => {
        onSelectUser(user);
        setSelectedUserId(user._id);
        setSelectedConversation(user);
    };

    // Handle back from search result
    const handleSearchBack = () => {
        setSearchUser([]);
        setSearchInput('');
    };

    // Listen for new messages
    useEffect(() => {
        if (!socket) {
            console.error('Socket is not initialized');
            return;
        }

        const handleNewMessage = (newMessage) => {
            console.log('New message received:', newMessage); // Debugging line
            setNewMessageUsers(prev => [...prev, newMessage]);
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket]);

    // Handle logout
    const handleLogout = async () => {
        const confirmLogout = window.prompt("Type 'UserName' to LOGOUT");
        if (confirmLogout === authUser.username) {
            setLoading(true);
            try {
                const logout = await axios.post('/api/auth/logout');
                const data = logout.data;
                if (data?.success === false) {
                    setLoading(false);
                    console.log(data?.message);
                }
                toast.info(data?.message);
                localStorage.removeItem('chatapp');
                setAuthUser(null);
                setLoading(false);
                navigate('/login');
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        } else {
            toast.info("Logout Cancelled");
        }
    };

    return (
        <div className='h-full w-auto px-1'>
            <div className='flex justify-between gap-2'>
                <form onSubmit={handleSearchSubmit} className='w-auto flex items-center justify-between bg-gray-900 rounded-full'>
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        type='text'
                        className='px-4 w-auto bg-transparent outline-none rounded-full'
                        placeholder='Search user'
                    />
                    <button className='btn btn-circle bg-sky-700 hover:bg-white'>
                        <FaSearch />
                    </button>
                </form>
                <img
                    onClick={() => navigate(`/profile/${authUser?._id}`)}
                    src={authUser?.profilepic}
                    className='self-center h-12 w-12 hover:scale-110 cursor-pointer'
                    alt='User Profile'
                />
            </div>
            <div className='divider px-3'></div>
            {searchUser?.length > 0 ? (
                <>
                    <div className="min-h-[70%] max-h-[80%] overflow-y-auto scrollbar">
                        <div className='w-auto'>
                            {searchUser.map((user, index) => (
                                <div key={user._id}>
                                    <div
                                        onClick={() => handleUserClick(user)}
                                        className={`flex gap-3 items-center rounded text-white p-2 py-1 cursor-pointer ${selectedUserId === user?._id ? 'bg-sky-500' : ''}`}>
                                        <div className={`avatar ${onlineUser.includes(user._id) ? 'online' : ''}`}>
                                            <div className="w-12 rounded-full">
                                                <img src={user.profilepic} alt='user.img' />
                                            </div>
                                        </div>
                                        <div className='flex flex-col flex-1'>
                                            <p className='font-bold text-white'>{user.username}</p>
                                        </div>
                                    </div>
                                    <div className='divider divide-solid px-3 h-[1px]'></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='mt-auto px-1 py-1 flex'>
                        <button onClick={handleSearchBack} className='bg-white rounded-full px-2 py-1 self-center'>
                            <IoArrowBackSharp size={25} />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="min-h-[70%] max-h-[80%] overflow-y-auto scrollbar">
                        <div className='w-auto'>
                            {chatUser.length === 0 ? (
                                <div className='font-bold items-center flex flex-col text-xl text-yellow-500'>
                                    <h1>Why are you Alone!!🤔</h1>
                                    <h1>Search username to chat</h1>
                                </div>
                            ) : (
                                chatUser.map((user, index) => {
                                    // Check if the user has new messages
                                    const hasNewMessage = newMessageUsers.some(
                                        newMsg => newMsg.receiverId === authUser._id && newMsg.senderId === user._id
                                    );
                                    console.log(`User ID: ${user._id}, Has New Message: ${hasNewMessage}`); // Debugging line
                                    return (
                                        <div key={user._id}>
                                            <div
                                                onClick={() => handleUserClick(user)}
                                                className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer ${selectedUserId === user._id ? 'bg-sky-500' : ''}`}
                                            >
                                                <div className={`avatar ${onlineUser.includes(user._id) ? 'online' : ''}`}>
                                                    <div className="w-12 rounded-full">
                                                        <img 
                                                            src={user.profilepic || 'https://gravatar.com/avatar/HASH'} 
                                                            alt='user.img' 
                                                        />
                                                    </div>
                                                </div>
                                                <div className='flex flex-col flex-1'>
                                                    <p className='font-bold text-white'>{user.username || 'Unknown User'}</p>
                                                </div>
                                                {hasNewMessage && selectedConversation?._id !== user._id && (
                                                    <div className="rounded-full bg-green-700 text-sm text-white px-[4px]">+1</div>
                                                )}
                                                
                                            </div>
                                            <div className='divider divide-solid px-3 h-[1px]'></div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <div className='mt-auto px-1 py-1 flex'>
                        <button onClick={handleLogout} className='hover:bg-red-600 w-10 cursor-pointer hover:text-white rounded-lg'>
                            <BiLogOut size={25} />
                        </button>
                        <p className='text-sm py-1'>Logout</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default Sidebar;
