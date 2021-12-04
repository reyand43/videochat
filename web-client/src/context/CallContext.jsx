import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import useUserMedia from '../hooks/useUserMedia';
import useWebRTC2 from '../hooks/useWebRtc2';
import { UserContext } from './UserContext';

const DEFAULT_CALL = {};

const CallContext = React.createContext(DEFAULT_CALL);

const CallContextProvider = props => {
    const { children } = props;
    const {
        streamUserMedia,
    } = useUserMedia();
    const userContext = useContext(UserContext);

    // useWebRTC({
    //     userMedia: streamUserMedia,
    // });
    const { remoteStreams } = useWebRTC2({
        userMedia: streamUserMedia,
    })


    return (
        <CallContext.Provider
            value={{
                night: 6,
                remoteStreams,
            }}
        >
            {children}
        </CallContext.Provider>
    );
};

CallContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

CallContextProvider.defaultProps = {};

export { CallContext, CallContextProvider };
