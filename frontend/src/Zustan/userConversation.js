import { create } from 'zustand'

const userConversation = create((set)=>({
    selectedConversation : null,
    setSelectedConversation:(selectedConversation)=>set({selectedConversation}),
    message:[],
    setMessages:(message)=>set({message})
}));
export default userConversation;