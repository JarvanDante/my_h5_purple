# my_h5_purple

内容站 H5 架子（Vue3 + Vite + Vant + Vue Router）。  
工程形态参考 `jh_h5`（手机框、底部导航、紫金主题），页面结构参考旧站首页：顶部分类 + 底栏五 Tab。

## 底栏

- 二次元 `/comic`
- 视频 `/video`
- 星球 `/planet`
- AI `/ai`
- 我的 `/me`

目前只有界面占位，未接接口。

## 本地启动

在 mydocker 的 node 容器里跑（不要在宿主机直接 `pnpm`）：

```bash
cd ~/D/mydocker
docker-compose exec node /bin/sh
cd /var/www/html/my/my_h5_purple
pnpm install
pnpm dev
```

浏览器打开 `http://127.0.0.1:5174`（避开 `jh_h5` 的 5173）。
