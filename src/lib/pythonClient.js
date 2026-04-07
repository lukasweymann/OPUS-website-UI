import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
// 256 MB stdout buffer – adjust if needed
const MAX_BUFFER = 1024 * 1024 * 256; // 256 * 1,024 * 1,024

export async function callPythonReadData(params) {
    const jsonArg = JSON.stringify(params);
    const pythonBin =
        process.env.PYTHON_BIN ||
        (process.env.NODE_ENV === "production" ? "/opt/pyenv/bin/python" : "python3");

    const { stdout, stderr } = await execFileAsync(
        pythonBin,
        ["python_tools/readdata.py", jsonArg],
        {
            timeout: 300_000,
            maxBuffer: MAX_BUFFER,
        }
    );

    if (stderr && stderr.trim().length > 0) {
        console.error("Python stderr:", stderr);
    }

    return JSON.parse(stdout);
}

