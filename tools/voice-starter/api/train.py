import os
import time

# Simulated training worker. Replace with calls to Coqui YourTTS training pipeline for production.

def run(speaker_dir: str, speaker_name: str, job_id: str):
    os.makedirs(speaker_dir, exist_ok=True)
    # simulate training time proportional to number of files
    files = [f for f in os.listdir(speaker_dir) if f.lower().endswith('.wav')]
    duration = max(5, len(files) * 2)
    time.sleep(duration)
    # write a fake model file
    model_path = os.path.join(speaker_dir, f"{job_id}.model.txt")
    with open(model_path, 'w') as fh:
        fh.write(f"simulated model for {speaker_name}, files={len(files)}\n")
    # create a done marker
    with open(os.path.join(speaker_dir, f"{job_id}.done"), 'w') as fh:
        fh.write('done')
    return model_path
