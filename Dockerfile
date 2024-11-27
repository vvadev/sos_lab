# Используем официальный образ Node.js LTS версии
FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы приложения
COPY . .

RUN npm run build

# (Опционально) Указываем переменные окружения, если необходимо
ENV NODE_ENV=production

# Открываем необходимый порт (замените 3000 на ваш порт, если он другой)
EXPOSE 3000

CMD ["npm", "run", "migrations"]

# Команда для запуска приложения
CMD ["npm", "run", "dev"]