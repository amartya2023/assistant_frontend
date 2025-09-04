import React, { useState } from "react";
import bg from "../assets/authBg.png";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import {useNavigate} from 'react-router-dom'

const SignUp = () => {

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form className="w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-blue-950 flex flex-col justify-center items-center gap-[20px] px-[20px]">
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Register to <span className="text-blue-400">Virtual Assistant</span>
        </h1>
        <input
          type="text"
          placeholder="Enter Your Name"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
        />
        <input
          type="email"
          placeholder="Enter Your Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
        />
        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input type={showPassword?"text":"password"} placeholder="Password" className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]" />

          {/* function of hidden password */}
          {!showPassword && <IoEye className="absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer" onClick={()=>setShowPassword(true)}/>}
          {showPassword && <IoEyeOff className="absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer" onClick={()=>setShowPassword(false)}/>}
        </div>

        {/* Sign Up button */}
        <button className="min-w-[150px] mt-[30px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px]">Sign Up</button>
         <p className="text-white text-[18px]">Already have an account ? <span className="text-blue-500 cursor-pointer" onClick={()=>navigate("/signin")}>Sign In</span></p>
      </form>
    </div>
  );
};

export default SignUp;
