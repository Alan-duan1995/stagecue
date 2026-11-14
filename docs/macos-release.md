StageCue 3.0.1 macOS 本地演出音乐客户端（macOS 13 或更新版本）

署名：中东中亚IT SSC   Alan

- Apple 芯片 M 系列选择 `mac-arm64.dmg`；Intel Mac 选择 `mac-x64.dmg`。
- 打开 DMG，将 StageCue 拖到 Applications（应用程序），弹出磁盘映像后从应用程序启动。
- 内置运行环境，无需登录、浏览器或服务器，可离线使用。功能包含音频编辑、素材库同步、48 键分页、电平、Monitor、定时任务和比赛辅助。
- 本版本为本地 ad-hoc 签名，未做 Apple Developer ID 签名和公证。首次运行被拦截时，可在系统设置 → 隐私与安全性中允许 StageCue，再按提示打开。无需关闭系统整体安全保护。
- 数据目录：`~/Library/Application Support/StageCue Client`。升级或卸载前请导出演出备份。
- 真实 Mac 构建机验证安装载荷、签名完整性及打包后的应用；外接声卡路由和实体 Stream Deck 仍需在使用设备上试听验收。
- 原厂旧 `.SET` 导入尚未实现，社交仅支持草稿；其余限制见仓库功能对照。

SHA256 文件与各架构安装包一同提供。ZIP 为同一应用的压缩包，可作为 DMG 的替代下载。
