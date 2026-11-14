# macOS 3.0.1 验证记录

2026-11-14；构建提交 `93dd9864333e644a88df72b1b76fef6d166944be`。

[完整构建与检查记录](https://github.com/Alan-duan1995/stagecue/actions/runs/43600961655) 已成功。Apple 芯片在 `macos-15` ARM64 构建机执行；Intel 在 `macos-15-intel` x64 构建机执行。

两种架构均通过：

- 标准 electron-builder 生成 `.app`、DMG、ZIP，本地 ad-hoc 签名后 `codesign --verify --deep --strict` 通过。
- `hdiutil verify` 磁盘映像校验和、ZIP 压缩数据校验通过。
- 可执行文件分别为 Mach-O arm64 和 x86_64；版本均为 3.0.1，运行环境最低系统要求均为 macOS 13.0。
- 直接启动打包后的应用，检查沙箱/上下文隔离、Mac 菜单、实际播放/AudioWorklet、DSP、真实文件素材库与 Range 流、控制服务、备份导出及关闭重开后的音量/素材库保留。
- Linux 上额外检查共享代码的隔离配置、离线策略、菜单、音频授权和持久化；新版备份和插件协议检查通过。

从公开发布链接重新匿名下载两种 DMG，SHA256 与构建产物一致：

| 文件 | 字节数 | SHA256 |
| --- | --- | --- |
| StageCue-3.0.1-mac-arm64.dmg | 109857787 | `efd86cbd09dbe4229b20c46f6beb3014cc227569d8b3cb90c2c794719d161229` |
| StageCue-3.0.1-mac-x64.dmg | 114697399 | `30f1870a1c1c15fbcfb412c1c1151dcd259f8da84a989951cf0200f0a9be55d0` |

当前没有 Apple Developer ID 证书和公证；首次打开可能需要用户在系统设置中明确允许。自动化检查未验证真实外接声卡分流、物理播放质量/延迟、实体 Stream Deck 或所有 macOS 13+ 小版本，不能代替正式演出前的设备试听。

安装见 [Mac 指南](macos.md)，下载见 [发布页](https://github.com/Alan-duan1995/stagecue/releases/tag/v3.0.1-macos)。
