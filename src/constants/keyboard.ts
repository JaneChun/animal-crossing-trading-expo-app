// 키보드 툴바 높이 42 + 패딩 8
// 주의: 기본 폰트 스케일 기준의 고정값. 사용자가 텍스트 크기(접근성)를 키우면
// "완료" 버튼이 커져 실제 툴바 높이가 이 값보다 커지고, 그만큼 입력이 다시 가려질 수 있다.
// 정확도가 필요해지면 툴바 content에 onLayout으로 실측해 Context/store로 노출할 것.
export const KEYBOARD_TOOLBAR_HEIGHT = 50;
