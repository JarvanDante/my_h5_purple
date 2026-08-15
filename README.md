# my_h5_purple

验收 H5：对接 `my_service` `/front/v1`，子后台在 `my_backend` 对照验收。

## 启动

在 mydocker 的 node 容器里跑（不要在宿主机直接 `pnpm`）：

```bash
cd ~/D/mydocker
docker-compose exec node /bin/sh
cd /var/www/html/my/my_h5_purple
pnpm install
pnpm dev
```

浏览器 `http://127.0.0.1:5174`。Vite 把 `/front` 代理到容器内 `http://my_service:8000`。

## P0 验收对照

| 项 | 前台 | 接口 | 子后台 | 状态 |
|---|---|---|---|---|
| P0-1 启动配置 | 首页站名 / 维护条 | `GET /config/info` | 系统设置 → 基础配置 | 已接 |
| P0-2 设备登录 | 我的 | `POST /user/login` `GET /user/info` | 用户管理 → 用户列表 | 已接 |
| P0-3 会员 VIP | VIP 页 | `GET /user/vip` `POST /user/vip/do` | 用户管理 → 会员等级 | 待接 |
| P0-4 金币钱包 | 我的 / 钱包 | `GET /wallet/balance` `GET /user/recharge` | 资金管理 → 金币钱包 | 待接 |
| P0-5 主内容 | 二次元 / 视频 | `/comics/list` `/video/list` + detail | 漫画管理 / 视频管理 | 待接 |
