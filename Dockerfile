# Build Environment
FROM node:14.15.0-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
# Have a .dockerignore file ignoring node_modules and build
COPY . ./
ENV GENERATE_SOURCEMAP false
RUN npm run build

# Production
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d
CMD ["nginx", "-g", "daemon off;"]