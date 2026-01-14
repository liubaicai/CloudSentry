# CloudSentry Syslog Collector

高性能 Syslog 收集器，用于接收、解析和转发 syslog 消息到 CloudSentry 后端。

## 🚀 特性

- **高性能**：基于 Go 构建，支持高并发 syslog 接收
- **多协议支持**：同时支持 UDP 和 TCP syslog
- **RFC 兼容**：完整支持 RFC 3164 (BSD) 和 RFC 5424 格式
- **缓冲队列**：内存缓冲队列，批量发送优化性能
- **自动重试**：后端不可用时自动重试
- **指标监控**：Prometheus 格式的监控指标

## 📦 构建

```bash
# 构建
go build -o syslog-collector ./cmd/collector

# 或使用 Docker
docker build -t cloudsentry-collector .
```

## ⚙️ 配置

创建 `config.yaml` 文件：

```yaml
server:
  udp:
    enabled: true
    port: 514
  tcp:
    enabled: true
    port: 514

buffer:
  max_size: 10000
  flush_interval: "1s"
  flush_size: 100

forwarder:
  backend_url: "http://localhost:3000/api/syslog/bulk"
  timeout: "10s"
  retry_count: 3

logging:
  level: "info"
```

## 🏃 运行

```bash
# 使用配置文件
./syslog-collector -config config.yaml

# 使用环境变量
BACKEND_URL=http://backend:3000/api/syslog/bulk ./syslog-collector

# Docker 运行
docker run -d \
  -p 514:514/tcp \
  -p 514:514/udp \
  -e BACKEND_URL=http://backend:3000/api/syslog/bulk \
  cloudsentry-collector
```

## 📊 监控

指标端点：`http://localhost:9090/metrics`

提供的指标：
- `syslog_messages_received_total` - 接收的消息总数
- `syslog_messages_forwarded_total` - 转发的消息总数
- `syslog_buffer_size` - 当前缓冲区大小
- `syslog_parse_errors_total` - 解析错误总数
- `syslog_forward_errors_total` - 转发错误总数

## 🔧 与 CloudSentry 集成

1. 部署 syslog-collector
2. 配置后端 URL 指向 CloudSentry API
3. 在 CloudSentry 后端设置 `SYSLOG_SERVER_ENABLED=false`
4. 配置 syslog 源发送到 collector 的地址

## 📝 许可证

MIT License - 与 CloudSentry 主项目相同
