# Syslog Collector 独立组件架构设计

## 📋 概述

本文档讨论将 Syslog 接收和处理功能从 CloudSentry 后端分离为独立组件的架构方案，并评估其必要性和实现建议。

## 🎯 当前架构分析

### 现有实现

当前 CloudSentry 的 syslog 处理功能直接集成在 Node.js 后端中：

```
┌─────────────────────────────────────────────────────────┐
│                    CloudSentry Backend                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Syslog UDP  │  │ Syslog TCP  │  │  HTTP API       │ │
│  │ Server      │  │ Server      │  │  /api/syslog    │ │
│  │ (port 514)  │  │ (port 514)  │  │  (port 3000)    │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                   │          │
│         └────────────────┼───────────────────┘          │
│                          ▼                              │
│              ┌───────────────────────┐                  │
│              │    Syslog Parser      │                  │
│              │  (glossy + fallback)  │                  │
│              └───────────┬───────────┘                  │
│                          ▼                              │
│              ┌───────────────────────┐                  │
│              │   Field Mapping       │                  │
│              └───────────┬───────────┘                  │
│                          ▼                              │
│              ┌───────────────────────┐                  │
│              │   PostgreSQL          │                  │
│              │   (Prisma ORM)        │                  │
│              └───────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### 关键文件

| 文件 | 功能 |
|-----|------|
| `backend/src/services/syslogServerService.ts` | TCP/UDP 服务器实现 |
| `backend/src/utils/syslogParser.ts` | RFC 3164/5424 解析器 |
| `backend/src/controllers/syslogController.ts` | HTTP API 处理器 |
| `backend/src/routes/syslog.ts` | HTTP 路由定义 |

### 当前性能指标

根据 README 文档，当前架构可处理：
- 最大事件处理速度：10,000 事件/分钟
- 7 天总事件数：约 600 万
- 查询响应时间：< 1 秒

## 🤔 是否需要分离？

### 分离的优点

| 优点 | 说明 |
|-----|------|
| **高性能处理** | Rust/Go 在网络 I/O 和并发处理方面性能更优 |
| **独立扩展** | 可独立扩展 syslog 收集器，不影响业务 API |
| **故障隔离** | syslog 收集器崩溃不会影响 Web 界面和 API |
| **资源隔离** | 可为收集器分配专门的 CPU/内存资源 |
| **专注职责** | 单一职责原则，代码更清晰 |
| **多实例部署** | 可在多个边缘节点部署收集器，汇聚到中心 |

### 分离的缺点

| 缺点 | 说明 |
|-----|------|
| **增加复杂度** | 需要维护多个项目和运行时 |
| **部署成本** | 需要额外的容器/进程管理 |
| **调试困难** | 跨服务调试更复杂 |
| **技术栈分散** | 需要 Rust/Go 开发能力 |
| **网络开销** | 收集器与后端之间的 HTTP 通信开销 |

### 建议判断标准

**推荐分离的场景：**
- 预期 syslog 吞吐量 > 50,000 事件/分钟
- 需要在多个边缘节点部署收集器
- 后端 API 经常因高负载影响 syslog 接收
- 需要 7x24 高可用，收集器和 API 需独立升级

**保持现有架构的场景：**
- 当前性能满足需求
- 团队技术栈以 TypeScript/JavaScript 为主
- 部署环境简单，追求运维便捷
- 事件量在 10,000 事件/分钟以内

## 🏗️ 推荐架构方案

如果决定分离，推荐以下架构：

```
                           ┌─────────────────────────────────┐
                           │     Syslog Collector (Go)       │
                           │  ┌───────────┐ ┌───────────┐   │
