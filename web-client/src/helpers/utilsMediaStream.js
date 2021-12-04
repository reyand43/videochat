function stopMediaStream(mediaStream) {
    if (!mediaStream) {
        return;
    }
    mediaStream.getTracks().forEach(track => {
        track.stop();
        mediaStream.removeTrack(track);
    });
}

function stopAudioStrem(mediaStream) {
    if (!mediaStream) {
        return;
    }
    mediaStream.getAudioTracks().forEach(track => {
        track.stop();
        mediaStream.removeTrack(track);
    });
}

function changeTracksState(tracks, enabled = true) {
    tracks.forEach(tr => {
        // eslint-disable-next-line no-param-reassign
        tr.enabled = enabled;
    });
}

function changeAudioState(mediaStream, status) {
    if (!mediaStream) return;
    const tracks = mediaStream.getAudioTracks();
    changeTracksState(tracks, status);
}

function changeVideoState(mediaStream, status) {
    if (!mediaStream) return;
    const tracks = mediaStream.getVideoTracks();
    changeTracksState(tracks, status);
}

module.exports = { stopMediaStream, changeAudioState, changeVideoState, stopAudioStrem };
