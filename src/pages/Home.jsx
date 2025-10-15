import React, { useContext } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const { userData, serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const handleLogout = async ()=> {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {withCredentials:true});
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error)
    }
  }

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col gap-[15px]">
      <button
          className="min-w-[150px] mt-[30px] h-[60px] text-black font-semibold bg-white absolute top-[20px] right-[20px] rounded-full text-[19px] cursor-pointer hover:bg-blue-600"
          onClick={handleLogout}
        >
          Logout
        </button>
        <button
          className="min-w-[150px] mt-[30px] h-[60px] text-black font-semibold absolute top-[100px] right-[20px] bg-white rounded-full text-[19px] cursor-pointer px-[20px] py-[10px] hover:bg-blue-600"
          onClick={()=>navigate("/customize")}
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
    </div>
  );
};

export default Home;
