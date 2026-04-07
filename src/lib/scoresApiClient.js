import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 1024 * 1024 * 256; // 256 MB

export async function callScoresApi(endpoint, params) {
    const payload = { endpoint, params };
    const jsonArg = JSON.stringify(payload);

    const pythonBin =
        process.env.PYTHON_BIN ||
        (process.env.NODE_ENV === "production"
            ? "/opt/pyenv/bin/python"
            : "python3");

    const { stdout, stderr } = await execFileAsync(
        pythonBin,
        ["python_tools/scores_api.py", jsonArg],
        {
            timeout: 120_000,
            maxBuffer: MAX_BUFFER,
        }
    );

    if (stderr && stderr.trim().length > 0) {
        console.error("[scoresApiClient] stderr:", stderr);
    }

    if (!stdout) {
        throw new Error("[scoresApiClient] empty stdout from scores_api.py");
    }

    return JSON.parse(stdout);
}