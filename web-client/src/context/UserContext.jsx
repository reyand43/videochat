import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { SocketContext } from './SocketContext';
import { useDialog } from '../hooks/useDialog';
import { useBool } from '../hooks/useBool';
import useSocketHandler from '../hooks/useSocketHandler';
import { useRouter } from 'next/dist/client/router';
import { ROOM_PAGE } from '../const/CLIENT_URL';
import { SOCKET_EVENTS } from '../const/SOCKET_EVENTS';
import { CLIENT_URL } from '../const/CLIENT_URL';

const UserContext = React.createContext();

const UserContextProvider = (props) => {
    const socket = useContext(SocketContext)
    const connectionFailedDialog = useDialog();
    const { children } = props;
    const router = useRouter();
    const { subscribeOnEvent, unsubscribeFromEvent } = socket;
    const authSuccess = useBool();
    const [me, setMe] = useState()
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])

    useEffect(() => {
        console.log("USERS", users)
    }, [users])

    const onSendName = async (name) => {
        await socket.emitEvent(SOCKET_EVENTS.USER_NAME, name)
    }

    const onSendMessage = async (message) => {
        await socket.emitEvent(SOCKET_EVENTS.MESSAGE_SEND, message);
    }

    const handleConnectionSuccessed = () => {
        return null;
    }

    const handleConnectionFailed = () => {
        connectionFailedDialog.onShow();
    }

    const handleNameAccepted = async (data) => {
        await setMe(data.me)
        await setMessages(data.messages)
        router.push(CLIENT_URL.ROOM_PAGE)
    }

    const handleUserJoined = (data) => {
        setUsers(data)
    }

    const handleMessageReceived = useCallback((data) => {
        setMessages((m) => [ ...m, data]);
    }, []);

    useSocketHandler(
        SOCKET_EVENTS.USER_CONNECTION_SUCCESSED,
        handleConnectionSuccessed,
        subscribeOnEvent,
        unsubscribeFromEvent,
    );

    useSocketHandler(
        SOCKET_EVENTS.USER_CONNECTION_FAILED,
        handleConnectionFailed,
        subscribeOnEvent,
        unsubscribeFromEvent,
    );

    useSocketHandler(
        SOCKET_EVENTS.USER_NAME_ACCEPTED,
        handleNameAccepted,
        subscribeOnEvent,
        unsubscribeFromEvent,
    );

    useSocketHandler(
        SOCKET_EVENTS.USER_JOINED,
        handleUserJoined,
        subscribeOnEvent,
        unsubscribeFromEvent,
    );

    useSocketHandler(
        SOCKET_EVENTS.MESSAGE_RECEIVED,
        handleMessageReceived,
        subscribeOnEvent,
        unsubscribeFromEvent,
    );

    useEffect(() => {
        if (!authSuccess.value) {
            router.push(CLIENT_URL.INDEX_PAGE)
        }
    }, [])

    useEffect(() => {
        console.log("ME", me)
    }, [me])

    return (
        <UserContext.Provider value={{
            onSendName,
            connectionFailedDialog,
            onSendMessage,
            messages,
            users,
            me,
        }}
        >
            {children}
        </UserContext.Provider>
    );
};

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

UserContextProvider.defaultProps = {
};

export {
    UserContext,
    UserContextProvider,
};
