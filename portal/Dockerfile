# Giai đoạn 1: Build Frontend React SPA
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn 2: Khởi chạy Node.js Backend & Phục vụ Static Files
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 8000
CMD ["node", "server.js"]
