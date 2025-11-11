import React from "react";
import Trashbutton from "../../Component/Button/Trash-button";

function Card({
  senderName,
  profileImageURL,
  relationship,
  content,
  date,
  onClick,
  onDeleteClick,
}) {
  return (
    <div
      onClick={onClick}
      className="
        w-[384px] h-[280px]
        rounded-[16px]
        p-[28px_24px_24px_24px]
        shadow-[0_2px_13px_rgba(0,0,0,0.08)]
        bg-white
        flex flex-col
        relative
        cursor-pointer
        hover:shadow-lg transition
      "
    >
      <div
        className="
          flex justify-between
          pb-4
          border-b border-[rgba(238,238,238,1)]
        "
      >
        <div className="flex flex-wrap">
          <img
            className="w-14 h-14 rounded-full"
            src={profileImageURL}
            alt={`${senderName} 프로필`}
          />

          <div className="flex flex-col gap-[5px] pl-[10px]">
            <div className="text-20-regular text-black">
              From.&nbsp;
              <span className="text-20-bold text-black">{senderName}</span>
            </div>

            <div
              className="
              w-[41px] h-5
              text-[14px] text-purple-600
              rounded-[5px] bg-purple-100
              px-[5px]
              flex items-center justify-center
            "
            >
              {relationship}
            </div>
          </div>
        </div>

        {/* 휴지통 버튼 클릭 시 삭제 모달 */}
        <div onClick={onDeleteClick}>
          <Trashbutton />
        </div>
      </div>

      <div
        className="
          w-[336px] h-[106px]
          text-[18px] leading-[1.5]
          mt-4
          text-grayscale-600
        "
      >
        {content}
      </div>

      <div
        className="
          text-[12px] text-grayscale-400
          absolute bottom-6 left-6
        "
      >
        {date}
      </div>
    </div>
  );
}

export default Card;
