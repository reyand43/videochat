import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import ss from 'socket.io-stream';
import { socketUrl } from '../../config/vars';

const DEFAULT_SOCKET = {};

ss.forceBase64 = true;
const SocketContext = React.createContext(DEFAULT_SOCKET);

const EVENT_LISTENERS = {};

const SocketContextProvider = (props) => {
    const { children } = props;
    const eventsToSendRef = useRef();
    const socketRef = useRef();
    const isConnectingRef = useRef();

    const emitEvent = useCallback((event, data) => {
        console.log("EMIT EVENT", event)
        return new Promise((resolve, reject) => {
            if (socketRef.current) {
                socketRef.current.emit(event, data, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            } else {
                resolve();
            }
        });
    }, []);

    // eslint-disable-next-line consistent-return
    const emitEventAnyway = useCallback((event, data) => {
        if (socketRef.current) {
            return emitEvent(event, data);
        }
        if (!eventsToSendRef.current) {
            eventsToSendRef.current = [];
        }
        eventsToSendRef.current.push({
            event,
            data,
        });
    }, [emitEvent]);

    const subscribeOnEvent = useCallback((event, handler) => {
        if (socketRef.current) {
            socketRef.current.on(event, handler);
        }

        EVENT_LISTENERS[event] = EVENT_LISTENERS[event] || [];
        EVENT_LISTENERS[event].push(handler);
    }, [socketRef.current]);

    const unsubscribeFromEvent = useCallback((event, handler) => {
        if (socketRef.current) {
            socketRef.current.removeListener(event, handler);
        }

        if (EVENT_LISTENERS[event]?.length) {
            EVENT_LISTENERS[event] = EVENT_LISTENERS[event].filter(el => el !== handler);

            if (!EVENT_LISTENERS[event]?.length) {
                delete EVENT_LISTENERS[event];
            }
        }
    }, []);

    const initSocket = useCallback(() => {
        if (isConnectingRef.current || socketRef.current) return;
        isConnectingRef.current = true;

        const connectionOptions = {
            transports: ['websocket'],
        };
        const socket = io(socketUrl, connectionOptions);

        const events = Object.keys(EVENT_LISTENERS);
        events.map(event => {
            EVENT_LISTENERS[event].map(handler => {
                socket.on(event, handler);
            });
        });

        socket.on('connect', () => {
            isConnectingRef.current = false;
            socketRef.current = socket;
            if (eventsToSendRef.current) {
                eventsToSendRef.current.map(({ event, data }) => emitEvent(event, data));
                eventsToSendRef.current = [];
            }
        });
        socket.on('disconnect', () => {
            socketRef.current = null;
            isConnectingRef.current = false;
        });
    }, []);

    const disconnect = useCallback((clearCache = true) => {
        if (!socketRef.current) return;
        socketRef.current.disconnect();
        if (clearCache) {
            eventsToSendRef.current = [];
        }
    }, []);

    useEffect(() => {
        initSocket();
    }, []);

    const actions = {};

    return (
        <SocketContext.Provider value={{
            actions,
            socket: socketRef.current,
            subscribeOnEvent,
            unsubscribeFromEvent,
            ss,
            emitEvent,
            emitEventAnyway,
            disconnect,
            connect: initSocket,
        }}
        >
            {children}
        </SocketContext.Provider>
    );
};

SocketContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

SocketContextProvider.defaultProps = {
};

export {
    SocketContext,
    SocketContextProvider,
};
