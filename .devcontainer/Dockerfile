FROM mcr.microsoft.com/devcontainers/javascript-node:24

# 1. Wine은 64비트 환경에서도 32비트 아키텍처 지원을 요구하므로 이를 추가합니다.
RUN dpkg --add-architecture i386

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
    wine \
    wine64 \
    wine32 \
    && apt clean -y && rm -rf /var/lib/apt/lists/*
