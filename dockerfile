#引用镜像
FROM node:latest
RUN npm install -g pnpm
#作者
MAINTAINER wuzhixin
# 执行命令，创建文件夹
RUN mkdir -p /var/publish/nest
# 执行镜像的工作目录
WORKDIR /var/publish/nest
#使用通配符来确保package.json和package-lock.json都被复制
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install
# 捆绑应用程序来源
COPY . .
RUN pnpm run build

# 配置系统变量，指定端口
#ENV HOST 0.0.0.0
#ENV PORT 3000
ENV NODE_ENV production
# 开放端口
EXPOSE 3000

# 容器启动命令
CMD ["node","dist/src/main.js"]

