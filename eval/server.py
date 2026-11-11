"""Runs Qwen2.5 (GGUF, llama.cpp) behind a tiny HTTP API that copies how the Android app drives the model:
one chat session per key; the first message is "system\n\nuser" sent as a user turn (MediaPipe has no system role),
later messages are added as user turns; top-k 40, top-p 0.9."""
import json, sys, time, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
MODEL = sys.argv[1]
if MODEL == "MOCK":  # plumbing test without a model
    class Llama:
        def create_chat_completion(self, messages, **k): return {"choices": [{"message": {"content": "¡Genial! ¿Cómo quieres practicar el verbo \"haber\" en diferentes tenses?" if len(messages) < 4 else "Muy bien. ¿Y qué más?"}}]}
    llm = Llama()
else:
    from llama_cpp import Llama
    llm = Llama(model_path=MODEL, n_ctx=4096, n_threads=4, verbose=False, seed=-1)
LOCK = threading.Lock()
SESS = {}   # key -> list of messages
LOG = open(sys.argv[2] if len(sys.argv) > 2 else "raw.jsonl", "a")

def run(msgs, max_tokens, temp):
    t0 = time.time()
    out = llm.create_chat_completion(messages=msgs, max_tokens=max_tokens, temperature=temp, top_k=40, top_p=0.9, repeat_penalty=1.0)
    return out["choices"][0]["message"]["content"], time.time() - t0

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers(); self.wfile.write(b)
    def do_OPTIONS(self): self._send(200, {})
    def do_POST(self):
        j = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        with LOCK:
            if self.path == "/chat":
                k = j["key"]
                if k not in SESS or j.get("fresh"):
                    SESS[k] = [{"role": "user", "content": j["sys"] + "\n\n" + j["user"]}]
                else:
                    SESS[k].append({"role": "user", "content": j["user"]})
                txt, dt = run(SESS[k], j.get("max", 220), j.get("temp", 0.35))
                SESS[k].append({"role": "assistant", "content": txt})
                LOG.write(json.dumps({"kind": "chat", "key": k, "user": j["user"], "out": txt, "s": round(dt, 1), "n": len(SESS[k])}) + "\n"); LOG.flush()
                return self._send(200, {"text": txt, "s": dt})
            if self.path == "/gen":
                txt, dt = run([{"role": "user", "content": j["prompt"]}], j.get("max", 220), j.get("temp", 0.35))
                LOG.write(json.dumps({"kind": "gen", "prompt": j["prompt"][-300:], "out": txt, "s": round(dt, 1)}) + "\n"); LOG.flush()
                return self._send(200, {"text": txt, "s": dt})
            if self.path == "/reset":
                SESS.clear(); return self._send(200, {})
        self._send(404, {})

print("model loaded", flush=True)
ThreadingHTTPServer(("127.0.0.1", 8800), H).serve_forever()
