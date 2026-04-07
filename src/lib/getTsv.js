// lib/getTsv.js
export async function getTsv(url, { signal } = {}) {
    try {
        const res = await fetch(url, { signal, cache: "no-store" });

        if (!res.ok) {
            return { ok: false, status: res.status, text: "" };
        }

        const text = await res.text();
        return { ok: true, status: res.status, text };
    } catch (err) {
        return { ok: false, status: 0, text: "", error: err };
    }
}
