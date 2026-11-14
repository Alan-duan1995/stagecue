# 自动检查

本地工具运行不需要这些依赖。开发测试时进入 tests 目录执行：

```sh
npm install
npx playwright install chromium
npm test
```

也可以通过 CHROMIUM_PATH 指定已安装的 Chromium / Chrome。测试启动临时本地 HTTP 服务并使用独立的浏览器上下文，不读取你的演出库。设备路由测试使用模拟输出 API，不能替代真实声卡测试。Windows 启动器仅验证逻辑，不执行 EXE。
