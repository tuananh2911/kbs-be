# Sử dụng hình ảnh cơ sở Node.js
FROM node:18

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json (nếu có) vào thư mục làm việc
COPY package*.json /usr/src/app

# Sao chép mã nguồn ứng dụng vào thư mục làm việc


RUN npm install --legacy-peer-deps -g @nestjs/cli
# Cài đặt các dependencies
RUN npm install --legacy-peer-deps

COPY . .

# Mở cổng 5000 cho ứng dụng NestJS
EXPOSE 5000

# Test ung dung
CMD ["npm", "run", "test"]

# Khởi chạy ứng dụng NestJS
CMD ["npm", "run", "start"]