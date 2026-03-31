FROM mcr.microsoft.com/devcontainers/javascript-node:24

# Electron GUI(크로미움 기반)를 컨테이너 내부에서 실행하기 위한 필수 Linux 패키지 설치
RUN apt update && export DEBIAN_FRONTEND=noninteractive \
    && apt -y install --no-install-recommends \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    fonts-noto-cjk \
    && apt clean -y && rm -rf /var/lib/apt/lists/*
