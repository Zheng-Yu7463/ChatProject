import os
from mlx_lm import load, generate
from config import MODEL_PATH

os.environ['MLXLM_USE_MODELSCOPE'] = 'True'
model, tokenizer = load(MODEL_PATH)

conversations = {}


def get_llm_response(user_input, conv_id, enable_thinking=False):
    if tokenizer.chat_template is not None:
        # 先拿当前会话历史，没有则空列表
        history = conversations.get(conv_id, [])

        prompt = tokenizer.apply_chat_template(
            history + [{"role": "user", "content": user_input}],
            add_generation_prompt=True,
            enable_thinking=enable_thinking, # 切换思维模式 True为开启 False为关闭
        )
    else:
        prompt = user_input

    response = generate(
        model,
        tokenizer,
        prompt=prompt,
        verbose=False,
        max_tokens=1024,
    )

    # 更新对话历史
    conversations.setdefault(conv_id, []).append({"role": "user", "content": user_input})
    conversations[conv_id].append({"role": "assistant", "content": response})

    return response


# 获取对话列表
def list_conversations():
    return list(conversations.keys())


# 创建新对话 返回ID
def new_conversation():
    new_id = f"conv_{len(conversations) + 1}"
    conversations[new_id] = []
    return new_id
