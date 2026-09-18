# build stage
FROM node:24.21.0-alpine AS builder

WORKDIR /client

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# serve stage
FROM nginxinc/nginx-unprivileged:1.27-alpine-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /client/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]