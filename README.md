<p align="center">
  <img src="https://img.icons8.com/fluency/128/security-shield-green.png" alt="CloudSentry" width="128" height="128">
</p>

<h1 align="center">CloudSentry 云卫安全</h1>

<p align="center">
  <strong>现代化安全事件管理平台</strong>
</p>

<p align="center">
  一个基于 TypeScript 构建的完整安全解决方案，用于接收、存储、分析和管理来自 Syslog 源的安全告警和事件。<br/>
  AI 智能映射、实时威胁监控、多通道管理 —— 一应俱全。
</p>

<p align="center">
  <a href="https://github.com/liubaicai/CloudSentry/releases/latest"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/liubaicai/CloudSentry?style=for-the-badge&logo=github&label=Release"></a>
  &nbsp;
  <a href="#"><img alt="Platform" src="https://img.shields.io/badge/Platform-Docker%20%7C%20Node.js-blue?style=for-the-badge&logo=docker"></a>
  &nbsp;
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"></a>
</p>

<p align="center">
  <a href="./README.md">简体中文</a> · <a href="./README.en.md">English</a>
</p>

---

# 目录 <!-- omit in toc -->

- [CloudSentry 是什么](#cloudsentry-是什么)
- [功能特性](#功能特性)
    - [🔐 认证与权限](#-认证与权限)
    - [📊 仪表盘与可视化](#-仪表盘与可视化)
    - [🚨 威胁管理](#-威胁管理)
    - [🌐 通道管理](#-通道管理)
    - [🔄 字段映射](#-字段映射)
    - [🤖 AI 智能映射](#-ai-智能映射)
    - [📤 告警转发](#-告警转发)
    - [🔌 Syslog 服务](#-syslog-服务)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
    - [环境要求](#环境要求)
    - [使用 Docker（推荐）](#使用-docker推荐)
    - [单镜像 Docker 部署](#单镜像-docker-部署)
    - [Linux 一键安装](#linux-一键安装)
    - [Windows 一键安装](#windows-一键安装)
    - [手动安装](#手动安装)
    - [访问应用](#访问应用)
    - [默认凭证](#默认凭证)
- [项目结构](#项目结构)
- [配置说明](#配置说明)
    - [后端环境变量](#后端环境变量)
    - [前端环境变量](#前端环境变量)
    - [数据库命令](#数据库命令)
    - [生产构建](#生产构建)
- [API 文档](#api-文档)
    - [认证 API](#认证-api)
    - [Syslog 数据接入](#syslog-数据接入)
    - [事件管理 API](#事件管理-api)
    - [仪表盘 API](#仪表盘-api)
- [🤖 AI 智能字段映射](#-ai-智能字段映射)
    - [核心功能](#核心功能)
    - [增强的威胁数据模型](#增强的威胁数据模型)
    - [快速入门](#快速入门)
- [⏰ 数据保留策略](#-数据保留策略)
    - [功能特点](#功能特点)
    - [为什么选择 7 天？](#为什么选择-7-天)
    - [性能指标](#性能指标)
- [🔒 安全注意事项](#-安全注意事项)
- [参与贡献](#参与贡献)
- [开源协议](#开源协议)

---

<a name="cloudsentry-是什么"></a>
# CloudSentry 是什么

**CloudSentry（云卫安全）** 是一款现代化的安全事件管理平台，专为需要集中管理和分析安全威胁的企业和团队设计。

- **CloudSentry 是** 一个完整的 SIEM 解决方案，支持多源日志接入
- **CloudSentry 是** 一个智能威胁分析平台，支持 AI 驱动的字段映射
- **CloudSentry 是** 一个实时监控仪表盘，可视化展示安全态势
- **CloudSentry 是** 一个轻量级部署方案，适合边缘和云端部署

---

<a name="功能特性"></a>
# 功能特性

### 🔐 认证与权限
- **JWT 认证** —— 安全的令牌认证机制
- **角色管理** —— 基于角色的访问控制（RBAC）
- **用户管理** —— 完整的用户账户生命周期管理

### 📊 仪表盘与可视化
- **实时统计** —— 安全事件实时统计数据
- **趋势分析** —— 时间序列数据可视化
- **威胁分布** —— 按类型、严重级别分类展示

### 🚨 威胁管理
- **事件列表** —— 高级过滤和搜索
- **详情视图** —— 单个事件深度分析
- **状态跟踪** —— 新建、处理中、已解决状态流转
- **指派功能** —— 将事件分配给团队成员

### 🌐 通道管理
| 功能 | 描述 |
|-----|-----|
| **自动发现** | 从新源接收 syslog 时自动创建通道 |
| **事件跟踪** | 监控每个通道的事件数和最后事件时间 |
| **自定义命名** | 为发现的通道分配有意义的名称 |
| **通道控制** | 启用/禁用特定通道 |

### 🔄 字段映射
| 类型 | 描述 | 使用场景 |
|-----|-----|---------|
| **直接复制** | 原值映射 | 字段名一致时 |
| **正则提取** | 正则表达式提取 | 从消息中提取 IP、端口等 |
| **查找表** | 值转换映射 | 严重级别转换、状态码转换 |

### 🤖 AI 智能映射
- **自动生成** —— AI 分析样本数据并生成映射规则
- **智能复用** —— 检查并复用兼容的现有映射
- **OpenAI 兼容** —— 支持 OpenAI API 或兼容服务

### 📤 告警转发
- **Webhook** —— HTTP 回调通知
- **邮件** —— SMTP 邮件通知
- **Syslog** —— 转发到其他 Syslog 服务器

### 🔌 Syslog 服务
| 端口 | 协议 | 描述 |
|-----|-----|-----|
| **514** | TCP | 可靠传输，保证送达 |
| **514** | UDP | 高性能，低延迟 |
| **3000** | HTTP | RESTful API 端点 |

---

<a name="技术栈"></a>
# 技术栈

| 分类 | 技术 |
|-----|-----|
| **后端框架** | Node.js + Express.js |
| **编程语言** | TypeScript |
| **数据库** | PostgreSQL + Prisma ORM |
| **认证** | JWT (JSON Web Token) |
| **日志** | Winston |
| **AI 集成** | OpenAI SDK |
| **前端框架** | React 18 |
| **构建工具** | Vite |
| **UI 组件库** | Ant Design |
| **图表** | Recharts |
| **HTTP 客户端** | Axios |
| **容器化** | Docker + Docker Compose |
| **Web 服务器** | Caddy |

---

<a name="快速开始"></a>
# 快速开始

### 环境要求

| 依赖 | 版本 | 必需 |
|-----|-----|-----|
| Node.js | 18+ | ✅ |
| PostgreSQL | 14+ | ✅ |
| npm | 最新 | ✅ |
| Docker | 最新 | 可选 |

### 使用 Docker（推荐）

```bash
# 克隆仓库
git clone https://github.com/liubaicai/CloudSentry.git
cd CloudSentry

# 启动所有服务
docker-compose up -d
```

这将启动：
- 🐘 PostgreSQL 数据库（端口 5432）
- 🚀 后端 API（端口 3000）
- 🌐 前端界面（端口 5173）
- 📡 Syslog 服务（TCP/UDP 端口 514）

### 单镜像 Docker 部署

如果您希望使用单个 Docker 镜像来部署完整的 CloudSentry（包含数据库、后端和前端），可以使用 `Dockerfile.standalone`：

```bash
# 克隆仓库
git clone https://github.com/liubaicai/CloudSentry.git
cd CloudSentry

# 构建单体镜像
docker build -f Dockerfile.standalone -t cloudsentry-standalone .

# 运行容器（推荐：设置自定义密钥）
docker run -d \
  -p 80:80 \
  -p 514:514/tcp \
  -p 514:514/udp \
  -v cloudsentry-data:/var/lib/postgresql/14/main \
  -e JWT_SECRET="$(openssl rand -base64 48)" \
  -e POSTGRES_PASSWORD="$(openssl rand -base64 24)" \
  --name cloudsentry \
  cloudsentry-standalone
```

> ⚠️ **安全提示**: 如果不设置 `JWT_SECRET` 和 `POSTGRES_PASSWORD`，系统将自动生成随机密钥。对于生产环境，建议手动设置并妥善保管。

单镜像部署的优点：
- 📦 单一镜像，简化部署和管理
- 💾 数据持久化通过 Docker volume 实现
- 🔧 无需额外配置数据库连接
- 🔐 自动生成安全密钥（如未手动设置）
- 🚀 适合快速部署和测试环境

### Linux 一键安装

使用安装脚本在 Linux 服务器上一键部署（支持 Ubuntu/Debian, CentOS/RHEL/Fedora, Arch Linux）：

```bash
# 克隆仓库
git clone https://github.com/liubaicai/CloudSentry.git
cd CloudSentry

# 运行安装脚本（需要 root 权限）
sudo bash install-linux.sh
```

安装脚本将自动：
- 检测您的 Linux 发行版
- 安装 Node.js 20.x
- 安装并配置 PostgreSQL
- 安装并配置 Caddy Web 服务器
- 安装 CloudSentry 应用
- 创建系统服务
- 🔐 自动生成安全的随机密码和 JWT 密钥

### Windows 一键安装

使用 PowerShell 脚本在 Windows 上一键部署：

```powershell
# 克隆仓库
git clone https://github.com/liubaicai/CloudSentry.git
cd CloudSentry

# 以管理员身份运行 PowerShell，然后执行：
powershell -ExecutionPolicy Bypass -File install-windows.ps1
```

安装脚本将自动：
- 安装 Chocolatey 包管理器
- 安装 Node.js 20.x
- 安装并配置 PostgreSQL 16
- 安装并配置 Caddy Web 服务器
- 安装 CloudSentry 应用
- 创建 Windows 服务
- 配置防火墙规则
- 🔐 自动生成安全的随机密码和 JWT 密钥

### 手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/liubaicai/CloudSentry.git
cd CloudSentry

# 2. 安装依赖
npm run install:all

# 3. 配置后端
cd backend
cp .env.example .env
# 编辑 .env 文件配置数据库凭证

# 4. 运行数据库迁移
npm run prisma:migrate
npm run prisma:generate

# 5. 启动开发服务器
cd ..
npm run dev:backend   # 终端 1
npm run dev:frontend  # 终端 2
```

### 访问应用

| 服务 | 地址 |
|-----|-----|
| 前端界面 | http://localhost:5173 |
| 后端 API | http://localhost:3000 |
| API 健康检查 | http://localhost:3000/health |
| Syslog TCP | localhost:514 |
| Syslog UDP | localhost:514 |

### 默认凭证

> ⚠️ **首次安装后，请通过 API 或注册页面创建管理员用户**

测试用户（如已创建）：
- 用户名: `admin`
- 密码: `admin123`
- 邮箱: `admin@cloudsentry.local`

---

<a name="项目结构"></a>
# 项目结构

```
CloudSentry/
├── backend/                 # 后端 API 服务器
│   ├── src/
│   │   ├── controllers/    # 请求处理器
│   │   ├── routes/         # API 路由
│   │   ├── middleware/     # Express 中间件
│   │   ├── services/       # 业务服务
│   │   ├── config/         # 配置文件
│   │   └── utils/          # 工具函数
│   ├── prisma/             # 数据库模式和迁移
│   └── package.json
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── contexts/       # React 上下文
│   │   └── types/          # TypeScript 类型
│   └── package.json
├── docker-compose.yml      # Docker 配置
└── AGENTS.md               # AI 代理开发指南
```

---

<a name="配置说明"></a>
# 配置说明

### 后端环境变量

在 `backend` 目录创建 `.env` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://postgres:password@localhost:5432/cloudsentry?schema=public"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# 服务器配置
PORT=3000
NODE_ENV="development"

# CORS 配置
CORS_ORIGIN="http://localhost:5173"
```

### 前端环境变量

在 `frontend` 目录创建 `.env` 文件（可选）：

```env
VITE_API_URL=/api
```

### 数据库命令

```bash
cd backend
npm run prisma:migrate      # 创建并应用迁移
npm run prisma:generate     # 生成 Prisma 客户端
npm run prisma:studio       # 打开 Prisma Studio
npm run prisma:seed         # 填充示例数据
```

### 生产构建

```bash
npm run build               # 构建前端和后端
npm run build:backend       # 仅构建后端
npm run build:frontend      # 仅构建前端
```

---

<a name="api-文档"></a>
# API 文档

### 认证 API

**注册**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

**登录**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Syslog 数据接入

**原生 Syslog 协议（推荐）**

支持标准 RFC 3164 和 RFC 5424 格式：

```bash
# UDP 方式
echo "<14>Jan 13 10:00:00 myhost myapp[1234]: Test security event" | nc -u localhost 514

# TCP 方式
echo "<14>Jan 13 10:00:00 myhost myapp[1234]: Test security event" | nc localhost 514
```

**HTTP API - 单条事件**
```bash
POST /api/syslog
Content-Type: application/json

{
  "timestamp": "2024-01-12T10:30:00Z",
  "severity": "critical",
  "category": "intrusion",
  "source": "192.168.1.100",
  "destination": "192.168.1.200",
  "message": "检测到可疑活动",
  "protocol": "TCP",
  "port": 22,
  "tags": ["ssh", "暴力破解"]
}
```

**HTTP API - 批量事件**
```bash
POST /api/syslog/bulk
Content-Type: application/json

[
  {
    "severity": "high",
    "category": "malware",
    "source": "192.168.1.105",
    "message": "检测到恶意软件"
  },
  {
    "severity": "medium",
    "category": "policy_violation",
    "source": "192.168.1.110",
    "message": "检测到策略违规"
  }
]
```

### 事件管理 API

**获取事件列表**
```bash
GET /api/events?page=1&limit=20&severity=critical&status=new
Authorization: Bearer <token>
```

**更新事件状态**
```bash
PATCH /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "assignedTo": "admin"
}
```

### 仪表盘 API

```bash
# 获取统计数据
GET /api/dashboard/stats
Authorization: Bearer <token>

# 获取时间序列数据
GET /api/dashboard/timeseries?days=7
Authorization: Bearer <token>
```

---

<a name="ai-智能字段映射"></a>
# 🤖 AI 智能字段映射

CloudSentry 支持使用 OpenAI 兼容 API 自动生成字段映射：

### 核心功能

| 功能 | 描述 |
|-----|-----|
| **自动生成映射** | AI 分析样本数据并生成适当的字段映射 |
| **智能复用** | 系统在生成新映射前检查兼容的现有映射 |
| **学习系统** | 映射被存储并用于类似的数据结构 |
| **OpenAI 兼容** | 支持 OpenAI API 或兼容服务（Azure OpenAI、本地模型等） |

### 增强的威胁数据模型

| 字段 | 描述 |
|-----|-----|
| `threatName` | 威胁名称/标识符 |
| `threatLevel` | 威胁严重级别 |
| `sourceIp` / `destinationIp` | 增强的网络信息 |
| `sourcePort` / `destinationPort` | 端口信息 |
| `sourceChannel` | 通道标识符 |
| `rawData` | 完整原始数据 |

### 快速入门

**1. 配置 OpenAI API**
```bash
POST /api/openai-config
{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-...",
  "model": "gpt-3.5-turbo"
}
```

**2. 为通道生成映射**
```bash
POST /api/channels/:id/ai-mappings/generate
{
  "sampleData": {
    "src_ip": "192.168.1.100",
    "alert_level": "3",
    "message": "检测到威胁"
  }
}
```

**3. 应用生成的映射**
```bash
POST /api/channels/:id/ai-mappings/apply
{
  "mappings": [...生成的映射...]
}
```

---

<a name="数据保留策略"></a>
# ⏰ 数据保留策略

CloudSentry 实现了轻量级数据保留策略以获得最佳性能：

### 功能特点

| 特性 | 描述 |
|-----|-----|
| **7 天默认保留** | 保持平台轻量和高性能 |
| **自动清理** | 每天运行以删除旧数据 |
| **可配置** | 保留期可通过服务调整 |
| **PostgreSQL 优化** | 高效删除和空间回收 |

### 为什么选择 7 天？

- ⚡ **性能**: 较小的数据集 = 更快的查询
- 🪶 **轻量级**: 适合边缘部署
- ✅ **足够**: 对于实时威胁监控已足够
- 💾 **可归档**: 如需长期存储可导出旧数据

### 性能指标

PostgreSQL 结合 7 天保留窗口可以处理：

| 指标 | 数值 |
|-----|-----|
| 最大事件处理速度 | 10,000 事件/分钟 |
| 7 天总事件数 | ~600 万 |
| 查询响应时间 | < 1 秒 |

---

<a name="安全注意事项"></a>
# 🔒 安全注意事项

| 建议 | 描述 |
|-----|-----|
| 🔑 **更改 JWT 密钥** | 生产环境中务必更改默认密钥 |
| 🔐 **强密码策略** | 使用复杂密码 |
| 🔒 **启用 HTTPS** | 生产环境必须启用 |
| 🌐 **配置 CORS** | 正确配置允许的来源 |
| ⏱️ **速率限制** | 为 API 端点配置限流 |
| 🔄 **定期更新** | 进行安全审计和更新 |
| 🔐 **环境变量** | 使用环境变量存储敏感数据 |

---

<a name="参与贡献"></a>
# 参与贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

查看 [AGENTS.md](AGENTS.md) 了解架构概述和编码规范。

---

<a name="开源协议"></a>
# 开源协议

本项目采用 **MIT 协议** 开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<p align="center">
  如有问题和疑问，请在 <a href="https://github.com/liubaicai/CloudSentry/issues">GitHub</a> 上提交 Issue
</p>

<p align="center">
  用 ❤️ 制作
</p>