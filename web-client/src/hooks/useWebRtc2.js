import { object } from "prop-types";
import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { SOCKET_EVENTS } from "../const/SOCKET_EVENTS";
import { SocketContext } from "../context/SocketContext";
import { UserContext } from "../context/UserContext";
import useSocketHandler from "./useSocketHandler";
import useUserMedia from "./useUserMedia";

const OFFER_OPTIONS = { offerToReceiveAudio: true, offerToReceiveVideo: true };

const CONNECTION_TYPE = {
  PUBLISH: "publish",
  VIEW: "view",
};

const iceServers = [
  { urls: ["stun:stun.l.google.com:19302"] },
  {
    urls: ["turn:78.46.107.230:3486"],
    username: "kurentoturn",
    credential: "kurentoturnpassword",
  },
];

const CALL_ROUTE = "v1:call:";
const SEND_EVENTS = {
  icecandidate: `${CALL_ROUTE}icecandidate`,
  offer: `${CALL_ROUTE}offer`,
  answer: `${CALL_ROUTE}answer`,
  peerInfo: `${CALL_ROUTE}peer_info`,
};

function useWebRTC() {
  const { streamUserMedia } = useUserMedia();
  const userContext = useContext(UserContext);
  const [myConnection, setMyConnection] = useState(null);
  const myConnectionRef = useRef(null);
  const [connections, setConnections] = useState([]);
  const socket = useContext(SocketContext);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const { subscribeOnEvent, unsubscribeFromEvent } = socket;

  useEffect(() => {
    console.log("myConnection", myConnection);
  }, [myConnection]);

  useEffect(() => {
    console.log("REMOTE STREAMS", remoteStreams);
  }, [remoteStreams]);

  // Добавляем треки если это не наш паблиш
  const handleTrack = useCallback(async (socketId, trackEvent) => {
    console.log("HANDLE TRACK FOR", socketId, trackEvent.track);
    setRemoteStreams((streams) => {
      const copy = [...streams];
      const userStreamIndex = copy.findIndex((s) => s.socketId === socketId);
      if (userStreamIndex === -1) {
        const stream = new MediaStream();
        stream.addTrack(trackEvent.track);
        copy.push({
          socketId,
          stream,
        });
        return copy;
      } else {
        copy[userStreamIndex].stream.addTrack(trackEvent.track);
        copy[userStreamIndex] = { ...copy[userStreamIndex] }
        return copy;
      }
    });
  }, []);

  // Отправляем свои айсы на сокет
  const handleIceCandidate = useCallback(
    async (socketId, iceCandidateEvent) => {
      console.log("SEND CANDIDATE TO", socketId);
      if (!iceCandidateEvent) return;
      const { candidate } = iceCandidateEvent;
      await socket.emitEvent(SEND_EVENTS.icecandidate, {
        candidate,
        socketId,
      });
    },
    [userContext]
  );

  // Инициализируем оффер на паблиш и отправляем на сокет
  const handleNegotiation = async (socketnegotiationEvent) => {
    console.log("!!!", myConnection);
    const offer = await myConnectionRef.current.createOffer();
    await myConnectionRef.current.setLocalDescription(offer);
    await socket.emitEvent(SEND_EVENTS.offer, {
      offer,
      type: CONNECTION_TYPE.PUBLISH,
    });
  };

  // Отправляем оффер на вью для собеседника
  const sendViewOffer = async (peerConnection, socketId) => {
    console.log("SEND OFFER TO", socketId);
    const offer = await peerConnection.createOffer(OFFER_OPTIONS);
    await peerConnection.setLocalDescription(offer);
    await socket.emitEvent(SEND_EVENTS.offer, {
      offer,
      type: CONNECTION_TYPE.VIEW,
      socketId,
    });
  };

  // Получаем и записываем ответ в корректные RTCpc
  const handleAddAnswer = useCallback(
    async ({ answer, socketId }) => {
      console.log("ANSWER", "for", socketId);
      const remoteDescription = new RTCSessionDescription({
        type: "answer",
        sdp: answer,
      });
      if (socketId) {
        await connections
          .find((c) => c.connectionId === socketId)
          .peerConnection.setRemoteDescription(remoteDescription);
        setConnections((c) => {
          const copy = [...c];
          const connectionIndex = connections.findIndex(
            (connection) => connection.connectionId === socketId
          );
          copy[connectionIndex] = {
            ...copy[connectionIndex],
            isRemoteAnswerSet: true,
          };
          return copy;
        });
        await handleAddQueuedIce(socketId);
      } else {
        await myConnection.peerConnection.setRemoteDescription(
          remoteDescription
        );
        setMyConnection((prev) => ({ ...prev, isRemoteAnswerSet: true }));
        handleAddQueuedIce();
      }
    },
    [connections, userContext, myConnection]
  );

  // Добавляем айсы из очереди к корректному RTCpc
  const handleAddQueuedIce = (socketId) => {
    if (socketId) {
      const connection = connections.find(
        (connection, index) => connection.connectionId === socketId
      );
      connection.iceCandidates.forEach((ice) => {
        connection.peerConnection.addIceCandidate(ice);
      });
    } else {
      myConnection.iceCandidates.forEach((c) => {
        myConnection.peerConnection.addIceCandidate(c);
      });
    }
  };

  // Получаем айсы с сокета и либо добавляем их корректному RTCpc либо кладем в очередь потому что не пришел ответ
  const handleCandidate = useCallback(
    ({ candidate, socketId }) => {
      console.log("GET CANDIDATE FOR", socketId);

      if (socketId === userContext.me.socketId) {
        if (!myConnection.isRemoteAnswerSet) {
          setMyConnection((prev) => ({
            ...prev,
            iceCandidates: [...myConnection.iceCandidates, candidate],
          }));
        } else {
          myConnection?.peerConnection.addIceCandidate(candidate);
        }
      } else {
        if (
          !connections.find(
            (connection) => connection.connectionId === socketId
          )?.isRemoteAnswerSet
        ) {
          setConnections((c) => {
            const copy = [...c];
            const connectionIndex = copy.findIndex(
              (connectionItem) => connectionItem.connectionId === socketId
            );
            copy[connectionIndex] = {
              ...copy[connectionIndex],
              iceCandidates: [
                ...copy[connectionIndex].iceCandidates,
                candidate,
              ],
            };
            return copy;
          });
        } else {
          connections
            .find((connection) => connection.connectionId === socketId)
            .peerConnection.addIceCandidate(candidate);
          setConnections((c) => {
            const copy = [...c];
            const connectionIndex = copy.findIndex(
              (connectionItem) => connectionItem.connectionId === socketId
            );
            copy[connectionIndex] = {
              ...copy[connectionIndex],
              iceCandidates: [
                ...copy[connectionIndex].iceCandidates,
                candidate,
              ],
            };
            return copy;
          });
        }
      }
    },
    [userContext.me, myConnection, connections]
  );

  // Создаю Свой стрим
  useEffect(() => {
    if (userContext.me && !myConnection && streamUserMedia) {
      const peerConnection = new RTCPeerConnection({ iceServers });
      streamUserMedia.getTracks().forEach((track) => {
        peerConnection.addTrack(track);
      });
      setMyConnection({
        peerConnection,
        isRemoteAnswerSet: false,
        iceCandidates: [],
        stream: null,
      });
      myConnectionRef.current = peerConnection;
    }
  }, [userContext.me, streamUserMedia]);

  // Подрубаю на мой стрим хендлеры
  useEffect(() => {
    if (
      myConnection &&
      !myConnection.isRemoteAnswerSet &&
      !myConnection.iceCandidates.length
    ) {
      console.log("CREATE HANDLERS STREAM ");

      myConnection.peerConnection.onicecandidate = handleIceCandidate.bind(
        this,
        userContext.me.socketId
      );
      // streamUserMedia.getTracks().forEach((track) => {
      //   myConnection.peerConnection.addTrack(track);
      // });
      //myConnection.peerConnection.ontrack = handleTrack.bind(this, null);
      handleNegotiation();
    }
  }, [myConnection]);

  // Создаем RTCpc для каждого нового собеседника с установленной связью
  useEffect(() => {
    if (userContext.users.length && userContext.me) {
      const newConnections = [];
      userContext.users
        .filter(
          (user) =>
            user.socketId !== userContext.me.socketId &&
            Boolean(user.endpoint) &&
            !connections
              .map((connection) => connection.connectionId)
              .includes(user.socketId)
        )
        .forEach((user) => {
          const peerConnection = new RTCPeerConnection({ iceServers });
          peerConnection.onicecandidate = handleIceCandidate.bind(
            this,
            user.socketId
          );
          peerConnection.ontrack = handleTrack.bind(this, user.socketId);
          newConnections.push({
            connectionId: user.socketId,
            peerConnection,
            isRemoteAnswerSet: false,
            iceCandidates: [],
          });
          sendViewOffer(peerConnection, user.socketId);
        });
      setConnections([...connections, ...newConnections]);
    }
  }, [userContext.users, userContext.me]);

  // Убираем RTCpc вышедших собеседников
  useEffect(() => {
    connections.forEach((connection, index) => {
      if (
        !userContext.users
          .map((user) => user.socketId)
          .includes(connection.connectionId)
      ) {
        setRemoteStreams((s) => {
          const copy = [...s];
          copy.splice(
            copy.findIndex(
              (c) => c.socketId === connections[index].connectionId
            ),
            1
          );
          return copy;
        });
        setConnections((c) => {
          const copy = [...c];
          copy.splice(index, 1);
          return copy;
        });
      }
    });
  }, [userContext.users]);

  // Добавляем треки к своему RTCpc после создания
  // useEffect(() => {
  //   if (
  //     myConnection &&
  //     !myConnection.isRemoteAnswerSet &&
  //     !myConnection.iceCandidates.length
  //   ) {
  //     addLocalTracks();
  //   }
  // }, [streamUserMedia, myConnection]);

  useSocketHandler(
    SOCKET_EVENTS.ANSWER,
    handleAddAnswer,
    subscribeOnEvent,
    unsubscribeFromEvent
  );

  useSocketHandler(
    SOCKET_EVENTS.CANDIDATE,
    handleCandidate,
    subscribeOnEvent,
    unsubscribeFromEvent
  );

  useEffect(() => {
    console.log("CONNECTIONS", connections);
  }, [connections]);

  return {
    remoteStreams,
  };
}

export default useWebRTC;
