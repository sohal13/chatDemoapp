import React, { useEffect, useRef, useState } from 'react'
import userConversation from '../../Zustan/userConversation';
import { useAuth } from '../../context/AuthContext';
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import axios from 'axios';
import { useSocketContext } from '../../context/SocketContext';
import notify from '../../assets/sound/notification.mp3'
const MessageContainer = ({ onBackUser }) => {

  const { selectedConversation, message , setMessages } = userConversation();
  const { socket, onlineUser } = useSocketContext();
  const id = selectedConversation?._id
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const leastMessageRef = useRef();
  const [sendData, setSendData] = useState("")

//socketIo
  useEffect(()=>{
    socket?.on("newMessage",(newMessage)=>{
      const sound = new Audio(notify);
      sound.play();
      setMessages([...message,newMessage])
    })

    return ()=> socket?.off("newMessage")
  },[socket, setMessages ,message])

  //scroller
  useEffect(() => {
    setTimeout(() => {
      leastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [message])

  //getMessages
  useEffect(() => {
    const getMessages = async () => {
      setLoading(true)
      try {
        if(selectedConversation === null) return ("Waitting for id")
        const msg = await axios.get(`/api/message/${id}`)
        console.log(msg);
        const data = await msg.data;
        if (data.success === false) {
          setLoading(false)
          console.log(data.messages);
        }
        console.log(data);
        setLoading(false)
        setMessages(data)
      } catch (error) {
        setLoading(false)
        console.log(error);
      } 
    }
    if(id) getMessages()
  }, [id, setMessages])


  //send messages
  const hadelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const sendMsg = await axios.post(`/api/message/send/${id}`, { messages: sendData })
      const data = sendMsg.data;
      if (data.success === false) {
        setLoading(false)
        console.log(data.messages);
      }
      setLoading(false)
      setSendData("")
      setMessages([...message , data])
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  }

  return (
    <div className='md:min-w-[500px] h-full flex flex-col py-2'>
      {selectedConversation === null ? (
        <div className='flex items-center justify-center w-full h-full'>
          <div className='px-4 text-center text-2xl text-gray-950 font-semibold flex flex-col items-center gap-2'>
            <p className="text-2xl">Welcome!!👋 {authUser.username}😉</p>
            <p className="text-lg">Select a chat to start messaging</p>
            <TiMessages className='text-6xl text-center' />
          </div>
        </div>
      ) : (
        <>
          <div className='flex justify-between gap-1 bg-sky-600 md:px-2  rounded-lg h-10 md:h-12'>
            <div className='flex gap-2 md:justify-between items-center w-full'>
              <div className=' md:hidden ml-1 self-center'>
                <button onClick={() => onBackUser(true)} className='bg-white rounded-full px-2 py-1 self-center'>
                  <IoArrowBackSharp size={25} />
                </button>
              </div>

              <div className='flex justify-between mr-2 gap-2'>
                <div className='self-center '>
                  <img className='rounded-full w-6 h-6 md:w-10 md:h-10 cursor-pointer'
                    src={selectedConversation?.profilepic} />
                </div>
                <span className='text-gray-950 self-center text-sm  md:text-xl font-bold'>
                  {selectedConversation?.username}
                </span>
              </div>
            </div>
          </div>
          <div className='flex-1 overflow-auto'>
            {loading && (
              <div className="flex w-full h-full flex-col items-center justify-center gap-4 bg-transparent ">
                <div className="loading loading-spinner"></div>
              </div>
            )}
            {!loading && message?.length === 0 && (
              <p className='text-center text-white items-center'>Send a message to start Conversation</p>
            )}
            {!loading && message?.length > 0 && message?.map((msg) => (
              <div className='text-white' key={msg?._id} ref={leastMessageRef}>
                <div className={`chat ${msg.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}>
                  <div className="chat-image avatar">
                  </div>
                  <div className={`chat-bubble ${msg.senderId === authUser._id ? 'bg-sky-600' : ''}`}>
                    {msg?.message}
                    </div>
                  <div className="chat-footer text-[10px] opacity-80">
                    {new Date(msg?.createdAt).toLocaleDateString('en-IN')}
                    {new Date(msg?.createdAt).toLocaleTimeString('en-IN',
                      { hour: 'numeric', minute: 'numeric' })}
                  </div>
                </div>
              </div>
            ))};
          </div>

          <form onSubmit={hadelSubmit} className=' rounded-full text-black'>
            <div className='w-full rounded-full flex items-center bg-white'>
              <input value={sendData} required onChange={(e) => setSendData(e.target.value)} id='message'
                type='text ' className='w-full bg-transparent outline-none px-4 rounded-full' />
              <button type='submit'>
                {loading ? <div className='loading loading-spinner'></div> :
                  <IoSend size={25} className='text-sky-700 cursor-pointer rounded-full bg-gray-800 w-10 h-auto p-1' />}
              </button>
            </div>
          </form>
        </>
      )}
    </div>

  )
}

export default MessageContainer