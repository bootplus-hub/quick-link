#define AppName "QuickLink"
#define AppExeName "QuickLink.exe"
#define AppData "quick-link"
#define AppModelID "kr.bootplus.quick-link"
#define Publisher "bootplus"
#define AppURL "https://bootplus.kr"
#define OutputName "QuickLinkSetup"
#define AppVersion GetVersionNumbersString("dist-build\win-unpacked\QuickLink.exe")

[Setup]
AppId={{E237C634-E96B-4696-A93A-7D03C18FA9C5}}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#Publisher}
AppPublisherURL={#AppURL}
DefaultDirName={commonpf64}\{#AppName}
DefaultGroupName={#AppName}
OutputBaseFilename={#OutputName}
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
DisableProgramGroupPage=yes
SetupIconFile=public\icon-main.ico
UninstallDisplayIcon={app}\{#AppExeName}
ShowLanguageDialog=yes

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "dist-build\win-unpacked\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion; Excludes: "*.yml,*.log,*.txt"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Icons]
;시작 메뉴 아이콘
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExeName}"; AppUserModelID: "{#AppModelID}"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"
; 바탕화면 아이콘 추가
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExeName}"; \
  Description: "프로그램 실행"; \
  Flags: nowait postinstall skipifsilent


[Code]
function IsAppRunning(): Boolean;
var
  ResultCode: Integer;
begin
  // tasklist로 실행 중 여부 확인
  Exec(
    'cmd.exe',
    '/c tasklist | findstr /i "' + '{#AppExeName}' + '"',
    '',
    SW_HIDE,
    ewWaitUntilTerminated,
    ResultCode
  );

  Result := (ResultCode = 0);
end;

function KillApp(): Boolean;
var
  ResultCode: Integer;
begin
  // 강제 종료
  Exec(
    'taskkill.exe',
    '/F /T /IM ' + '{#AppExeName}',
    '',
    SW_HIDE,
    ewWaitUntilTerminated,
    ResultCode
  );

  Result := (ResultCode = 0);
end;

function HasRuntimeMajorOrHigher(BasePath, RuntimeName: String; RequiredMajor: Integer): Boolean;
var
  FindRec: TFindRec;
  Major: Integer;
  RuntimePath: String;
begin
  Result := False;
  RuntimePath := BasePath + 'shared\' + RuntimeName;

  if not DirExists(RuntimePath) then
    Exit;

  if FindFirst(RuntimePath + '\*', FindRec) then
  begin
    try
      repeat
        if (FindRec.Attributes and FILE_ATTRIBUTE_DIRECTORY) <> 0 then
        begin
          // 예: 8.0.22 → 8
          Major := StrToIntDef(
            Copy(FindRec.Name, 1, Pos('.', FindRec.Name) - 1),
            0
          );

          if Major >= RequiredMajor then
          begin
            Result := True;
            Exit;
          end;
        end;
      until not FindNext(FindRec);
    finally
      FindClose(FindRec);
    end;
  end;
end;

function GetInstalledVersion(): String;
var
  InstallDir: String;
begin
  if RegQueryStringValue(
    HKLM,
    'Software\Microsoft\Windows\CurrentVersion\Uninstall\{#SetupSetting("AppId")}_is1',
    'DisplayVersion',
    InstallDir
  ) then
    Result := InstallDir
  else
    Result := '';
end;

function CompareVersions(v1, v2: String): Integer;
begin
  Result := CompareStr(v1, v2);
end;

function InitializeSetup(): Boolean;
var
  InstalledVer: String;
begin
  // 실행 중인 앱 체크
  if IsAppRunning() then
    begin
      if MsgBox(
        '{#AppName}이(가) 실행 중입니다.' + #13#10 +
        '업데이트를 위해 자동으로 종료합니다.',
        mbInformation,
        MB_OKCANCEL
      ) = IDCANCEL then
        begin
          Result := False;
          Exit;
        end;

      if not KillApp then
        begin
          MsgBox(
            '프로그램을 종료할 수 없습니다.' + #13#10 +
            '수동으로 종료 후 다시 실행해 주세요.',
            mbError,
            MB_OK
          );
          Result := False;
          Exit;
        end;

      Sleep(1500);

      if IsAppRunning() then
        begin
          MsgBox(
            '프로그램이 아직 실행 중입니다.' + #13#10 +
            '설치를 중단합니다.',
            mbError,
            MB_OK
          );
          Result := False;
          Exit;
        end;
    end;

  // 기존 버전 체크 (이전 코드)
  InstalledVer := GetInstalledVersion;

  if InstalledVer <> '' then
    begin
      if CompareVersions(InstalledVer, '{#AppVersion}') > 0 then
        begin
          MsgBox(
            '이미 더 높은 버전이 설치되어 있습니다.' + #13#10 +
            '설치를 취소합니다.',
            mbError,
            MB_OK
          );
          Result := False;
          Exit;
        end;
    end;

  Result := True;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  UserDataPath: String;
begin
  // 언인스톨이 완료된 직후(postuninstall) 실행
  if CurUninstallStep = usPostUninstall then
  begin
    // AppData\Roaming 경로 추출
    UserDataPath := ExpandConstant('{userappdata}\{#AppData}');

    if DirExists(UserDataPath) then
    begin
      if MsgBox('사용자 설정 및 캐시 데이터도 모두 삭제하시겠습니까?',
                mbConfirmation, MB_YESNO) = IDYES then
      begin
        // 폴더와 내부 파일 모두 삭제
        DelTree(UserDataPath, True, True, True);
      end;
    end;
  end;
end;
