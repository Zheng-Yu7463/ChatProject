let currentConvId = null;

window.onload = () => {
    loadConversations();
};

function loadConversations() {
    axios.get('/conversations').then(res => {
        const list = res.data.conversations;
        const select = document.getElementById("conversation-list");
        select.innerHTML = "";

        list.forEach(id => {
            const opt = document.createElement("option");
            opt.value = id;
            opt.innerText = id;
            select.appendChild(opt);
        });

        if (list.length > 0) {
            currentConvId = list[0];
            select.value = currentConvId;
            document.getElementById("chat-box").innerHTML = "";
        }
    });
}

function switchConversation() {
    currentConvId = document.getElementById("conversation-list").value;
    document.getElementById("chat-box").innerHTML = "";
}

function createNewConversation() {
    axios.post('/conversations/new').then(res => {
        currentConvId = res.data.conversation_id;
        loadConversations();
        document.getElementById("chat-box").innerHTML = "";
    });
}

function sendMessage() {
    const inputElem = document.getElementById("user-input");
    const message = inputElem.value.trim();
    if (!message || !currentConvId) return;

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><b>你：</b>${message}</p>`;
    inputElem.value = "";

    axios.post("/chat", {
        message: message,
        conversation_id: currentConvId
    }).then(res => {
        chatBox.innerHTML += `<p><b>机器人：</b>${res.data.response}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

axios.post("/chat", { message: message, conversation_id: currentConvId })
  .then(res => {
    let resp = res.data.response;

    // 提取 <think>标签内的思考内容
    let thinkMatch = resp.match(/<think>([\s\S]*?)<\/think>/i);
    let thinking = thinkMatch ? thinkMatch[1].trim() : "";

    // 去掉 <think>标签及内容，剩余即回答内容
    let answer = resp.replace(/<think>[\s\S]*?<\/think>/i, "").trim();

    const chatBox = document.getElementById("chat-box");
    if (thinking) {
      chatBox.innerHTML += `<p style="color:gray; font-style:italic;">💭 思考：${thinking}</p>`;
    }
    chatBox.innerHTML += `<p><b>回答：</b>${answer}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  });

function switchConversation() {
    currentConvId = document.getElementById("conversation-list").value;
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";

    axios.get(`/conversations/${currentConvId}/history`).then(res => {
        const history = res.data.history; // 数组，按顺序的消息对象

        history.forEach(msg => {
            if(msg.role === "user") {
                chatBox.innerHTML += `<p><b>你：</b>${msg.content}</p>`;
            } else if(msg.role === "assistant") {
                // 解析 <think> 标签
                let thinkMatch = msg.content.match(/<think>([\s\S]*?)<\/think>/i);
                let thinking = thinkMatch ? thinkMatch[1].trim() : "";
                let answer = msg.content.replace(/<think>[\s\S]*?<\/think>/i, "").trim();

                if(thinking) {
                    chatBox.innerHTML += `<p class="thought">💭 思考：${thinking}</p>`;
                }
                chatBox.innerHTML += `<p><b>回答：</b>${answer}</p>`;
            }
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

