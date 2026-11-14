# StageCue 3.0 本地客户端

这是内置 Electron / Chromium 运行环境的独立桌面客户端。安装后从桌面或开始菜单启动，不需要安装 Edge、Chrome、Node.js 或 Python；音频播放无需联网。

## Windows 安装

1. 下载 `StageCue-Setup-3.0.0-x64.exe`。
2. 双击安装程序，按向导选择安装目录。
3. 从桌面或开始菜单打开 StageCue。
4. 如之前使用 HTML 或旧启动器，请先在旧版导出演出备份，再通过客户端菜单“文件 → 恢复演出备份”导入。

面向 Windows 10 / 11 x64，默认仅安装到当前用户，不需要管理员权限。可在系统“已安装的应用”中卸载。卸载配置保留用户数据；重要演出仍请先导出备份。

新版功能和限制见 [SSP 8 对照](../docs/ssp8-coverage.md)，Stream Deck 安装见 [配对指南](../docs/streamdeck.md)。

## 本地保存

- 客户端独立数据目录：`%APPDATA%\StageCue Client`
- 音频与设置保存在此目录下的持久化 Chromium 会话中。
- 素材库索引与配对配置也保存在本地数据目录；授权目录的原始音乐仍保留在原位置。
- 启动日志：`%APPDATA%\StageCue Client\client.log`
- 菜单“文件 → 打开本地数据文件夹”可以查看该目录。

客户端与普通浏览器、旧版启动器使用不同的库；请通过演出备份迁移。Windows 用户、安装位置或设备变化时也建议导出备份。

## 桌面功能

- 独立应用窗口、任务栏图标、桌面与开始菜单快捷方式。
- 文件、演出、窗口、帮助菜单；单实例启动。
- 演出播放或锁定期间退出会再次询问。
- 页面与音频无需从服务器加载；主界面不允许访问 HTTP / HTTPS 资源。
- 音频设备权限由客户端确认，不默认授予麦克风、相机或其他权限。
- 界面采用软件绘制，不依赖 WebGL / WebGPU，减少部分显卡的兼容问题。

保留完整演出功能：独立音量 / 增益 / 电平、入点 / 出点、交叉淡变、流程 GO、锁定、倒计时、主持压低、素材预检、音频路由、备份与恢复。

## 验证范围

已实际运行 Electron 客户端，检查音乐播放、沙箱与上下文隔离、菜单操作、音频设备授权（模拟设备）、离线资源策略、设置在重载与关闭重开后保留。安装包和内部压缩载荷已完成 CRC 检查，并核对了完整运行环境、中文资源、许可文件、卸载程序及内嵌源码。

Windows 安装器未在真实 Windows 机器上运行，实际安装、窗口显示和声卡仍需实机确认。当前安装包未进行代码签名。

## 开发与构建

```sh
cd client
npm ci
npm start
npm run dist:win
```

构建输出位于 `build/client/`，安装文件为 `StageCue-Setup-3.0.0-x64.exe`。源码界面来自根目录 `StageCue.html`，`prepare.cjs` 生成带客户端标题和资源策略的页面。

Windows 构建使用 electron-builder 原生 NSIS 流程。Linux 构建时，`build-win.cjs` 对中间 NSIS 卸载器使用 electron-builder 自带的 `UninstallerReader`，避免依赖无法运行 32 位程序的 Wine 环境；最终安装器仍由标准 NSIS 流程生成。

图形裁剪只移除未使用的 WebGPU / Vulkan 编译组件，保留运行所需的 Chromium、音频解码、D3D11 与软件绘制支持。构建版本及依赖由 package-lock.json 固定。

署名：中东中亚IT SSC   Alan
