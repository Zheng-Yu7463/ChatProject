import os
from mlx_lm import load, generate
from config import MODEL_PATH
from config import DEEPSEEK_API_KEY
from openai import OpenAI

os.environ['MLXLM_USE_MODELSCOPE'] = 'True'
model, tokenizer = load(MODEL_PATH)
client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

conversations = {}


def get_llm_response(user_input, conv_id, enable_thinking=False, mode="local"):
    history = conversations.get(conv_id, [])

    if mode == "api":
        # 调用 DeepSeek API
        messages = [{"role": "system", "content": "You are a helpful assistant"}] + history + [
            {"role": "user", "content": user_input}]
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
            stream=False
        )
        answer = response.choices[0].message.content
    else:
        # 使用本地模型
        if tokenizer.chat_template is not None:
            prompt = tokenizer.apply_chat_template(
                history + [{"role": "user", "content": user_input}],
                add_generation_prompt=True,
                enable_thinking=enable_thinking,
            )
        else:
            prompt = user_input

        answer = generate(
            model,
            tokenizer,
            prompt=prompt,
            verbose=False,
            max_tokens=1024,
        )

    # 更新对话历史
    conversations.setdefault(conv_id, []).append({"role": "user", "content": user_input})
    conversations[conv_id].append({"role": "assistant", "content": answer})

    return answer



# 获取对话列表
def list_conversations():
    return list(conversations.keys())


# 创建新对话 返回ID
def new_conversation():
    new_id = f"conv_{len(conversations) + 1}"
    conversations[new_id] = []
    return new_id
