# Windows 原生启动程序 · 2.0.1

此版本使用 C / Win32 编写启动器，替换之前的 Node 封装。EXE 约 90 KB，不需要 Node.js、Python 或单独安装运行库。目标为 Windows 10 / 11 x64，电脑需已安装 Microsoft Edge 或 Chrome。

## 使用

1. 解压完整 ZIP，再双击 `StageCue.exe`，程序会打开独立应用窗口。
2. 如无法启动，正常错误会显示具体阶段、Windows 错误代码与日志位置。
3. 如仍无反应，双击 `Diagnose-StageCue.cmd`，查看启动日志。
4. 也可直接用 Edge / Chrome 打开包中的 `StageCue.html`，或运行 `Start-StageCue.cmd`。

请优先使用修复版 EXE 保持原数据目录。HTML 备用入口使用普通浏览器的存储，与 EXE 的专用浏览器数据目录不同，切换时请通过演出备份迁移。

## 数据目录

- 内嵌页面：`%LOCALAPPDATA%\StageCue\StageCue.html`
- 专用浏览器资料：`%LOCALAPPDATA%\StageCue\BrowserProfile`
- 启动日志：`%LOCALAPPDATA%\StageCue\launcher.log`

启动器先从注册表寻找自定义安装位置，再检查常见安装目录。支持路径中的空格和中文。更新页面使用临时文件加原子替换，页面内容未变时不会重写；不会删除现有浏览器数据目录。

`StageCue.exe --diagnose` 仅提取 / 验证页面与检查浏览器路径，写入诊断日志，不启动浏览器。

## 从源码构建

安装 Python 3 与 Zig 0.15.2 后，在仓库根目录执行：

```sh
python desktop/build-native.py
```

可通过 `ZIG` 环境变量指定 zig 可执行文件路径。构建脚本将根目录 HTML 编译进 Windows x64 GUI 程序，生成 `build/StageCue.exe`；不需要 Node 运行时或下载包管理依赖。编译输出为原生 GUI 子系统，不再修改另一种运行时的 PE 头。

## 验证范围

已在 Wine Windows 兼容环境实际运行原生 EXE，检查缺少浏览器时的诊断、HTML 提取、自定义浏览器路径（含空格和中文）、进程启动参数和原数据保留。浏览器进程使用测试桩，并非真实 Windows Edge；实际 Windows 10 / 11 窗口及声卡仍需实机确认。开发测试见 `tests/native-smoke.py`。

EXE 是本地浏览器应用启动器，不包含完整浏览器内核，也不提供原生 ASIO 音频处理。

署名：中东中亚IT SSC   Alan
