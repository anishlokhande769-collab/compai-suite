FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# In dev mode, we just run next dev. For prod, we would build.
# For simplicity in this demo, we'll keep it in dev mode.
CMD ["npm", "run", "dev", "--", "-p", "3000"]
