import React from "react";
import {Outlet , Navigate} from 'react-router-dom'
import { useAuth } from "../context/AuthContext";

export const VerifyUser = ()=>{
    const {authUser} = useAuth();
    return authUser ? <Outlet/> : <Navigate to={'/login'}/>
}