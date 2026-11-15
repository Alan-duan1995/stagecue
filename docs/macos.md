# 在 Mac 上安装 StageCue

StageCue 3.0.2 是独立的 macOS 桌面应用，要求 macOS 13 Ventura 或更新版本。内置 Electron 运行环境，安装后可离线使用，无需登录或安装浏览器。署名：中东中亚IT SSC   Alan。

## 选择下载

打开苹果菜单 → 关于本机：

- 显示 Apple M1 / M2 / M3 / M4 等 Apple 芯片：下载 [Apple 芯片 DMG](https://github.com/Alan-duan1995/stagecue/releases/download/v3.0.2-macos/StageCue-3.0.2-mac-arm64.dmg)。
- 显示 Intel 处理器：下载 [Intel DMG](https://github.com/Alan-duan1995/stagecue/releases/download/v3.0.2-macos/StageCue-3.0.2-mac-x64.dmg)。

[发布页](https://github.com/Alan-duan1995/stagecue/releases/tag/v3.0.2-macos) 另有 ZIP 和 SHA256 校验文件。

## 安装和首次打开

1. 打开下载的 DMG，把 StageCue 拖到 Applications（应用程序）。
2. 弹出 StageCue 磁盘映像，再从应用程序启动 StageCue。
3. 当前应用使用本地 ad-hoc 签名，未做 Apple Developer ID 签名和公证。若系统阻止首次运行，先尝试打开一次，再前往系统设置 → 隐私与安全性，允许打开 StageCue，并按系统提示确认。不要关闭系统整体安全保护。
4. 使用“导入音频”或“本地素材库”选择自己的音乐。素材库只读取你选择的目录。

## 声卡和耳机

在“演出 → 音频路由 / 耳机”选择主输出和独立预听输出。应用和 macOS 可能请求音频输入权限，用于枚举设备；程序不保存录音。Monitor 要求选择两台明确不同的输出。

外接声卡、聚合设备、耳机分流和现场延迟请在正式演出前实际试听。应用不提供 ASIO。Stream Deck 需另装插件，见 [配对说明](streamdeck.md)。

## 数据、升级和卸载

本地数据：`~/Library/Application Support/StageCue Client`；日志为其中的 `client.log`。可以通过“文件 → 打开本地数据文件夹”查看。原始音乐仍留在素材库原目录。

从 Windows 或旧版迁移：先在原程序导出演出备份，在 Mac 的“文件 → 恢复演出备份”导入。备份中的已打包音频可以跨系统恢复；未打包的离线素材需要重新连接。

升级时先导出备份，退出应用，再用新版本替换应用程序中的 StageCue。卸载时将 StageCue.app 移到废纸篓；用户数据保留，音频原文件不会删除。

## 构建和验证

在 macOS 上执行：

```sh
cd client
npm ci
npm run dist:mac
```

默认生成 Apple 芯片和 Intel 两套 DMG / ZIP；可用 `STAGECUE_MAC_ARCH=arm64` 或 `x64` 单独构建。GitHub Actions 在两类原生 Mac 构建机上校验签名、DMG、ZIP、架构并直接运行打包后的应用，检查播放、DSP、素材库、导出和重启持久化。

[本版本验证记录](validation-macos-3.0.2.md)。自动检查不能替代外接声卡、实体 Stream Deck 和你使用的 macOS 版本上的演出验收。与 Sports Sounds Pro 的功能差异见 [功能对照](ssp8-coverage.md)。
