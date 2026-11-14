# StageCue 3.0 验证记录

2026-11-14；Linux/X11 上运行 Electron 45.3.2。测试使用独立临时数据和模拟输出设备，不读取用户演出库。

| 检查 | 结果 |
| --- | --- |
| library.cjs | 真实索引、文件/根目录重命名、Unicode 标签写回、身份保留、离线恢复、权限边界和 Range 通过 |
| controller.cjs / streamdeck.cjs | 本机配对、鉴权、来源限制、命令校验、真实插件进程注册、按键/旋钮/多设备反馈通过 |
| loudness.cjs | 三组信号与 FFmpeg ebur128 的 LUFS 差异小于 0.1，静音/短音频和峰值增益上限通过 |
| advanced-client.cjs | 真实 Electron 播放、原生音频流、变调/变速/混响信号检查、编辑器、页面目录、同步、Monitor、时钟比分主题通过 |
| automation-client.cjs | Monitor 中定时仍送现场、播报压低旁路及恢复、每轨循环隔离、全停解除未来任务、异步启动取消通过 |
| backup-client.cjs | 音频字节、效果、目录去重、笔记/草稿/任务恢复、重启解除武装、v1/v2 迁移和坏备份拒绝通过 |
| electron.cjs / client-menu.cjs | 沙箱、离线策略、模拟权限、实际菜单/导入/导出、关闭重开持久化通过 |
| 官方 Stream Deck CLI | 插件校验及打包通过 |
| Windows 安装器 | NSIS 与内层载荷 CRC、完整运行环境、中文资源、许可和卸载器通过；内嵌 JS/DSP/Worker 与源码一致 |

安装包：`StageCue-Setup-3.0.0-x64.exe`，104210567 字节。

SHA256：`ee8c4031f93ef5f5e57c09d466ac9e7cf70ca1dec71b7eed8353cbdcddcdeefb`。

未验收：真实 Windows 安装、物理声卡路由/延迟、实体 Stream Deck。未实现：原厂旧 `.SET` 导入；社交仅发布草稿。详见 [功能对照](ssp8-coverage.md)。
