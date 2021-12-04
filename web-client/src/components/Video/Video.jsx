import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Video.module.scss';

const Video = (props) => {
    const { stream, muted } = props;
    const videoRef = useRef();

    useEffect(() => {
        videoRef.current.srcObject = stream;
        videoRef.current.defaultMuted = muted;
        videoRef.current.muted = muted;
        videoRef.current.play()
        .then(() => console.log('VIDEO PLAY SUCCESSFULLY'))
        .catch((e) => console.log('VIDEO PLAY ERROR', e));
    }, [stream])
    return (
        <video
            className={styles.video}
            ref={videoRef}
            autoPlay
            playsInline
        />
    )
}

Video.propTypes = {
    muted: PropTypes.bool
}

Video.defaultProps = {
    muted: true
}

export default Video