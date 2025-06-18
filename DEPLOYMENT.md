# Smart-Fit-Agent 部署指南

## 🚀 快速部署

### 环境要求
- Node.js 18+ 
- PostgreSQL 14+
- npm 或 yarn

### 1. 克隆项目
```bash
git clone https://github.com/your-username/smart-fit-agent.git
cd smart-fit-agent
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量文件
nano .env
```

### 4. 数据库设置
```bash
# 推送数据库架构
npm run db:push
```

### 5. 启动应用
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## 🔑 API密钥配置

### Google Gemini API
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 将密钥添加到 `.env` 文件：
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 数据库连接
1. 创建PostgreSQL数据库
2. 获取连接字符串
3. 更新 `.env` 文件：
   ```
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

## 🌐 部署平台

### Vercel 部署
1. 连接GitHub仓库
2. 设置环境变量
3. 自动部署

### Railway 部署
1. 连接GitHub仓库
2. 添加PostgreSQL服务
3. 配置环境变量

### Docker 部署
```bash
# 构建镜像
docker build -t smart-fit-agent .

# 运行容器
docker run -p 5000:5000 --env-file .env smart-fit-agent
```

## ⚠️ 安全注意事项

1. **永远不要提交 `.env` 文件**
2. **使用强密码和随机JWT密钥**
3. **定期轮换API密钥**
4. **启用HTTPS**
5. **配置CORS正确的域名**

## 🔧 故障排除

### 常见问题
1. **数据库连接失败**: 检查DATABASE_URL格式
2. **API密钥无效**: 验证Gemini API密钥
3. **端口冲突**: 修改PORT环境变量
4. **构建失败**: 检查Node.js版本

### 日志查看
```bash
# 查看应用日志
npm run logs

# 查看数据库日志
npm run db:logs
```