Syslog Sources ──TCP/UDP──▶│  │ UDP :514  │ │ TCP :514  │   │
                           │  └─────┬─────┘ └─────┬─────┘   │
                           │        │             │          │
                           │        └──────┬──────┘          │
                           │               ▼                 │
                           │    ┌─────────────────────┐      │
                           │    │  Parser & Transform │      │
                           │    │  (RFC 3164/5424)    │      │
                           │    └──────────┬──────────┘      │
                           │               │                 │
                           │    ┌──────────▼──────────┐      │
                           │    │   Buffer Queue      │      │
                           │    │   (in-memory/disk)  │      │
                           │    └──────────┬──────────┘      │
                           │               │                 │
                           └───────────────┼─────────────────┘
                                           │
                                           │ HTTP POST /api/syslog/bulk
                                           ▼
                           ┌─────────────────────────────────┐
                           │      CloudSentry Backend        │
                           │  ┌───────────────────────────┐  │
                           │  │    Field Mapping          │  │
                           │  │    Channel Management     │  │
                           │  │    Event Storage          │  │
                           │  └───────────────────────────┘  │
                           └─────────────────────────────────┘
```

### 组件职责划分

| 组件 | 职责 |
|-----|------|
| **Syslog Collector** | 接收原始 syslog、解析协议、基础转换、批量发送 |
| **CloudSentry Backend** | 字段映射、通道管理、事件存储、告警转发、API 服务 |

### 语言选择建议

#### Go (推荐)

**优点：**
- 编译型语言，高性能
- 标准库网络支持优秀
- 部署简单（单二进制文件）
- 学习曲线相对平缓
- 丰富的 syslog 解析库

**推荐库：**
- `github.com/influxdata/go-syslog` - RFC 3164/5424 解析
- `github.com/valyala/fasthttp` - 高性能 HTTP 客户端

#### Rust

**优点：**
- 极致性能和内存安全
- 零开销抽象
- 优秀的并发模型

**缺点：**
- 学习曲线陡峭
- 编译时间较长
- 生态相对 Go 较小

**推荐库：**
- `syslog_loose` 或 `syslog_rfc5424` - syslog 解析
- `tokio` - 异步运行时
- `reqwest` - HTTP 客户端

## 📁 建议的项目结构

```
CloudSentry/
├── backend/                    # 现有后端（保持不变）
├── frontend/                   # 现有前端（保持不变）
├── syslog-collector/           # 新增：独立 syslog 收集器
│   ├── cmd/
│   │   └── collector/
│   │       └── main.go
│   ├── internal/
│   │   ├── parser/
│   │   │   ├── rfc3164.go
│   │   │   ├── rfc5424.go
│   │   │   └── parser.go
│   │   ├── server/
│   │   │   ├── udp.go
│   │   │   └── tcp.go
│   │   ├── buffer/
│   │   │   └── queue.go
│   │   └── forwarder/
│   │       └── http.go
│   ├── config/
│   │   └── config.go
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml          # 更新：添加 collector 服务
└── docs/
    └── SYSLOG_COLLECTOR_ARCHITECTURE.md
```

## ⚙️ 配置示例

### Go Collector 配置 (config.yaml)

```yaml
# Syslog Collector Configuration
server:
  udp:
    enabled: true
    port: 514
    buffer_size: 65535
  tcp:
    enabled: true
    port: 514
    max_connections: 1000

parser:
  default_facility: 1      # user
  default_severity: 6      # info
  timezone: "Local"

buffer:
  type: "memory"           # memory | disk
  max_size: 10000          # max events in buffer
  flush_interval: "1s"     # flush interval
  flush_size: 100          # batch size per flush

forwarder:
  backend_url: "http://backend:3000/api/syslog/bulk"
  timeout: "10s"
  retry_count: 3
  retry_delay: "1s"

metrics:
  enabled: true
  port: 9090
  path: "/metrics"

logging:
  level: "info"
  format: "json"
