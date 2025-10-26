import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
// import { set } from "mongoose";

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const [ham, setHam] = useState(false);
  const synth = window.speechSynthesis;

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    if(!isSpeakingRef.current && !isRecognizingRef.current){
      try {
        recognitionRef.current?.start();
        // setListening(true);
        console.log("Recognition requested to start")
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Recognition error:", error);
        }
      }

    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    isSpeakingRef.current = true;

    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      // recognitionRef.current?.start();
      setTimeout(() => {
        startRecognition();
        
      }, 800);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === "google_search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }

    if (type === "calculator_open") {
      window.open(`https://www.google.com/search?q=calculator`, "_blank");
    }

    if (type === "instagram_open") {
      window.open(`https://www.instagram.com/`, "_blank");
    }

    if (type === "facebook_open") {
      window.open(`https://www.facebook.com/`, "_blank");
    }

    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, "_blank");
    }

    if (type === "youtube_search" || type === "youtube_play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true;

    // const safeRecognition = () => {
    //   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    //     try {
    //       recognition.start();
    //       console.log("Recognition requested to start");
    //     } catch (error) {
    //       if (error.name !== "InvalidStateError") {
    //         console.error("Start Error:", error);
    //       }
    //     }
    //   }
    // };

    const startTimeout = setTimeout(()=>{
      if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (e) {
          if(e.name !== "InvalidStateError"){
            console.error("Start Error:", e);
          }
        }
      }
    }, 1000);

    recognition.onstart = () => {
      // console.log("Voice recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    // recognition.onend = () => {
    //   console.log("Voice recognition ended");
    //   isRecognizingRef.current = false;
    //   setListening(false);
    // };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if(isMounted && !isSpeakingRef.current){
        setTimeout(()=>{
          if(isMounted){
            try {
              recognition.start();
              console.log("Recognition restarted");
            } catch (e) {
              if(e.name !== "InvalidStateError"){
                console.error("Restart Error:", e);
              }
            }
          }
        },1000);
      }
    }

    // if (!isSpeakingRef.current) {
    //   setTimeout(() => {
    //     safeRecognition();
    //   }, 1000);
    // }

    recognition.onerror = (event) => {
      console.warn("Recognition Error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          // safeRecognition();
          if(isMounted){
            try {
              recognition.start();
              console.log("Recognition restarted after error");
            } catch (e) {
              if(e.name !== "InvalidStateError"){
                console.error("Restart Error:", e);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log(transcript);

      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        setListening(false);
        isRecognizingRef.current = false;

        const data = await getGeminiResponse(transcript);
        console.log(data);
        // speak(data.response);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    // const fallback = setInterval(() => {
    //   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    //     safeRecognition();
    //   }
    // }, 10000);
    // safeRecognition();

    // return () => {
    //   recognition.stop();
    //   setListening(false);
    //   isRecognizingRef.current = false;
    //   clearInterval(fallback);
    // };

    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, What can I help you with?`);
    greeting.lang = "hi-IN";
    window.speechSynthesis.speak(greeting);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    }

  }, []);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col gap-[15px] overflow-hidden">
      <CgMenuRight
        className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer"
        onClick={() => setHam(true)}
      />
      <div
        className={`absolute lg:hidden top-0 w-full h-full bg-[#0000002c] backdrop-blur-md p-[20px] flex flex-col gap-[20px] items-start ${
          ham ? "translate-x-0" : "-translate-x-full"
        } transition-transform`}
      >
        <RxCross1
          className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer"
          onClick={() => setHam(false)}
        />
        <button
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer hover:bg-blue-600"
          onClick={handleLogout}
        >
          Logout
        </button>
        <button
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer px-[20px] py-[10px] hover:bg-blue-600"
          onClick={() => navigate("/customize")}
        >
          Customize Your Assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white font-semibold text-[19px]">History</h1>

        <div className="w-full h-[400px] overflow-y-auto flex flex-col gap-[6px]">
          {userData.history?.map((his) => (
            <span className="text-gray-200 text-[16px] truncate">{his}</span>
          ))}
        </div>
      </div>
      <button
        className="min-w-[150px] mt-[30px] h-[60px] text-black font-semibold bg-white absolute hidden lg:block top-[20px] right-[20px] rounded-full text-[19px] cursor-pointer hover:bg-blue-600"
        onClick={handleLogout}
      >
        Logout
      </button>
      <button
        className="min-w-[150px] mt-[30px] h-[60px] text-black font-semibold absolute hidden lg:block top-[100px] right-[20px] bg-white rounded-full text-[19px] cursor-pointer px-[20px] py-[10px] hover:bg-blue-600"
        onClick={() => navigate("/customize")}
      >
        Customize Your Assistant
      </button>
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img
          src={userData?.assistantImage}
          alt=""
          className="h-full object-cover"
        />
      </div>
      <h1 className="text-white text-[18px] font-semibold">
        I'm {userData?.assistantName}
      </h1>
      {!aiText && <img src={userImg} alt="" className="w-[200px]" />}
      {aiText && <img src={aiImg} alt="" className="w-[200px]" />}
      <h1 className="text-white text-[18px] font-semibold text-wrap">
        {userText ? userText : aiText ? aiText : null}
      </h1>
    </div>
  );
};

export default Home;
