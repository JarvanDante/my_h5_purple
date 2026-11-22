# 草稿：先在宿主机 pnpm build 或 pnpm build:test 生成 dist，再打成 nginx 镜像。
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
