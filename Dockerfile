# Étape de build Angular
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration=production

# Étape d'exécution nginx
FROM nginx:alpine
COPY --from=build /app/dist/moustaparfum/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
