# app/services/llm_service.py
import os
from mlx_lm import load, generate

# 设置环境变量
os.environ['MLXLM_USE_MODELSCOPE'] = 'True'

MODEL_PATH = r"/Users/cyoid/.cache/modelscope/hub/models/Qwen/Qwen3-0.6B-MLX-8bit"
model, tokenizer = load(MODEL_PATH)

def get_llm_response(user_input):
    # 构造消息
    if tokenizer.chat_template is not None:
        messages = [{"role": "user", "content": user_input}]
        prompt = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True
        )
    else:
        prompt = user_input

    # 生成回复
    response = generate(
        model,
        tokenizer,
        prompt=prompt,
        verbose=False,
        max_tokens=1024
    )
    return response


if __name__ == "__main__":
    ans = get_llm_response("hello world")
    print(ans)


