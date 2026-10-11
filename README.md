# 抖音批量清理喜欢

## 安装

1. 打开 `chrome://extensions`
2. 打开右上角 **开发者模式**
3. 点 **加载已解压的扩展程序**，选择本 `chrome-ext/` 文件夹
4. 打开并登录 <https://www.douyin.com/>
5. 右下角出现悬浮面板（默认收起为圆球，圆球显示已处理条数）

## 目录结构

```text
chrome-ext/
├── manifest.json          # MV3 清单，声明内容脚本与加载顺序
├── content.js             # 入口：挂载面板 + 掉线自愈
└── src/
    ├── core.js            # DOM 基础层：文本定位、可见性、拟真点击、等待
    ├── cleaner.js         # 清理流程：进批量管理 → 全选 → 取消 → 确认弹窗
    └── panel/
        ├── styles.js      # 面板样式（Shadow DOM + 暗/亮双色）
        └── view.js        # 面板 UI 与交互逻辑
```

## 权限

扩展**不申请任何权限**（`manifest.json` 中无 `permissions` 字段），只通过内容脚本注入 `www.douyin.com`。不联网、不上传数据，所有逻辑都在你本地浏览器里跑。

## 免责声明

本工具仅用于用户对自己账号内容的管理,使用后果由使用者自行承担。
