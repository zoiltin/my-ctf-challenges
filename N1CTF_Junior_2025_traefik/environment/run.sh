#!/bin/sh

su ctf -c 'cd /app && ./main &'
/traefik --configFile=/traefik.yml