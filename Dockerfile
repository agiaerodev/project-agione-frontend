FROM node:20-alpine

# Dependencias del sistema
RUN apk add --no-cache bash git python3 make g++

WORKDIR /app

# Copiar archivos de dependencias primero (para usar cache de Docker)
COPY package*.json .npmrc ./

# Instalar dependencias del proyecto
RUN yarn install --frozen-lockfile

# Instalar Quasar CLI global
RUN npm install -g @quasar/cli

# Copiar el resto del código
COPY . .

# Exponer puerto de Quasar
EXPOSE 8080

# Arrancar Quasar en modo desarrollo PWA
CMD ["quasar", "dev", "-m", "pwa", "--host", "0.0.0.0", "--watch", "--poll", "2000"]
