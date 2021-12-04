import { Typography } from '@material-ui/core';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FriendMessage } from '../../components/Messages/FriendMessage';
import { MyMessage } from '../../components/Messages/MyMessage';
import { UserContext } from '../../context/UserContext';
import useUserMedia from '../../hooks/useUserMedia';
import styles from './RoomPageContainer.module.scss';
import Video from '../../components/Video/Video';
import { CallContext } from '../../context/CallContext';

const RoomPageContainer = () => {
    const userContext = useContext(UserContext);
    const callContext = useContext(CallContext);

    const [message, setMessage] = useState('');
    const chatRef = useRef();

    const handleSendMessage = () => {
        if (!message.trim()) {
            return
        }
        userContext.onSendMessage(message);
        setMessage('')
    }

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [userContext.messages])

    const { streamUserMedia } = useUserMedia();

    return (
        <div className={styles.root}>
            <div className={styles.videos}>
                <Video stream={streamUserMedia}/>
                {callContext.remoteStreams?.map((s) => (
                    <Video stream={s.stream} key={s.socketId} muted={false} />
                ))}
            </div>

            <div className={styles.chat}>
                <Typography variant="h6">Chat</Typography>
                <Typography variant="subtitle1">{userContext.users?.length} users</Typography>
                <div className={styles.messages} ref={chatRef}>
                    {userContext.messages?.map((m) => {
                        if (m.senderSocketId === userContext.me.socketId) {
                            return (
                                <div className={styles.myMessage} key={m.id}>
                                    <MyMessage text={m.text} />
                                </div>
                            )
                        }
                        return (
                            <div className={styles.friendMessage} key={m.id}>
                                <FriendMessage text={m.text} name={m.senderName} />
                            </div>)
                    })}
                </div>
                <div className={styles.textfield}>
                    <input type="text" className={styles.input} value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button className={styles.sendButton} onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    )
}

export default RoomPageContainer