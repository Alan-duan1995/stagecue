# StageCue · 本地演出音控客户端

署名：**中东中亚IT SSC   Alan**

## 下载并安装（Windows 10 / 11，64 位）

**[下载 StageCue 3.0.0 客户端安装程序](https://github.com/Alan-duan1995/stagecue/raw/refs/heads/main/downloads/StageCue-Setup-3.0.0-x64.exe)**

下载后双击安装，按向导完成后从桌面或开始菜单打开。客户端内置完整桌面运行环境，**不需要 Edge、Chrome、Node.js 或服务器**，断网也能播放。

支持选择安装目录、创建桌面 / 开始菜单快捷方式、从系统应用列表卸载。默认按当前用户安装，无需管理员权限。

也可使用 [HTML 离线版](https://github.com/Alan-duan1995/stagecue/raw/refs/heads/main/downloads/StageCue-Offline.zip)，它需要浏览器打开。此前 2.0.1 的小体积 EXE 是浏览器启动器；**3.0.0 安装包是内置运行环境的独立客户端**。

## macOS 版本（3.1.1，macOS 13 或更新版本）

- [Apple 芯片 M 系列安装包](https://github.com/Alan-duan1995/stagecue/releases/download/v3.1.1-macos/StageCue-3.1.1-mac-arm64.dmg)
- [Intel Mac 安装包](https://github.com/Alan-duan1995/stagecue/releases/download/v3.1.1-macos/StageCue-3.1.1-mac-x64.dmg)

新增 [简洁演出模式、待命 / GO、年会流程和节目超时计时](docs/annual-show.md)，保留整曲波形与大号音乐时间。打开 DMG，把 StageCue 拖到“应用程序”即可。[首次打开与安装说明](docs/macos.md) · [ZIP / 校验文件](https://github.com/Alan-duan1995/stagecue/releases/tag/v3.1.1-macos)。当前为本地签名，未做 Apple 开发者公证，首次启动可能需要在系统设置中允许。

## 3.0 新增

- 每页 48 键、分组分页、拖动、已用状态、随机和列表循环、页面目录。
- 波形裁切、10 段 EQ、混响、独立变调变速、效果后 LUFS 目标增益。
- 本地文件夹自动同步、离线重连、音频标签写回及原文件备份。
- Monitor 私有队列和编辑草稿、定时播报、比赛计时比分及阵容笔记、主题管理。
- [下载 Stream Deck 插件](https://github.com/Alan-duan1995/stagecue/raw/refs/heads/main/downloads/com.itssc.stagecue.streamDeckPlugin) · [配对说明](docs/streamdeck.md)。

按 Sports Sounds Pro 8 的功能方向实现，**尚未完整等同**：旧 `.SET` 导入未实现，社交为发布草稿，真实 Windows 声卡和 Stream Deck 硬件仍待验收。详见 [功能对照与验证范围](docs/ssp8-coverage.md)。HTML 离线版保留旧版功能，新功能在独立客户端内。

## 基础功能

| 功能 | 用途 |
| --- | --- |
| 本地音频与音效垫 | 导入文件，快捷键触发，分类、颜色与名称编辑 |
| 单曲音量、增益与电平 | 每首音量记忆，RMS 条、采样峰值和 dBFS 数值 |
| 入点 / 出点 | 指定播放区间，支持区间内循环 |
| 双 Deck 转场 | 新曲淡入、旧曲淡出；同时保留直接切换和音效叠加 |
| 演出流程表 | 排序、备注、GO，按流程执行并可自动续播 |
| 锁定与倒计时 | 减少编辑误触，剩余时间与结束预警 |
| 主持压低 | 一键降低主混音，再平滑恢复 |
| 独立耳机预听 | 明确选择两台不同输出后启用，不进入主混音 |
| 素材检查 | 解码、缺失、裁切、静音与增益削波检查，导出报告 |
| 演出备份 | 包含音频、单曲设置、流程备注及全局设置，兼容旧备份 |

内置 12 个合成试听音频；正式演出请导入自己的音乐。

## 从旧版迁移

1. 在原 HTML 版或旧启动器中点击“导出演出备份”。
2. 安装并打开客户端。
3. 通过“文件 → 恢复演出备份”导入。

客户端的库与旧版浏览器库独立，升级前请先备份。Windows 客户端使用 `%APPDATA%\StageCue Client` 保存本地数据；启动日志为其中的 `client.log`。菜单可直接打开该目录。音乐不上传。

## 快捷键

| 按键 | 操作 |
| --- | --- |
| 1–9 / Q / W / E | 触发当前页前 12 个音频（可自定义单曲快捷键） |
| 空格 | 当前音轨播放 / 暂停 |
| Enter | GO，执行下一条流程 |
| Esc | 停止所有音轨与耳机预听 |
| ← / → | 上一条 / 下一条流程 |
| 右键音效垫 | 编辑单曲 |

## 电平和声卡

单曲表位于单曲音量 / 增益 / 淡变之后，主音量之前；同曲重复叠加显示实例最大值。主输出两列是 RMS / 峰值。实时电平是单声道采样分析，不是真峰值表；新版编辑器另外提供效果后离线 LUFS 分析。

耳机预听需要明确选择两台不同输出设备。设备枚举可能需要一次音频输入授权；客户端会显示权限确认，不保存录音。每次启动重新确认路由，实际声卡分流请先试听。此工具不提供 ASIO 或多通道硬件混音。

## 验证与构建

已实际运行 Electron 客户端并检查音频播放、菜单、隔离配置、模拟音频设备授权、离线策略及关闭重开后的设置保留。此前 Chromium 演出流程与音频功能回归检查继续保留。

安装包、内部载荷、完整运行环境、中文资源、许可文件、卸载程序和内嵌源码已核对。尚未在真实 Windows 上完成安装及声卡验收，安装包未代码签名。

客户端源码及构建方法见 [client/](client/README.md)，测试见 [tests/](tests/README.md)，安装包 SHA256 见 [下载校验](downloads/StageCue-Setup-3.0.0-x64.sha256)。

本项目与 Sports Sound Pro 无关联。
