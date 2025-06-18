# 贡献指南

感谢您对Smart-Fit-Agent项目的关注！我们欢迎各种形式的贡献。

## 🤝 如何贡献

### 报告Bug
1. 检查是否已有相关issue
2. 使用bug报告模板创建新issue
3. 提供详细的重现步骤
4. 包含系统信息和错误日志

### 功能请求
1. 检查是否已有相关讨论
2. 在Discussions中提出想法
3. 详细描述功能需求和使用场景
4. 等待社区反馈

### 代码贡献
1. Fork项目到您的GitHub账户
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 进行开发并测试
4. 提交代码: `git commit -m 'Add amazing feature'`
5. 推送分支: `git push origin feature/amazing-feature`
6. 创建Pull Request

## 📋 开发环境设置

### 前置要求
- Node.js 18+
- PostgreSQL 14+
- Git

### 本地开发
```bash
# 1. 克隆您的fork
git clone https://github.com/your-username/smart-fit-agent.git
cd smart-fit-agent

# 2. 添加上游仓库
git remote add upstream https://github.com/original-owner/smart-fit-agent.git

# 3. 安装依赖
npm install

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 5. 设置数据库
npm run db:push

# 6. 启动开发服务器
npm run dev
```

## 📝 代码规范

### TypeScript
- 使用严格的TypeScript配置
- 为所有函数添加类型注解
- 避免使用 `any` 类型

### 代码风格
- 使用2个空格缩进
- 使用分号结尾
- 使用单引号字符串
- 最大行长度120字符

### 命名规范
- 变量和函数: camelCase
- 常量: UPPER_SNAKE_CASE
- 组件: PascalCase
- 文件名: kebab-case

### 提交信息
使用约定式提交格式：
```
type(scope): description

[optional body]

[optional footer]
```

类型：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建过程或辅助工具

示例：
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh to improve user experience
and reduce login frequency.

Closes #123
```

## 🧪 测试

### 运行测试
```bash
# 类型检查
npm run check

# 构建测试
npm run build

# 安全审计
npm audit
```

### 测试要求
- 新功能必须包含测试
- 修复bug必须包含回归测试
- 保持测试覆盖率不下降

## 📚 文档

### 文档更新
- API变更需要更新文档
- 新功能需要添加使用说明
- 重大变更需要更新迁移指南

### 文档格式
- 使用Markdown格式
- 包含代码示例
- 提供清晰的步骤说明

## 🔍 代码审查

### Pull Request要求
- 清晰的标题和描述
- 关联相关issue
- 包含测试和文档更新
- 通过所有CI检查

### 审查流程
1. 自动化检查（CI/CD）
2. 代码审查（至少1个维护者）
3. 功能测试
4. 合并到主分支

## 🏷️ 发布流程

### 版本号规则
遵循语义化版本控制（SemVer）：
- MAJOR: 不兼容的API变更
- MINOR: 向后兼容的功能新增
- PATCH: 向后兼容的问题修正

### 发布步骤
1. 更新版本号
2. 更新CHANGELOG
3. 创建发布标签
4. 发布到npm（如适用）
5. 部署到生产环境

## 🎯 优先级

当前开发重点：
1. 🔒 安全性改进
2. 🚀 性能优化
3. 📱 移动端体验
4. 🌐 国际化支持
5. 🧪 测试覆盖率

## 💬 社区

### 沟通渠道
- GitHub Issues: 问题报告和功能请求
- GitHub Discussions: 一般讨论和问答
- Email: 安全问题和私人联系

### 行为准则
- 尊重所有贡献者
- 建设性的反馈
- 包容和友好的环境
- 专注于技术讨论

## 🙏 致谢

感谢所有贡献者的努力！您的贡献让这个项目变得更好。

### 贡献者列表
- [待添加]

---

如有任何问题，请随时在GitHub上创建issue或发起讨论！
