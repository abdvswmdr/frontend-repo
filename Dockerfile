FROM node:20-alpine
WORKDIR /opt/frontend          
COPY package.json ./
RUN npm install
EXPOSE 8079
COPY . .
CMD ["node", "server.js"]
