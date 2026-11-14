# Windows 启动程序

`StageCue.exe` 是 Windows x64 本地启动程序，内嵌 StageCue 页面，调用已安装的 Microsoft Edge（优先）或 Chrome 打开独立应用窗口。它不包含完整浏览器，也不是原生 ASIO 音频工作站。

程序将页面保存在 `%LOCALAPPDATA%\StageCue\StageCue.html`，使用 `%LOCALAPPDATA%\StageCue\BrowserProfile` 作为专用浏览器数据目录。更新 EXE 不会主动清除该目录。与普通 HTML 版的数据目录不同，首次迁移请通过演出备份导入。

## 构建

安装 Node.js 22+ 后，在本目录执行：

```sh
npm ci
npm run build:win
```

生成 `../build/StageCue.exe`。构建工具会读取根目录最新的 `StageCue.html`、打包为 Windows x64 程序并设置 GUI 子系统。首次构建需要联网下载工具和 Node 基础二进制；成品启动与音频播放不需要联网。

## 验证范围

已核对 PE x64 / GUI 文件结构、内嵌页面及启动器逻辑。当前开发环境为 Linux，尚未在 Windows 上运行 EXE。HTML 的播放与备份逻辑已在 Chromium 中测试；声卡路由仍需在实际设备上确认。EXE 未进行代码签名。

署名：中东中亚IT SSC   Alan
