# Build Environment
FROM node:16.13.0-alpine as build
WORKDIR /app
RUN npm i -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install
# Have a .dockerignore file ignoring node_modules and build
COPY . ./
RUN pnpm build

# Production
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d
CMD ["nginx", "-g", "daemon off;"]