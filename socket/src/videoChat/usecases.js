// const iceServersProvider = require('./iceServersProvider');
const Kurento = require("../config/kurento");
const { CANDIDATE } = require("../const/SOCKET_EVENTS");
const kurentoClient = require("kurento-client");
const iceServersProvider = require("./iceServersProvider");
const IceCandidate = kurentoClient.getComplexType("IceCandidate");

const candidates = {};
const endpoints = {};

async function onCandidate({ socketId, candidate, mySocketId }) {
  if (!candidate) return;
  if (endpoints[mySocketId]?.[socketId]) {
    endpoints[mySocketId][socketId].addIceCandidate(IceCandidate(candidate));
  } else {
    candidates[mySocketId] = candidates[mySocketId] || {};
    candidates[mySocketId][socketId] = candidates[mySocketId][socketId] || [];
    candidates[mySocketId][socketId].push(candidate);
  }
}

async function userRemoved({ socketId }) {
  endpoints[socketId]?.[socketId].release();
  delete candidates[socketId]
  delete endpoints[socketId]
}

// Пришел оффер на паблиш
async function publish({ pipeline, offer, users, socketId, mySocketId, socket }) {
  const { answer, endpoint } = await createUserStream({
    pipeline,
    offer,
    socket,
    socketId,
    mySocketId,
  });
  users.addEndpoint({ endpoint, socketId });
  return answer;
}

// Пришел оффер на вью
async function view({ pipeline, offer, users, socketId, mySocketId, socket }) {
  const { answer, endpoint } = await createUserStream({
    pipeline,
    offer,
    socket,
    socketId,
    mySocketId,
  });
  const currentUser = users.users.find((u) => u.socketId === socketId);
  //await endpoint.connect(currentUser.endpoint);

  await currentUser.endpoint.connect(endpoint);
  return answer;
}

// async function iceCandidate({ candidate, callId }) {
//   const videoStream = videoStreams[callId];
//   if (videoStream) {
//     return videoStream.addCandidate(candidate);
//   }
//   candidateQueue[callId] = candidateQueue[callId] || [];
//   candidateQueue[callId].push(candidate);
// }

// async function stopView(user, callId) {
//   const stream = user.viewingStreams.find((s) => s.callId === callId);
//   if (!stream) {
//     throw new Error("Cant find video stream");
//   }

//   user.viewingStreams = user.viewingStreams.filter((s) => s.callId !== callId);
//   await releaseStream(stream);
// }

// async function stopPublish(user, callId) {
//   const stream = user.publishStreams.find((s) => s.callId === callId);
//   if (!stream) {
//     throw new Error("Cant find video stream");
//   }

//   user.publishStreams = user.publishStreams.filter((s) => s.callId !== callId);
//   await releaseStream(stream);
// }

// async function removeUserStreams(user) {
//   const streams = [...user.publishStreams, ...user.viewingStreams];
//   for (let i = 0; i < streams.length; i++) {
//     const stream = streams[i];
//     if (!stream) {
//       continue;
//     }
//     await releaseStream(stream);
//   }
//   user.removeStreams();
// }

// async function releaseStream(stream) {
//   await stream.endpoint.release();
//   delete videoStreams[stream.callId];
// }

async function createUserStream({ pipeline, offer, socket, socketId, mySocketId }) {
  const newPipeline = await getOrCreateInterviewPipeline(pipeline);
  const endpoint = await Kurento.createWebrtcEndpoint(newPipeline);
  endpoints[mySocketId] = endpoints[mySocketId] || {};
  endpoints[mySocketId][socketId] = endpoints[mySocketId][socketId] || null;
  endpoints[mySocketId][socketId] = endpoint;
  endpoint.on("OnIceCandidate", (event) =>
    socket.emit(CANDIDATE, { socketId, candidate: event.candidate })
  );
  endpoint.on("IceComponentStateChange", (e) =>
    console.log(new Date(), e.state)
  );
  endpoint.on("NewCandidatePairSelected", (e) => {
    console.log("NewCandidatePairSelected");
  });
  const iceServers = await iceServersProvider.getIceServersForKurento();
  await endpoint.setStunServerAddress(iceServers.stun.ip);
  await endpoint.setStunServerPort(iceServers.stun.port);
  await endpoint.setTurnUrl(iceServers.turn);
  
  const answer = await endpoint.processOffer(offer.sdp);
  await endpoint.gatherCandidates();

  if (candidates[mySocketId]?.[socketId]) {
    candidates[mySocketId][socketId].forEach((candidate) => {
      endpoint.addIceCandidate(IceCandidate(candidate));
    });
  }

  return { answer, endpoint };
}

async function getOrCreateInterviewPipeline(pipeline) {
  if (pipeline.getPipeline()) {
    const retrivedPipeline = await Kurento.retrive(pipeline.getPipeline().id);
    if (!retrivedPipeline) {
      pipeline.setPipeline(null);
      return getOrCreateInterviewPipeline(interview);
    }
    return retrivedPipeline;
  }
  const newPipeline = await Kurento.createPipeline();
  pipeline.setPipeline(newPipeline);
  return newPipeline;
}

// function flushCandidateQueue(callId) {
//   if (!candidateQueue[callId]) {
//     return;
//   }
//   videoStreams[callId].addCandidates(candidateQueue[callId]);
//   delete candidateQueue[callId];
// }

module.exports = {
  //getIceServers,
  publish,
  view,
  //iceCandidate,
  // removeUserStreams,
  // stopView,
  // stopPublish,
  onCandidate,
  userRemoved,
};
