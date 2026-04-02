; 1. 언인스톨 완료 직전 팝업 띄우고 사용자 데이터 삭제하기 (요구사항 4)
!macro customUnInstall
  MessageBox MB_YESNO "사용자 설정 및 캐시 데이터도 모두 삭제하시겠습니까?" IDYES deleteAppData IDNO skipDelete

  deleteAppData:
    ; %APPDATA%\quick-link 폴더 완전 삭제
    RMDir /r "$APPDATA\quick-link"

  skipDelete:
!macroend
