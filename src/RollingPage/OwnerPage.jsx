import React, { useState } from "react";
import Header from "../Header/Header";
import MessageHeader from "../Header/MessageHeader";
import DeleteButton from "../Button/Delete-button";
import Modal from "../Modal/Modal";

// 🚨 정적인 메시지 데이터 (기존과 동일)
const STATIC_MESSAGES = Array.from({ length: 9 }).map((_, index) => ({
  id: index + 1,
  senderName: `보낸 이 #${index + 1}`,
  content: `안녕하세요, 이것은 ${
    index + 1
  }번째 메시지 카드 내용입니다. 모달창에 표시될 긴 내용입니다.`,
  profileImageURL: `https://placehold.co/40x40/f2dca0/000000?text=${index + 1}`,
}));

function OwnerPage() {
  // === 메시지 상세보기 모달 상태 ===
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // === ✅ 삭제 확인 모달 상태 ===
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 카드 클릭 시 모달 열기 핸들러
  const handleCardClick = (message) => {
    setSelectedMessage(message);
    setIsOpen(true);
  };

  // 메시지 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedMessage(null);
  };

  // ✅ 삭제 버튼 클릭 핸들러: 삭제 확인 모달 열기
  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // ✅ 삭제 확인 모달 닫기 핸들러
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  // ✅ '예' 클릭 시 페이지 삭제 로직 (예시)
  const handleConfirmDelete = () => {
    // 여기에 페이지 삭제 API 호출 로직을 넣습니다.
    console.log("페이지를 삭제합니다.");
    setIsDeleteModalOpen(false); // 모달 닫기
    // 페이지 이동 또는 상태 업데이트 (예시)
  };

  // 🌟 삭제 확인 모달 컴포넌트 (버튼 크기 동일/가운데 정렬 적용)
  const DeleteConfirmModal = () => (
    <div className="bg-white rounded-xl shadow-2xl p-8 w-[300px] mx-4">
      <h3 className="text-xl font-bold mb-4 text-center">페이지 삭제 확인</h3>
      <p className="text-gray-700 mb-6 text-center">Page를 삭제하시겠습니까?</p>

      {/* 버튼 영역 */}
      <div className="flex justify-center space-x-3">
        {/* 예 버튼 */}
        <button
          onClick={handleConfirmDelete}
          className="py-2 px-4 bg-purple-600 text-white text-18-regular rounded-lg hover:bg-purple-700 transition flex-1"
        >
          예
        </button>
        {/* 아니요 버튼 */}
        <button
          onClick={handleCloseDeleteModal}
          className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex-1"
        >
          아니요
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="overflow-y-scroll owner-page-scrollbar-hide">
        <div className="flex flex-col min-h-screen bg-beige-200">
          {/* 상단 헤더 영역 */}
          <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-30">
            <div className="mx-auto">
              <Header />
              <div className="flex justify-between items-center px-6">
                <MessageHeader />
              </div>
            </div>
          </div>

          {/* 메시지 카드 영역 */}
          <div className="flex-1 w-full pt-[180px] pb-10 relative">
            <div className="mx-auto px-6 relative max-w-7xl">
              {/* 삭제 버튼 - 클릭 이벤트 연결 */}
              <div
                className="absolute top-[-55px] right-8 z-10"
                onClick={handleOpenDeleteModal}
              >
                <DeleteButton text="삭제하기" />
              </div>

              {/* 카드 목록 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] mt-[28px] relative z-10">
                {STATIC_MESSAGES.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    className="bg-white rounded-xl shadow-md p-6 text-gray-600 flex flex-col justify-between cursor-pointer hover:shadow-lg transition h-[280px]"
                  >
                    <p className="text-gray-800 line-clamp-4">{item.content}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={item.profileImageURL}
                          alt={item.senderName}
                          className="w-8 h-8 rounded-full mr-2 object-cover"
                        />
                        <span className="font-semibold text-sm">
                          From. {item.senderName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">2023.10.27</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 상세 모달 렌더링 (기존 로직 유지) */}
      {isOpen && selectedMessage && (
        <div
          // 배경 불투명하게 어둡게 (z-index 100)
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center"
          onClick={handleCloseModal}
        >
          <Modal
            onClick={(e) => e.stopPropagation()}
            isOpen={isOpen}
            onClose={handleCloseModal}
            senderName={selectedMessage.senderName}
            content={selectedMessage.content}
          />
        </div>
      )}

      {/* 삭제 확인 모달 렌더링 (예/아니오 팝업) */}
      {isDeleteModalOpen && (
        <div
          // 배경 불투명하게 어둡게 (z-index 100)
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center"
          onClick={handleCloseDeleteModal} // 오버레이 클릭 시 닫기
        >
          {/* 삭제 확인 모달 본체 */}
          <div onClick={(e) => e.stopPropagation()}>
            <DeleteConfirmModal />
          </div>
        </div>
      )}
    </>
  );
}

export default OwnerPage;
