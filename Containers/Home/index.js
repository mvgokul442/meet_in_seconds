import { useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const socket = io();
    socket.on("connect", () => {
      // console.log(socket.connected); // x8WIv7-mJelg7on_ALbx
    });
  }, []);

  function makeid() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  const CreateVideoCall = () => {
    const videoId = makeid();
    router.push("video_call/" + videoId);
  };
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full items-center flex flex-col sm:flex-row justify-between">
        <div className="w-full mb-10 sm:w-1/3 text-center text-white text-5xl">
          Meet In Seconds
        </div>
        <div className="border-l-2 border-fuchsia-600 sm:h-96"></div>
        <div className="flex flex-col items-center  sm:w-2/3 w-full">
          <div>
            <button
              className="bg-white hover:bg-white-700 text-pink-600 font-bold py-2 px-4 rounded-full"
              onClick={CreateVideoCall}
            >
              Create Video Call
            </button>
          </div>
          <div className="my-4 text-white font-bold">or</div>
          <div className="sm:w-3/5 w-4/5">
            <div className="flex items-center border-b border-teal-500 py-2">
              <input
                className="appearance-none bg-transparent border-none w-full text-white placeholder-pink-200 mr-3 py-1 px-2 leading-tight focus:outline-none"
                type="text"
                placeholder="paste the url eg:http://localhost:3000/video_cal/asdf"
                aria-label="Full name"
              />
              <button
                className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-white hover:bg-white hover:text-pink-600 text-sm border-4 text-white py-1 px-2 rounded"
                type="button"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
