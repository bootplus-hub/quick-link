import { exec } from "child_process";
import { promisify } from "util";
import { protocol } from "electron";
import { ChromeBrowser } from "../browser";

const execAsync = promisify(exec);

async function runGoogleChromeAync (request: Request): Promise<Response> {
  try {
    if (!ChromeBrowser.getInstance().exists) throw 'chrome browser not exists';
    const url = request.url.replace(/^google-chrome:(\w+):?\/+(.*)/i, '$1://$2');
    await execAsync(`"${ChromeBrowser.getInstance().path}" "${url}"`);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('runGoogleChromeAync', err);
    return new Response(null, { status: 204 });
  }
};

export default function install () {
  protocol.handle('google-chrome', runGoogleChromeAync);
};
