import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 1024 * 1024 * 256; // 256 MB

export async function callLangpairsService(params) {
    const jsonArg = JSON.stringify(params);
    const pythonBin =
        process.env.PYTHON_BIN ||
        (process.env.NODE_ENV === "production"
            ? "/opt/pyenv/bin/python"
            : "python3");


    const { stdout, stderr } = await execFileAsync(
        pythonBin,
        ["python_tools/langpairs_service.py", jsonArg],
        {
            timeout: 120_000,
            maxBuffer: MAX_BUFFER,
        }
    );

    if (stderr && stderr.trim().length > 0) {
        console.error("[langpairsService] Python stderr:", stderr);
    }

    if (!stdout) {
        throw new Error(
            "[langpairsService] No stdout received from langpairs_service.py"
        );
    }

    return JSON.parse(stdout);
}
