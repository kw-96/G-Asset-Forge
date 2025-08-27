## docker

```sh
docker build -t g-asset-forge-server:latest .
```

## 后端接口

后端接口服务

一些密钥文件需要创建才能运行�?

1、jwt 密钥

需要创建文件夹 `src/auth/constants.ts`，贴上密钥：

```ts
export const jwtConstants = {
  secret: '这里加上自己的密�?,
};
```

然后�?`.env`，贴�?postgres 数据库密码，类似�?

```
DATABASE_URL="postgresql://用户�?密码@localhost:5432/mydb?schema=public"
```

## 启动

```sh
# create PG database by docker
pnpm run docker-start
# init Prisma DataModal
pnpm run prisma-migrate
# create seed data to test
pnpm run prisma-seed
```

start dev serve

```sh
pnpm backend:dev
```

### 房间服务�?

用于多人协同

```sh
pnpm run room-server:dev
```
