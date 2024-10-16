import {create} from "zustand";

const userConversation = create((set)=>({
    selectedConversation: null,
    setSelectedConversation:(selectedConversation)=>set({selectedConversation}),
    messages:[],
    setMessage:(messages)=>set({messages})
}));

export default userConversation