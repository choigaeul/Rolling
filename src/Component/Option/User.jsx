// src/Component/Option/User.jsx

import React from 'react';
// 기본 이미지는 선택된 이미지가 없을 때 사용하기 위해 남겨둡니다.
import UserAvatar from '../../img/User.svg'; 

// ⭐️ selectedImageUrl을 props로 받습니다.
function User({ selectedImageUrl }) {
  
  // selectedImageUrl이 있으면 해당 URL을, 없으면 기본 이미지를 사용합니다.
  const imageUrlToDisplay = selectedImageUrl || UserAvatar;

  return (
    <div className="w-[80px] h-[80px] rounded-full bg-gray-300 flex items-center justify-center p-[10px]">
      <img 
        // ⭐️ props로 받은 URL을 src로 사용합니다.
        src={imageUrlToDisplay} 
        alt="사용자 아바타" 
        className={` object-cover rounded-full ${
            selectedImageUrl ? '' : 'w-[32px] h-[32px]' // 기본 SVG일 경우 크기 유지
        }`}
      />
    </div>
  );
}

export default User;