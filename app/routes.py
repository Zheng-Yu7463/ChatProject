# app/routes.py
from flask import Blueprint, render_template, request, jsonify
from app.services.llm_service import get_llm_response, list_conversations, new_conversation, conversations

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message")
    enable_thinking = data.get("enable_thinking", False)
    conv_id = data.get("conversation_id")

    # 传入 conv_id 参数
    reply = get_llm_response(user_message, conv_id, enable_thinking=enable_thinking)
    return jsonify({'response': reply})


@main.route('/conversations/<conv_id>/history', methods=['GET'])
def get_conversation_history(conv_id):
    history = conversations.get(conv_id, [])
    return jsonify({'history': history})


@main.route('/conversations', methods=['GET'])
def get_conversations():
    return jsonify({'conversations': list_conversations()})


@main.route('/conversations/new', methods=['POST'])
def create_conversation():
    new_id = new_conversation()
    return jsonify({'conversation_id': new_id})
