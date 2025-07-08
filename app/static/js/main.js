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

    // 读取复选框状态
    const enableThinking = document.getElementById("thinking-checkbox").checked;

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><b>你：</b>${message}</p>`;
    inputElem.value = "";

    axios.post("/chat", {
        message: message,
        conversation_id: currentConvId,
        enable_thinking: enableThinking   // 这里传入前端开关状态
    })
    .then(res => {
        let resp = res.data.response;

        let thinkMatch = resp.match(/<think>([\s\S]*?)<\/think>/i);
        let thinking = thinkMatch ? thinkMatch[1].trim() : "";

        let answer = resp.replace(/<think>[\s\S]*?<\/think>/i, "").trim();

        if (thinking) {
            chatBox.innerHTML += `<p style="color:gray; font-style:italic;">💭 思考：${thinking}</p>`;
        }
        chatBox.innerHTML += `<p><b>回答：</b>${answer}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}



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

document.getElementById("user-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();  // 防止默认行为（如换行）
        sendMessage();
    }
});
