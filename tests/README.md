# 自动检查

本地工具运行不需要这些依赖。开发测试时进入 tests 目录执行：

```sh
npm install
npx playwright install chromium
npm test
```

也可以通过 CHROMIUM_PATH 指定已安装的 Chromium / Chrome。测试启动临时本地 HTTP 服务并使用独立的浏览器上下文，不读取你的演出库。设备路由测试使用模拟输出 API，不能替代真实声卡测试。原生 Windows 启动器的 Wine 冒烟检查另见 native-smoke.py，需要 Zig 与 Wine；此检查会执行 EXE 并用测试浏览器验证启动路径，不替代真实 Windows / 声卡测试。


原生启动器冒烟测试（独立临时 Wine 环境）：

```sh
python ../desktop/build-native.py
python native-smoke.py
```

通过 WINE 和 ZIG 环境变量指定工具路径；测试会编译并启动假的浏览器程序来检查命令行与路径，不启动真实 Edge，也不读取现有 Wine 用户库。


## 独立客户端测试

先在 client/ 执行 npm ci，再在 tests/ 执行 npm run test:client。该 CI 检查仅在 Linux/X11 中运行，以便隔离 XDG 数据目录（例如使用 Xvfb）；测试使用临时数据目录、模拟音频输入与测试专用 --no-sandbox 参数，生产客户端仍启用渲染沙箱。检查真实 Electron 启动、音频播放、菜单、设置在重启后持久化、离线策略及音频授权流程。

client-menu.cjs 验证文件菜单以有效用户手势触发文件输入、实际音频文件导入，以及通过桌面下载处理器保存有效备份；原生系统选择窗口由自动测试拦截，仍需实机确认。

## 3.0 检查

`node library.cjs`、`node controller.cjs`、`node streamdeck.cjs` 检查真实文件服务与插件协议；`node loudness.cjs` 对照系统 FFmpeg。

在 Linux/X11（可用 Xvfb）中运行 `node advanced-client.cjs`、`node automation-client.cjs`、`node backup-client.cjs`；通过 STAGECUE_ELECTRON 指定 Electron 可执行文件。高级和备份测试支持 STAGECUE_APP 指向构建后的 app.asar，验证真实打包依赖。所有测试使用临时用户配置。

自动化覆盖实际音频 DSP、素材库流式音频、Monitor 隔离、任务取消、备份字节一致性、旧版恢复及输入校验，不代表真实 Windows / 声卡 / 控制器硬件验收。

## macOS 安装包检查

GitHub Actions 在 `macos-15`（Apple 芯片）和 `macos-15-intel`（Intel）分别构建 DMG / ZIP，并校验代码签名、磁盘映像、架构和版本。`mac-client.cjs` 直接启动打包后的 StageCue.app，检查播放 / DSP、Mac 菜单、素材库、控制服务、导出和重启持久化。测试数据在独立临时目录，不读取正常演出库。需通过 STAGECUE_MAC_APP 指定 .app 路径。

## 整曲波形

`node waveform.cjs` 检查全采样峰值、立体声 RMS、单采样脉冲及分块边界。`node waveform-client.cjs` 使用已知强弱分段的双声道音频检查真实显示数据、全曲/裁切/变速位置、暂停、跳转、完成位置、大号时间、切歌取消和失败时播放隔离；支持 STAGECUE_MAC_APP 检查打包后的 Mac 应用。

## 年会演出模式

`node show-client.cjs` 检查默认简洁界面、演出锁定、音效待命/GO、重复 GO 保护、820 px 窄窗口中的主持压低、准备/演出切换时清除隐藏过滤、非音频环节计时且保持背景音乐、超时、独立暂停计时、全停、保存和安全重启。可通过 STAGECUE_MAC_APP 直接测试打包后的 Mac 应用。其他编辑/素材/波形检查显式进入准备模式，验证原功能保留。
