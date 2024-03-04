import {createContext, useContext, useEffect, useState} from 'react'
import { useAuth } from './AuthContext';
import io from 'socket.io-client'

const SocketContext = createContext();

export const useSocketContext=()=>{
    return useContext(SocketContext)
}

export const SocketContextProvider=({children})=>{
    const [socket ,setSocket]=useState(null)
    const [onlineUser,setOnlineUser]=useState([])
    const {authUser} = useAuth()
    useEffect(()=>{
        if(authUser){
            const socket = io("https://chatdemoapp.onrender.com/",{
query:{
    userId:authUser?._id,
}
            })
            socket.on("getOnlineUsers",(users)=>{
                setOnlineUser(users)
            });
            setSocket(socket)
            return () => socket.close();
        }else{
            if(socket){
                socket.close();
                setSocket(null)
            }
        }
    },[authUser])
    return(
<SocketContext.Provider value={{socket,onlineUser}}>
    {children}
    </SocketContext.Provider>
    )
}