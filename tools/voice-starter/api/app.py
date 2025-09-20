import os
import io
from flask import Flask, request, jsonify, send_file, abort
from werkzeug.utils import secure_filename
from pydub import AudioSegment
import threading
import time
import uuid
import train

app = Flask(__name__)
DATA_DIR = '/data'
TOKEN = os.environ.get('SECRET_TOKEN', 'changeme')

os.makedirs(DATA_DIR, exist_ok=True)

# Minimal TTS wrapper: tries Coqui TTS if installed, falls back to pyttsx3
try:
    from TTS.api import TTS
    tts_model = TTS(list(TTS.list_models())[0])
    def synthesize_text(text: str) -> bytes:
        wav = tts_model.tts(text)
        # wav is numpy array, we convert to bytes via pydub
        audio = AudioSegment(wav.tobytes(), frame_rate=tts_model.synthesizer.output_sample_rate, sample_width=2, channels=1)
        buf = io.BytesIO()
        audio.export(buf, format='wav')
        buf.seek(0)
        return buf.read()
except Exception:
    tts_model = None
    import pyttsx3
    engine = pyttsx3.init()
    def synthesize_text(text: str) -> bytes:
        # pyttsx3 saves to a temporary file
        tmp = '/tmp/tts_out.wav'
        engine.save_to_file(text, tmp)
        engine.runAndWait()
        with open(tmp, 'rb') as f:
            data = f.read()
        return data


def require_token(req):
    auth = req.headers.get('Authorization')
    if not auth or not auth.startswith('Bearer '):
        abort(401)
    token = auth.split(' ', 1)[1]
    if token != TOKEN:
        abort(403)

@app.get('/health')
def health():
    return jsonify({'status':'ok'})

@app.post('/upload-audio')
def upload_audio():
    require_token(request)
    if 'file' not in request.files:
        return jsonify({'error':'no file uploaded'}), 400
    f = request.files['file']
    filename = secure_filename(f.filename)
    path = os.path.join(DATA_DIR, filename)
    f.save(path)
    return jsonify({'path': path})

@app.post('/synthesize')
def synthesize():
    require_token(request)
    data = request.json or {}
    text = data.get('text')
    if not text:
        return jsonify({'error':'text required'}), 400
    wav_bytes = synthesize_text(text)
    return send_file(io.BytesIO(wav_bytes), mimetype='audio/wav', as_attachment=True, download_name='synth.wav')


@app.post('/train')
def train_speaker():
    """Start training for a speaker. Accepts multipart form with files or a speaker that already has uploaded audio.
    Returns a job id. Training runs in background (simulated by default).
    """
    require_token(request)
    speaker = request.form.get('speaker') or request.args.get('speaker')
    if not speaker:
        return jsonify({'error':'speaker name required (form field `speaker` or query param)'}), 400

    # create speaker dir
    speaker_dir = os.path.join(DATA_DIR, 'speakers', secure_filename(speaker))
    os.makedirs(speaker_dir, exist_ok=True)

    # accept uploaded audio files
    files = request.files.getlist('files') if 'files' in request.files else []
    saved = []
    for f in files:
        fname = secure_filename(f.filename)
        path = os.path.join(speaker_dir, fname)
        f.save(path)
        saved.append(path)

    job_id = str(uuid.uuid4())

    def _background_train(job, spk, spk_dir):
        try:
            train.run(spk_dir, spk, job)
        except Exception as e:
            # write error file for visibility
            with open(os.path.join(spk_dir, f"{job}.err"), 'w') as fh:
                fh.write(str(e))

    thread = threading.Thread(target=_background_train, args=(job_id, speaker, speaker_dir), daemon=True)
    thread.start()

    return jsonify({'job': job_id, 'saved_files': saved})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
