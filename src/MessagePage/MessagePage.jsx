import React, { useState, useEffect } from "react";
import Header from "../Component/Header/HeaderNobutton";
import Input from "../Component/Text_Field/Input";
import User from "../Component/Option/User";
import Select from "../Component/Text_Field/SelectBox";
import Froala from "../Component/Text_Field/Froala";
import PrimaryPc from "../Component/Button/Primary-pc";
import axios from "axios"; // 일반 axios
import api from "./axiox"; // 프로필 이미지용 커스텀 api 인스턴스 (경로 확인 필요)

function Send() {
  // 관계 선택 상태
  const [selectedRelation, setSelectedRelation] = useState(null);
  // 폰트 선택 상태
  const [selectedFont, setSelectedFont] = useState(null);
  
  // ⭐️ 프로필 이미지 상태 추가
  const [profileImages, setProfileImages] = useState([]);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);

  // 예시 옵션들
  const relationOptions = [
    { label: "친구", value: "friend" },
    { label: "연인", value: "partner" },
    { label: "가족", value: "family" },
    { label: "직장동료", value: "colleague" },
  ];

  const fontOptions = [
    { label: "나눔스퀘어", value: "nanum_square" },
    { label: "맑은고딕", value: "malgun_gothic" },
    { label: "Roboto", value: "roboto" },
  ];

  const fetchProfileImages = async () => {
    try {
      const response = await api.get("/");
      
      const data = response.data;
      
      if (Array.isArray(data)) {
          setProfileImages(data);
      } else if (data && Array.isArray(data.imageUrls)) {
          setProfileImages(data.imageUrls);
      } else {
          setProfileImages([]); 
          console.error("API 응답이 올바른 이미지 배열 형태가 아닙니다:", data);
      }
      
    } catch (error) {
      console.error("프로필 이미지 로딩 실패:", error);
    }
};

  useEffect(() => {
    fetchProfileImages();
  }, []);

  const handleCreate = async () => {
    if (!selectedRelation || !selectedFont) {
      alert("관계와 폰트를 모두 선택해주세요.");
      return;
    }
    

    const RECIPIENT_ID = 123; 
    
    const payload = {
      sender: "보내는 사람 이름 (Input 값)", 
      content: "메시지 내용 (Froala 값)",
      profileImageURL: selectedProfileImage,
      relation: selectedRelation.value,
      font: selectedFont.value,
    };

    console.log("보낼 payload:", payload);

    try {
      const res = await axios.post(
        `https://api.rolling.com/recipients/${RECIPIENT_ID}/messages/`, 
        payload
      ); 
      
      console.log("서버 응답:", res.data);
      alert("생성 완료!");
    } catch (err) {
      console.error("생성 실패:", err.response ? err.response.data : err.message);
      alert("생성 실패: " + (err.response ? err.response.data.message : err.message));
    }
  };

  return (
    <>
      <Header />
      <div className="w-[768px] mx-auto mt-[47px]">
        <div className="w-[720px] mx-auto">
          <div>
            <p className="text-24-bold mb-3">From.</p>
            <Input />
          </div>

          <div className="mt-[50px]">
            <p className="text-24-bold mb-3">프로필 이미지</p>
            <div className="flex gap-8 h-[94px]">
              <User selectedImageUrl={selectedProfileImage}/>
              <div>
                <p className="text-16-regular text-gray-500">프로필 이미지를 선택해주세요!</p>
                
                {/* ⭐️ 이미지 목록 렌더링 부분 */}
                <div className="flex flex-wrap gap-2 mt-2 max-w-[500px]">
                  {profileImages.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`프로필 이미지 ${index + 1}`}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-all ${
                        selectedProfileImage === imageUrl 
                          ? 'border-4 border-purple-600 p-0.5' // 선택된 이미지 강조
                          : 'opacity-70 hover:opacity-100' 
                      }`}
                      onClick={() => setSelectedProfileImage(imageUrl)} // 클릭 시 선택 상태 업데이트
                    />
                  ))}
                  {/* 로딩 중 메시지 */}
                  {profileImages.length === 0 && (
                      <p className="text-gray-400">이미지를 불러오는 중입니다...</p>
                  )}
                </div>
                {/* 렌더링 끝 */}
                
              </div>
            </div>
          </div>

          <div className="mt-[50px]">
            <p className="text-24-bold">상대와의 관계</p>
            <Select
              options={relationOptions}
              selected={selectedRelation}
              setSelected={setSelectedRelation}
              placeholder="옵션을 선택하세요"
            />
          </div>

          <div className="mt-[50px]">
            <p className="text-24-bold">내용을 입력해주세요.</p>
            <Froala />
          </div>

          <div className="mt-[50px] mb-[62px]">
            <p className="text-24-bold">폰트 선택</p>
            <Select
              options={fontOptions}
              selected={selectedFont}
              setSelected={setSelectedFont}
              placeholder="폰트를 선택하세요"
            />
          </div>
        <div>
          <div onClick={handleCreate} style={{ display: "inline-block", cursor: "pointer" }}>
            <PrimaryPc text="생성하기" />
          </div>
        </div>
        </div>

      </div>
    </>
  );
}

export default Send;