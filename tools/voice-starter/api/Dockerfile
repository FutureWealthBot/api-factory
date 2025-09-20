FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	   ffmpeg \
	   espeak \
	   libespeak1 \
	   libasound2 \
	   libsndfile1 \
		 build-essential \
		 libsndfile1-dev \
		 libssl-dev \
		 pkg-config \
		 libffi-dev \
	&& rm -rf /var/lib/apt/lists/* \
	&& pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV FLASK_APP=app.py
EXPOSE 8080
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
