# 🔍 大模型对话应用（LLM Chat App）

这是一个基于本地大语言模型和 API 的对话应用，支持切换模型/切换对话/深度思考等简单功能。

---

## 🔧 使用前准备

### 1. 配置 `config.py`

在项目根目录中编辑 `config.py`，配置以下两个常量：

```python
import os

# 本地模型路径
MODEL_PATH = "/path/to/your/local/model"

# API Key 从环境变量读取
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
```

> `MODEL_PATH` 直接在 `config.py` 中配置即可，`DEEPSEEK_API_KEY` 需要从 `.env` 文件中加载。

---

### 2. 配置 `.env` 文件

在项目根目录新建 `.env` 文件：

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📦 安装依赖

```bash
pip install -r requirements.txt
```

> 包括：`Flask`、`python-dotenv`、`mlx_lm`、`openai` 等必要依赖

---

## ▶️ 启动应用

```bash
python run.py
```

浏览器打开 [http://127.0.0.1:5001](http://127.0.0.1:5001) 即可使用。

---

## 📁 项目结构

```
.
├── app/
│   ├── routes.py               # Flask 路由
│   ├── services/
│   │   └── llm_service.py      # 本地 / API 模型逻辑
│   ├── static/
│   │   ├── css/style.css       # 页面样式
│   │   └── js/main.js          # 前端交互逻辑
│   └── templates/index.html    # 主页面
├── config.py                   # 模型路径 + API 密钥配置
├── .env                        # DeepSeek API Key
├── run.py                      # 启动入口
└── requirements.txt            # Python 依赖
```

---

