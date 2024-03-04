import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate()
    const {setAuthUser} = useAuth();
    const [loading , setLoading] = useState(false);
    const [inputData , setInputData] = useState({})

    const handelInput=(e)=>{
        setInputData({
            ...inputData , [e.target.id]:e.target.value
        })
    }
console.log(inputData);
    const selectGender=(selectGender)=>{
        setInputData((prev)=>({
            ...prev , gender:selectGender === inputData.gender ? '' : selectGender
        }))
    }

    const handelSubmit=async(e)=>{
        e.preventDefault();
        setLoading(true)
        if(inputData.password !== inputData.confpassword.toLowerCase()){
            setLoading(false)
            return toast.error("Password Dosen't match")
        }
        try {
            const register = await axios.post(`/api/auth/register`,inputData);
            const data = register.data;
            if(data.success === false){
                setLoading(false)
                toast.error(data.message)
                console.log(data.message);
            }
            toast.success(data?.message)
            localStorage.setItem('chatapp',JSON.stringify(data))
            setAuthUser(data)
            setLoading(false)
            navigate('/login')
        } catch (error) {
            setLoading(false)
            console.log(error);
            toast.error(error?.response?.data?.message)
        }
    }

  return (
    <div className='flex flex-col items-center justify-center mix-w-full mx-auto'>
            <div className='w-full p-6 rounded-lg shadow-lg
          bg-gray-400 bg-clip-padding
           backderop-filter backdrop-blur-lg bg-opacity-0'>
  <h1 className='text-3xl font-bold text-center text-gray-300'>Register
                    <span className='text-gray-950'> Chatters </span>
                    </h1>
                    <form onSubmit={handelSubmit} className='flex flex-col text-black'>
                    <div>
                            <label className='label p-2' >
                                <span className='font-bold text-gray-950 text-xl label-text'>fullname :</span>
                            </label>
                            <input
                                id='fullname'
                                type='text'
                                onChange={handelInput}
                                placeholder='Enter Full Name'
                                required
                                className='w-full input input-bordered h-10' />
                        </div>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-gray-950 text-xl label-text'>username :</span>
                            </label>
                            <input
                                id='username'
                                type='text'
                                onChange={handelInput}
                                placeholder='Enter UserName'
                                required
                                className='w-full input input-bordered h-10' />
                        </div>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-gray-950 text-xl label-text'>Email :</span>
                            </label>
                            <input
                                id='email'
                                type='email'
                                onChange={handelInput}
                                placeholder='Enter email'
                                required
                                className='w-full input input-bordered h-10' />
                        </div>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-gray-950 text-xl label-text'>Password :</span>
                            </label>
                            <input
                                id='password'
                                type='password'
                                onChange={handelInput}
                                placeholder='Enter password'
                                required
                                className='w-full input input-bordered h-10' />
                        </div>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-gray-950 text-xl label-text'>Conf.Password :</span>
                            </label>
                            <input
                                id='confpassword'
                                type='text'
                                onChange={handelInput}
                                placeholder='Enter Confirm password'
                                required
                                className='w-full input input-bordered h-10' />
                        </div>

                        <div
                         id='gender' className="flex gap-2">
                        <label className="cursor-pointer label flex gap-2">
                        <span className="label-text font-semibold text-gray-950">male</span>
                        <input 
                        onChange={()=>selectGender('male')}
                        checked={inputData.gender === 'male'}
                        type='checkbox' 
                        className="checkbox checkbox-info"/>
                        </label>
                        <label className="cursor-pointer label flex gap-2">
                        <span className="label-text font-semibold text-gray-950">female</span>
                        <input 
                        checked={inputData.gender === 'female'}
                        onChange={()=>selectGender('female')}
                        type='checkbox' 
                        className="checkbox checkbox-info"/>
                        </label>
                        </div>

                        <button type='submit'
                            className='mt-4 self-center 
                            w-auto px-2 py-1 bg-gray-950 
                            text-lg hover:bg-gray-900 
                            text-white rounded-lg hover: scale-105'>
                           {loading ? "loading..":"Register"}
                            </button>
                    </form>

                    <div className='pt-2'>
                        <p className='text-sm font-semibold
                         text-gray-800'>
                            Dont have an Acount ? <Link to={'/login'}>
                                <span
                                    className='text-gray-950 
                            font-bold underline cursor-pointer
                             hover:text-green-950'>
                                    Login Now!!
                                </span>
                            </Link>
                        </p>
                    </div>
           </div>
           </div>
  )
}

export default Register