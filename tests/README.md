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
