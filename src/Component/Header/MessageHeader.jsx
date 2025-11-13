import React, { useEffect, useMemo, useState, useCallback } from "react";
import sharingIcon from "../../img/share-24.svg";
import { ReactComponent as PlusIcon } from "../../img/add-24.svg";
import { ReactComponent as ArrowIcon } from "../../img/arrow_down.svg";
import EmojiPicker from "emoji-picker-react";
import { Link } from "react-router-dom";
// 이모지 제한 제거: API가 모든 이모지를 직접 지원하므로 제한 없이 사용 가능

function MessageHeader({
  recipient,
  messageCount = 0,
  topAvatars = [],
  reactions: initialReactionsProp,
  onShare,
  onAddReaction, // 부모 컴포넌트(OwnerPage)의 API 호출 함수
  hideAvatars = false, // RollingPage 버전에서 가져온 아바타 숨김 옵션
}) {
  // ==========================
  // 상태 및 Props 처리
  // ==========================
  const memoInitialReactions = useMemo(
    () => (Array.isArray(initialReactionsProp) ? initialReactionsProp : []),
    [initialReactionsProp]
  );
  
  // reactions 상태는 API prop에서 초기화되지만, 5회 제한 로직 처리를 위해 필요
  const [reactions, setReactions] = useState(memoInitialReactions); 

  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [animatedId, setAnimatedId] = useState(null);
  
  // UX/UI 피드백 상태 (팝업 + 토스트)
  const [popup, setPopup] = useState({ visible: false, message: "" }); // 5회 제한 팝업
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // 사용자 ID (Local Storage에서 로드/생성) - 5회 제한 로직에 사용
  const [userId] = useState(() => {
    const saved = localStorage.getItem("userId");
    if (saved) return saved;
    const newId = `user-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("userId", newId);
    return newId;
  });

  // reactions prop 변경 시 로컬 상태 업데이트
  useEffect(() => {
    setReactions(memoInitialReactions);
    
    // API로부터 받은 반응 데이터에 사용자 클릭 횟수 로컬 데이터 병합
    // (선택 사항: 로컬 5회 제한 카운트를 API 데이터와 별개로 관리할 경우)
    const savedUserClicks = localStorage.getItem(`userClicks_${userId}`);
    if (!savedUserClicks) {
        localStorage.setItem(`userClicks_${userId}`, "{}");
    }
  }, [memoInitialReactions, userId]);

  // ==========================
  // 로컬 팝업 / 토스트
  // ==========================
  const showPopup = (msg) => {
    setPopup({ visible: true, message: msg });
    setTimeout(() => setPopup({ visible: false, message: "" }), 2000);
  };

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // ==========================
  // 이모지 처리 (5회 제한 로직 포함)
  // ==========================
  const sortedReactions = Array.isArray(reactions)
    ? [...reactions].sort((a, b) => b.count - a.count)
    : [];
    
  // Local Storage에 저장된 사용자별 클릭 횟수를 가져옵니다.
  const getUserClicks = useCallback(() => {
      try {
          return JSON.parse(localStorage.getItem(`userClicks_${userId}`) || "{}");
      } catch {
          return {};
      }
  }, [userId]);

  const setUserClicks = useCallback((newClicks) => {
      localStorage.setItem(`userClicks_${userId}`, JSON.stringify(newClicks));
  }, [userId]);

  const handleEmojiSelect = (emojiData) => {
    const selectedEmoji =
      typeof emojiData === "string" ? emojiData : emojiData?.emoji || emojiData?.native;

    if (!selectedEmoji) return;

    let updated;
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === selectedEmoji);
      if (existing) {
        updated = prev.map((r) =>
          r.emoji === selectedEmoji ? { ...r, count: r.count + 1 } : r
        );
      } else {
        updated = [...prev, { emoji: selectedEmoji, count: 1, id: Date.now() }];
      }
      return updated;
    });

    if (typeof onAddReaction === 'function') {
      onAddReaction(selectedEmoji);
    }
    
    // 3. 로컬 상태 임시 업데이트 및 애니메이션 (UX 개선)
    setReactions((prev) => {
        const existing = prev.find((r) => r.emoji === selectedEmoji);
        if (existing) {
             // prop으로 받은 reactions를 업데이트하는 대신, 임시로 로컬 count를 증가시켜 애니메이션 트리거
            return prev.map((r) =>
              r.emoji === selectedEmoji
                ? { ...r, count: r.count + 1 }
                : r
            );
        } else {
            // 새 이모지인 경우 임시로 추가
             return [
                 ...prev,
                 { emoji: selectedEmoji, count: 1, id: Date.now() },
             ];
        }
    });

    // 애니메이션 트리거
    const target = reactions.find((r) => r.emoji === selectedEmoji);
    setAnimatedId(target ? target.id : Date.now());
    setTimeout(() => setAnimatedId(null), 250);
    setShowEmojiPicker(false);
  };

  // ==========================
  // 토글
  // ==========================
  const toggleEmojiMenu = () => {
    setShowEmojiMenu((p) => !p);
    setShowShareMenu(false);
    setShowEmojiPicker(false);
  };
  const toggleShareMenu = () => {
    setShowShareMenu((p) => !p);
    setShowEmojiMenu(false);
    setShowEmojiPicker(false);
    if (typeof onShare === 'function' && !showShareMenu) {
        onShare(); // 공유 메뉴 열 때 부모 콜백 실행
    }
  };
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((p) => !p);
    setShowEmojiMenu(false);
    setShowShareMenu(false);
  };

  // ==========================
  // 공유 기능 (Toast 사용)
  // ==========================
  const handleKakaoShare = () => {
     // 실제 카카오톡 공유 API 호출 로직은 생략하고 Toast만 표시
    showToast("카카오톡 공유 URL이 복사되었습니다!", "success"); 
    setShowShareMenu(false);
  };
  
  // URL 복사 기능 (HEAD 버전의 복사 로직 + Toast)
  const handleCopyURL = async () => {
    try {
      const currentURL = window.location.href;
      await navigator.clipboard.writeText(currentURL);
      showToast('URL이 클립보드에 복사되었습니다!', 'success');
      setShowShareMenu(false); 
    } catch (err) {
      // 클립보드 API가 지원되지 않는 경우 대체 방법 사용 (HEAD 버전의 대체 로직)
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('URL이 클립보드에 복사되었습니다!', 'success');
      } catch (fallbackErr) {
        console.error('URL 복사 실패:', fallbackErr);
        showToast('URL 복사에 실패했습니다.', 'error');
      } finally {
        document.body.removeChild(textArea);
        setShowShareMenu(false);
      }
    }
  };


  // ==========================
  // 렌더링 준비
  // ==========================
  const shareButtonClasses = `
    flex items-center justify-center 
    border border-gray-300 w-[56px] h-[36px] rounded-[6px] transition
    ${showShareMenu ? "border-gray-500 bg-gray-50" : "bg-white hover:bg-gray-100"}
  `;

  const plusButtonClasses = `
    flex items-center justify-center gap-1 border border-gray-300 text-gray-900 rounded-[6px]
    w-[88px] h-[36px] transition
    ${
      showEmojiPicker
        ? "bg-gray-100 border-gray-500"
        : "bg-white hover:bg-gray-50"
    }
  `;

  const displayName = recipient?.name ? `To. ${recipient.name}` : 'To. 이름 없는 대상';
  const totalWriters = messageCount ?? 0;
  
  // 아바타 렌더링을 위한 데이터 준비
  const visibleAvatars = useMemo(() => topAvatars.slice(0, 3), [topAvatars]);
  const hiddenCount = Math.max(totalWriters - visibleAvatars.length, 0);

  // ==========================
  // 렌더링
  // ==========================
  return (
    <div className="border-b border-gray-200 relative mx-auto w-full">
      
      {/* 팝업 (5회 제한 알림) */}
      {popup.visible && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          {popup.message}
        </div>
      )}

      {/* 토스트 (URL 복사 알림) */}
      {/*<Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        type={toastType}
        duration={2000}
      />*/}

      <div className="flex items-center justify-center w-full bg-white">
        <div className="flex items-center justify-between w-full max-w-[1200px] px-6 h-[68px]">
          
          {/* 왼쪽: 수신자 이름 (Link 포함) */}
          <Link
            to="/list" // HEAD 버전의 /list Link 적용
            className="text-gray-800 text-28-bold truncate pr-6 hover:underline"
            title={displayName}
          >
            {displayName}
          </Link>

          {/* 오른쪽 영역 */}
          <div className="flex items-center gap-[28px] relative">
            
            {/* 작성자 수, 아바타 등 */}
            {!hideAvatars && ( // hideAvatars 옵션 적용
              <div className="flex items-center gap-[11px] flex-shrink-0">
                <div className="flex items-center">
                  <div className="flex items-center -space-x-[12px]">
                    {/* prop 기반 아바타 렌더링 */}
                    {visibleAvatars.map((avatar, i) => (
                      <img
                        key={`${avatar.src}-${i}`}
                        src={avatar.src}
                        alt={avatar.alt || `avatar-${i + 1}`}
                        className="w-[28px] h-[28px] rounded-full border-[1.5px] border-white object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/28x28';
                        }}
                      />
                    ))}
                  </div>
                  {hiddenCount > 0 && (
                    <div className="ml-2 w-[28px] h-[28px] bg-white border border-[#E3E3E3] rounded-full flex items-center justify-center text-xs text-[#484848]">
                      +{hiddenCount}
                    </div>
                  )}
                </div>
                <span className="text-18-regular text-gray-900 whitespace-nowrap">
                  <span className="text-18-bold">{totalWriters}</span>명이 작성했어요!
                </span>
              </div>
            )}
            
            {/* 이모지 표시 + 화살표 */}
            <div className="flex items-center gap-2 min-w-[236px] justify-end">
              {sortedReactions.length > 0 && (
                <div className="relative flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {/* 상위 3개 이모지 표시 */}
                    {sortedReactions.slice(0, 3).map((reaction) => (
                      <button
                        key={reaction.id || reaction.emoji}
                        onClick={() => handleEmojiSelect(reaction.emoji)}
                        className={`flex items-center justify-center gap-1 bg-black bg-opacity-[54%] text-white rounded-full px-[12px] py-[6px] transition-transform duration-150 ${
                          animatedId === (reaction.id || reaction.emoji) ? "emoji-animate" : ""
                        }`}
                      >
                        {reaction.emoji}&nbsp;{reaction.count}
                      </button>
                    ))}
                  </div>

                  {/* 이모지 토글 버튼 */}
                  {sortedReactions.length > 3 && (
                    <button
                      onClick={toggleEmojiMenu}
                      className="flex items-center justify-center w-[36px] h-[36px] transition"
                    >
                      <ArrowIcon
                        className={`transition-transform duration-200 ${
                          showEmojiMenu ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  )}

                  {/* 전체 이모지 목록 팝업 */}
                  {showEmojiMenu && sortedReactions.length > 3 && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg p-[24px] grid grid-cols-4 gap-2 justify-items-center z-10 border border-gray-300">
                      {reactions.map((reaction) => (
                        <button
                          key={reaction.id || reaction.emoji}
                          onClick={() => handleEmojiSelect(reaction.emoji)}
                          className={`flex flex-row items-center justify-center bg-black bg-opacity-[54%] text-white rounded-full px-[12px] py-[6px] text-16-regular w-full transition-transform duration-150 ${
                            animatedId === (reaction.id || reaction.emoji) ? "emoji-animate" : ""
                          }`}
                        >
                          {reaction.emoji}&nbsp;{reaction.count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="w-px h-[28px] bg-[#EEEEEE]"></span>

            {/* 이모지 추가 & 공유 버튼 */}
            <div className="flex items-center gap-[13px] min-w-[171px] justify-end">
              {/* 이모지 추가 버튼 */}
              <div className="relative z-20">
                <button onClick={toggleEmojiPicker} className={plusButtonClasses}>
                  <PlusIcon />
                  추가
                </button>

                {/* 이모지 피커 */}
                {showEmojiPicker && (
                  <div className="absolute top-[calc(100%+8px)] left-1/2 transform -translate-x-1/2 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <EmojiPicker 
                      onEmojiClick={handleEmojiSelect}
                      searchDisabled={false}
                      previewConfig={{
                        showPreview: false
                      }}
                      skinTonesDisabled={true}
                      width="100%"
                      height="400px"
                    />
                  </div>
                )}
              </div>

              {/* 공유 버튼 */}
              <div className="relative">
                <button
                  onClick={toggleShareMenu}
                  className={shareButtonClasses}
                  aria-expanded={showShareMenu}
                >
                  <img src={sharingIcon} alt="공유" />
                </button>

                {/* 공유 메뉴 */}
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md py-[10px] w-[140px] z-10 text-gray-900 border border-gray-300 text-16-regular">
                    <button
                      onClick={handleKakaoShare}
                      className="text-left px-4 py-2 hover:bg-gray-100 w-full"
                    >
                      카카오톡 공유
                    </button>
                    <button 
                      onClick={handleCopyURL}
                      className="text-left px-4 py-2 hover:bg-gray-100 w-full"
                    >
                      URL 복사
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style>{`
        .emoji-animate {
          transform: scale(1.3) !important;
          transition: transform 0.15s ease-in-out !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MessageHeader;