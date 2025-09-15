Voice-starter: local, privacy-first minimal voice service

Overview
- Local/demo TTS & audio upload service.
- Binds to localhost (127.0.0.1) by default so no external network exposure.
- Uses Coqui TTS if installed (high-quality); otherwise falls back to pyttsx3 for offline demo.

Quick start (Linux)

1. Build and start:

```bash
cd tools/voice-starter
docker compose up --build
```

2. Health check (default token `changeme`):

```bash
curl -H "Authorization: Bearer changeme" http://127.0.0.1:8080/health
```

3. Synthesize example:

```bash
curl -H "Authorization: Bearer changeme" -X POST http://127.0.0.1:8080/synthesize -H "Content-Type: application/json" -d '{"text":"Hello from your private TTS"}' --output out.wav
aplay out.wav
```

Security notes
- Replace `SECRET_TOKEN` in `docker-compose.yml` with a secure value or set as environment variable.
- All data is persisted under `tools/voice-starter/data` on the host. Consider encrypting this directory if required.
- For stronger protection, run the service on a machine not connected to the internet.

Next steps
- Add training and cloning endpoint using Coqui YourTTS or VITS.
- Integrate optional Whisper transcription for upload pre-processing.
- Add TLS and stronger auth (OAuth2/JWT) if exposing beyond localhost.

Training example (simulated)

```bash
# upload one or more WAV files for speaker "alice"
curl -H "Authorization: Bearer changeme" -F "files=@/path/to/file1.wav" -F "files=@/path/to/file2.wav" -F "speaker=alice" http://127.0.0.1:8080/train

# response is a job id. poll for done marker in tools/voice-starter/data/speakers/alice/<job>.done
```
