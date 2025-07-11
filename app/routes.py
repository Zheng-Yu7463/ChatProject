# app/routes.py
from flask import Blueprint, render_template, request, jsonify
from app.services.llm_service import get_llm_response, list_conversations, new_conversation, conversations

main = Blueprint('main', __name__)


# 主页面 返回index.html
@main.route('/')
def index():
    return render_template('index.html')


# 发送消息进行对话
@main.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message")
    enable_thinking = data.get("enable_thinking", False)
    conv_id = data.get("conversation_id")
    mode = data.get("mode", "local")  # 默认为 local

    reply = get_llm_response(user_message, conv_id, enable_thinking=enable_thinking, mode=mode)
    return jsonify({'response': reply})


# 返回对应对话的历史记录
@main.route('/conversations/<conv_id>/history', methods=['GET'])
def get_conversation_history(conv_id):
    history = conversations.get(conv_id, [])
    return jsonify({'history': history})


# 返回对话列表
@main.route('/conversations', methods=['GET'])
def get_conversations():
    return jsonify({'conversations': list_conversations()})


# 创建一个新的对话并返回对话ID
@main.route('/conversations/new', methods=['POST'])
def create_conversation():
    new_id = new_conversation()
    return jsonify({'conversation_id': new_id})
