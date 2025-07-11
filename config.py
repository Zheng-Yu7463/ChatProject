import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

MODEL_PATH = r"/Users/cyoid/.cache/modelscope/hub/models/Qwen/Qwen3-0.6B-MLX-8bit" # 模型路径
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") # deepseek服务的API_KEY
