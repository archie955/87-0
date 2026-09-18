# install node
FROM node:24.21.0-alpine as builder

RUN useradd -m -u 1000 dev_user
USER dev_user

# working directory
WORKDIR /client

# copy package.json deps and install deps
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.31.6-alpine-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]