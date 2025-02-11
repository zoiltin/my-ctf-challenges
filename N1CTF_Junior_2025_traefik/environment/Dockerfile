FROM golang:1.17.5-alpine

RUN wget https://github.com/traefik/traefik/releases/download/v3.2.3/traefik_v3.2.3_linux_amd64.tar.gz -O /tmp/traefik_v3.2.3_linux_amd64.tar.gz && \
    tar -zxf /tmp/traefik_v3.2.3_linux_amd64.tar.gz -C /tmp/ && \
    mv /tmp/traefik /traefik && \
    rm /tmp/*

# COPY traefik_v3.2.3_linux_amd64.tar.gz /tmp/
# RUN tar -zxf /tmp/traefik_v3.2.3_linux_amd64.tar.gz -C /tmp/ && \
#     mv /tmp/traefik /traefik && \
#     rm /tmp/*

COPY src /src/

WORKDIR /src

RUN go env -w GOPROXY=https://goproxy.cn && \
    go mod tidy && \
    go build -o /app/main && \
    rm -rf /src

COPY run.sh config/traefik.yml /
COPY config/dynamic.yml /app/.config/
COPY templates /app/templates/

RUN adduser -D -h /dev/null ctf && \
    mkdir /app/uploads && \
    chown ctf:ctf -R /app/.config /app/uploads    

CMD ["sh", "/run.sh"]