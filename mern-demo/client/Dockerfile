# Câu 51
FROM node:20-alpine

# Câu 52
WORKDIR /app

# Câu 53
COPY package.json package-lock.json ./

# Câu 54
RUN npm install

# Câu 55
COPY . .

# Câu 56
RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]