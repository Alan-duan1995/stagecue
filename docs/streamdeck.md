# Stream Deck 配对

1. 安装 StageCue 3.0 或更新版本（Windows / macOS），以及 Elgato Stream Deck 7.1 或更新版本。
2. 下载并双击 [StageCue Live 插件](https://github.com/Alan-duan1995/stagecue/raw/refs/heads/main/downloads/com.itssc.stagecue.streamDeckPlugin)，在 Stream Deck 中安装。
3. 打开 StageCue 左侧的 **Stream Deck**，启用本地控制并复制配对码；记下界面显示的端口。
4. 在 Stream Deck 的 StageCue Live 分类拖入音效、命令或旋钮动作。在属性面板填写端口、配对码并保存。
5. 音效可绑定当前页面第 1–48 个位置，或固定音效编号；命令可控制播放、GO、换页、压低、随机、循环等；旋钮可控制音量、变调、速度和混响。

客户端只监听本机 127.0.0.1，默认端口 9142；占用时界面会显示替代端口。配对码保存在当前用户本机，可在客户端重置。请勿把配对码放进公开演出备份。重置后需重新填写插件设置。

按键反馈显示名称、颜色、已用和播放状态。Monitor 模式下的音效及旋钮操作指向私有准备区；**全停始终停止现场与预听并解除定时任务武装**。

本插件通过官方 CLI 校验和 SDK 协议测试，尚未用真实 Stream Deck 硬件验收。
