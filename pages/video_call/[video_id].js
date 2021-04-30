import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import VideoCall from "Utils/VideoCall";

export default function VideoId() {
  const router = useRouter();
  const socket = io();
  const { video_id } = router.query;
  const localStream = useRef({});
  const localVideo = useRef();
  const peer = useRef({});
  const remoteVideo = useRef();
  const initiator = useRef(false);
  const videoCall = new VideoCall();

  const [connecting, setConnecting] = useState(false);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    getUserMedia().then(() => {
      socket.emit("join", { roomId: video_id });
    });

    socket.on("init", () => {
      initiator.current = true;
    });

    socket.on("ready", () => {
      enter(video_id);
    });

    socket.on("desc", (data) => {
      if (data.type === "offer" && initiator.current) return;
      if (data.type === "answer" && !initiator.current) return;
      call(data);
    });

    socket.on("disconnected", () => {
      initiator.current = true;
    });

    socket.on("full", () => {
      //   setFull(true);
    });

    socket.on("newChatMessage", (message) => {
      //   setMessages((prev) => prev.concat(message));
    });

    socket.on("typing", ({ typing }) => {
      //   setPartnerTyping(typing);
    });
  }, []);

  const getUserMedia = () =>
    new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia =
        navigator.mediaDevices?.getUserMedia ||
        navigator.mediaDevices?.webkitGetUserMedia ||
        navigator.mediaDevices?.mozGetUserMedia ||
        navigator.mediaDevices?.msGetUserMedia;
      const op = {
        video: {
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 },
        },
        // require audio
        audio: true,
      };
      navigator.mediaDevices
        .getUserMedia(op)
        .then((stream) => {
          localStream.current = stream;
          localVideo.current.srcObject = stream;
          resolve();
        })
        .catch((err) => console.log(err) || reject(err));
    });

  const enter = (roomId) => {
      console.log("on enter")
    setConnecting(true);

    const peerObject = videoCall.init(localStream.current, initiator.current);

    peerObject.on("signal", (data) => {
      console.log("peer signal");
      const signal = {
        room: roomId,
        desc: data,
      };
      socket.emit("signal", signal);
    });

    peerObject.on("stream", (stream) => {
      remoteVideo.current.srcObject = stream;
      setConnecting(false);
      setWaiting(false);
    });

    peerObject.on("error", (err) => {
      console.log(err);
    });
    peer.current = peerObject;
  };

  const call = otherId => {
    videoCall.connect(otherId);
  };

  return (
    <div>
      <video autoPlay id="localVideo" muted ref={localVideo} />
      <video
        autoPlay
        // style={
        //   connecting || waiting ? { display: "none" } : { display: "block" }
        // }
        id="remoteVideo"
        ref={remoteVideo}
      />
       {connecting && (
          <div className='status'>
            <p>Establishing connection...</p>
          </div>
        )}
        {waiting && (
          <div className='status'>
            <p>Waiting for someone...</p>
          </div>
        )}
    </div>
  );
}
