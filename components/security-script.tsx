"use client"

import { useEffect } from "react"

export function SecurityScript() {
  useEffect(() => {
    // 개발자도구 감지
    let devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;

    const checkDevTools = setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          showDevToolsWarning();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // 우클릭 방지
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showWarning('우클릭이 비활성화되었습니다.');
    };

    // 키보드 단축키 방지
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
        showWarning('개발자도구 사용이 금지되었습니다.');
      }
    };

    // 텍스트 선택 방지
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // 드래그 방지
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 이벤트 리스너 등록
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // 콘솔 경고 메시지
    console.clear();
    console.log('%c🚫 경고!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%c이 콘솔은 개발자용입니다. 여기서 코드를 실행하면 계정이 해킹될 수 있습니다.', 'color: red; font-size: 16px;');

    // 정리 함수
    return () => {
      clearInterval(checkDevTools);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}

function showDevToolsWarning() {
  const warning = document.createElement('div');
  warning.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  warning.innerHTML = `
    <div>
      <h1>🚫 개발자도구 사용 감지</h1>
      <p>콘텐츠 수정을 금지합니다.</p>
      <p>페이지를 새로고침하세요.</p>
    </div>
  `;
  document.body.appendChild(warning);
  
  // 3초 후 경고 제거
  setTimeout(() => {
    if (warning.parentNode) {
      warning.parentNode.removeChild(warning);
    }
  }, 3000);
}

function showWarning(message: string) {
  const warning = document.createElement('div');
  warning.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 99999;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  warning.textContent = message;
  document.body.appendChild(warning);
  
  setTimeout(() => {
    if (warning.parentNode) {
      warning.parentNode.removeChild(warning);
    }
  }, 2000);
}
