FROM node

RUN apt-get update && apt-get install -y \
    libdrm2 \
    libappindicator3-1 \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libdrm-dev \
    libgbm1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY src/package*.json /src/

WORKDIR /src

RUN npm install

COPY src/*.js /src/
COPY src/static /src/static
COPY src/templates /src/templates/

CMD ["node", "app.js"]