```

### 更新后的 docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: cloudsentry-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: cloudsentry
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  syslog-collector:
    build:
      context: ./syslog-collector
      dockerfile: Dockerfile
    container_name: cloudsentry-collector
    environment:
      BACKEND_URL: http://backend:3000/api/syslog/bulk
      UDP_PORT: 514
      TCP_PORT: 514
      BUFFER_SIZE: 10000
      FLUSH_INTERVAL: 1s
    ports:
      - "514:514/tcp"
      - "514:514/udp"
      - "9090:9090"  # metrics
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cloudsentry-backend
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/cloudsentry?schema=public
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      JWT_EXPIRES_IN: 7d
      PORT: 3000
      NODE_ENV: production
      CORS_ORIGIN: http://localhost:5173
      # 禁用内置 syslog 服务器（由独立收集器处理）
      SYSLOG_SERVER_ENABLED: "false"
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: cloudsentry-frontend
    environment:
      VITE_API_URL: http://localhost:3000/api
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  postgres-data:
```

## 🔄 后端适配建议

如果实施分离架构，后端需要以下调整：

### 1. 添加环境变量控制

在 `backend/src/index.ts` 中：

```typescript
// 根据环境变量决定是否启动内置 syslog 服务器
const syslogEnabled = process.env.SYSLOG_SERVER_ENABLED !== 'false';

if (syslogEnabled) {
  syslogServerService.start().catch((error) => {
    logger.error('Failed to start syslog server:', error);
  });
} else {
  logger.info('Built-in syslog server is disabled (external collector mode)');
}
```

### 2. 优化批量接收 API

当前 `/api/syslog/bulk` 端点已存在，但可优化：

```typescript
// 增加批量处理的优化
export const bulkReceiveSyslog = async (req: Request, res: Response): Promise<void> => {
  // 使用事务批量插入
  // 添加健康检查响应头
  // 支持 gzip 压缩
};
```

### 3. 添加收集器状态 API

```typescript
// GET /api/collector/status
// 用于监控外部收集器的连接状态
```

## 📊 性能对比预估

| 指标 | 当前 (Node.js) | 分离后 (Go Collector) |
|-----|----------------|----------------------|
| 最大吞吐量 | ~10,000 事件/分钟 | ~100,000+ 事件/分钟 |
| 内存占用 | 较高 (V8 堆) | 较低 (固定分配) |
| CPU 效率 | 一般 | 优秀 |
| 启动时间 | ~2 秒 | ~100ms |
| 二进制大小 | N/A (需要运行时) | ~10-20MB |

## 🚀 实施路线图

### 阶段 1：准备（1-2 周）

- [ ] 评估实际性能需求
- [ ] 确定技术选型（Go vs Rust）
- [ ] 设计详细 API 规范

### 阶段 2：开发（2-4 周）

- [ ] 实现核心收集器功能
- [ ] RFC 3164/5424 解析
- [ ] 缓冲队列和批量发送
- [ ] 健康检查和监控指标

### 阶段 3：集成（1 周）

- [ ] 后端添加环境变量控制
- [ ] 更新 Docker Compose
- [ ] 编写集成测试

### 阶段 4：测试（1-2 周）

- [ ] 性能压力测试
- [ ] 故障恢复测试
- [ ] 生产环境验证

### 阶段 5：文档和发布

- [ ] 更新 README
- [ ] 编写部署指南
- [ ] 发布新版本

## 📝 结论

**对于当前阶段，建议保持现有架构**，原因：

1. 当前性能（10,000 事件/分钟）对大多数使用场景已足够
2. TypeScript 统一技术栈降低维护成本
3. 部署简单，适合快速迭代

**建议在以下情况时考虑分离：**

1. 实际使用中 syslog 处理成为明显瓶颈
2. 需要多边缘节点部署架构
3. 团队具备 Go/Rust 开发能力
4. 需要更高的可用性保证

---

## 📚 参考资源

- [RFC 3164 - The BSD syslog Protocol](https://datatracker.ietf.org/doc/html/rfc3164)
- [RFC 5424 - The Syslog Protocol](https://datatracker.ietf.org/doc/html/rfc5424)
- [go-syslog](https://github.com/influxdata/go-syslog)
- [Vector.dev](https://vector.dev/) - 高性能日志收集器参考

---

*文档版本: 1.0*
*创建日期: 2024*
*作者: CloudSentry Team*
