import { exec } from "child_process";
import { promisify } from "util";
import iconv from "iconv-lite";

const execAsync = promisify(exec);

export class ChromeBrowser {
  private static instance: ChromeBrowser;
  static getInstance () {
    if (this.instance) return this.instance;
    this.instance = new ChromeBrowser();
    return this.instance;
  }

  exists: boolean = false;
  path?: string;

  private constructor () {
    this.findPath();
  }

  private async findPath (): Promise<void> {
    // 1. 읽고자 하는 레지스트리 경로
    const regPath = 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe';
    // 2. 명령어 실행 (기본값인 /ve를 조회)
    const command = `reg query "${regPath}" /ve`;

    try {
      // 인코딩을 buffer로 설정하여 raw 데이터를 받음
      const { stdout } = await execAsync(command, { encoding: 'buffer' });
      // Windows 한글 인코딩(CP949)으로 디코딩
      const decodedOutput = iconv.decode(stdout as unknown as Buffer, 'euc-kr');
      // 3. 정규식 캡처를 통해 경로만 추출
      // REG_SZ 이후의 문자열을 끝까지 캡처
      const match = decodedOutput.match(/REG_SZ\s+(.*)/i);
      if (match && match[1]) {
        const chromePath = match[1].trim();
        this.exists = true;
        this.path = chromePath;
        console.log('찾은 Chrome 경로:', chromePath);
      }
    } catch (error: any) {
      // 키가 존재하지 않으면 에러가 발생합니다 (코드 1)
      this.exists = false;
      this.path = undefined;
      console.error('Chrome 레지스트리 키가 존재하지 않거나 읽기 권한이 없습니다.');
    }
  }
};
