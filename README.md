# Smart-Fit-Agent 🏃‍♂️🤖

> AI驱动的智能健康管理应用 - 让人工智能成为您的专属健康顾问

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## ✨ 项目简介
Smart-Fit-Agent 是一款融合多模态人工智能与前沿医疗知识的健康管理应用。应用集成了现代Web技术与Google Gemini AI的强大算力，能够智能解析用户的生理、行为和环境数据，生成高度个性化的健康管理方案。
本项目由一名麻醉医生开发，致力于跨界运用AI技术科学应对体重管理难题。想获取更多专业健康与睡眠科普，请关注公众号 “睡眠魔法师”，开启你的健康进阶之旅！
### 🎯 核心特性

- 🧠 **AI个性化计划生成** - 基于用户画像生成独特的餐食和运动计划
- 📸 **智能图像识别** - 拍照即可获得精准的营养分析
- 💬 **AI健康顾问** - 24/7智能健康咨询服务
- 📊 **实时数据追踪** - 全方位健康数据可视化
- 🎨 **现代化UI** - 响应式设计，完美适配各种设备
- 🔒 **安全可靠** - JWT认证，数据安全保障

### 🏗️ 技术架构

**前端技术栈**
- ⚛️ React 18 + TypeScript
- ⚡ Vite (构建工具)
- 🔄 TanStack Query (状态管理)
- 🎨 shadcn/ui + Tailwind CSS (UI框架)
- 🧭 Wouter (路由)

**后端技术栈**
- 🟢 Node.js + Express.js
- 🗃️ Drizzle ORM + PostgreSQL
- 🤖 Google Gemini AI API
- 🔐 JWT认证
- 📊 Zod数据验证

## 🚀 快速开始

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

# 编辑环境变量文件 (重要：填入您的API密钥)
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

# 应用将在 http://localhost:5000 启动
```

## 🔑 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# 数据库连接
DATABASE_URL=postgresql://username:password@localhost:5432/smart_fit_agent

# AI服务密钥 (必需)
GEMINI_API_KEY=your_google_gemini_api_key_here

# JWT密钥 (必需)
JWT_SECRET=your_super_secret_jwt_key_here

# 服务器配置
NODE_ENV=development
PORT=5000
```

### 获取API密钥
1. **Google Gemini API**: 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 将密钥添加到 `.env` 文件

## 📜 可用脚本

```bash
# 开发
npm run dev          # 启动开发服务器
npm run check        # TypeScript类型检查

# 构建
npm run build        # 构建生产版本
npm start           # 启动生产服务器

# 数据库
npm run db:push     # 推送数据库架构

# Docker
docker-compose up   # 使用Docker启动完整环境
```

## 🌐 部署选项

### Vercel (推荐)
1. Fork此仓库到您的GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 自动部署

### Railway
1. 连接GitHub仓库
2. 添加PostgreSQL插件
3. 配置环境变量

### Docker
```bash
docker-compose up -d
```

## 📁 项目结构

```
smart-fit-agent/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/         # 页面组件
│   │   ├── lib/           # 工具库
│   │   └── hooks/         # 自定义Hooks
├── server/                # 后端代码
│   ├── routes.ts          # API路由
│   ├── auth.ts           # 认证逻辑
│   ├── storage.ts        # 数据访问层
│   └── db.ts             # 数据库配置
├── shared/               # 共享代码
│   └── schema.ts         # 数据模型
└── docs/                # 文档
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Google Gemini AI](https://ai.google.dev/) - 强大的AI服务
- [shadcn/ui](https://ui.shadcn.com/) - 优秀的UI组件库
- [Drizzle ORM](https://orm.drizzle.team/) - 现代化的ORM工具

## 📞 联系我们

- 📧 Email: ylx3020129@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/smart-fit-agent/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/smart-fit-agent/discussions)

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
