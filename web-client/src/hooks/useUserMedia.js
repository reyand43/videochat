import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import {
    stopMediaStream,
    stopAudioStrem,
} from '../helpers/utilsMediaStream';

function useUserMedia() {
    const [stream, setStream] = useState();
    const [error, setError] = useState();
    const [forceUpdate, setForceUpdate] = useState();
    const userContext = useContext(UserContext);

    // const logging = msg => console.log('userMedia', msg);

    // useEffect(() => {
    //     if (error) logging(error);
    // }, [error]);

    const stopUserMedia = useCallback(() => {
        stopMediaStream(stream);
    }, [stream]);

    const stopMicStream = useCallback(() => {
        stopAudioStrem(stream);
    }, [stream]);

    // useEffect(() => {
    //     logging({ stream, error });
    // }, [stream, error]);

    useEffect(() => {
        if (!userContext.me) {
            return
        }
        let canceled = false;
        // logging({ constraints });
        stopUserMedia();
        setError();
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(
            _stream => {
                if (!canceled) {
                    setStream(_stream);
                    //setState(RESOLVED);
                }
            },
            _error => {
                if (!canceled) {
                    setError(_error);
                    //setState(REJECTED);
                }
            },
        );

        return () => {
            canceled = true;
            //stopUserMedia();
        };
    }, [forceUpdate, userContext.me]);

    // useEffect(() => {
    //     if (!localMediaStatus) return;
    //     if (state === RESOLVED) changeAudioState(stream, localMediaStatus.mic);
    // }, [localMediaStatus?.mic, stream, state]);

    // useEffect(() => {
    //     if (!localMediaStatus) return;
    //     if (state === RESOLVED) changeVideoState(stream, localMediaStatus.cam);
    // }, [localMediaStatus?.cam, stream, state]);

    useEffect(() => {
        return () => {
            stopUserMedia();
        };
    }, [stream]);

    useEffect(() => {
        return () => {
            stopUserMedia();
        };
    }, []);

    return {
        errorUserMedia: error,
        // stateUserMedia: state,
        streamUserMedia: stream,
        stopMicStream,
        stopUserMedia,
        setForceUpdate,
    };
}

export default useUserMedia;
