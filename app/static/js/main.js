let currentConvId = null;


/* 输出日志 调试 */
console.log("main.js 已加载");


document.getElementById("new-conv-btn").addEventListener("click", () => {
    console.log("新对话按钮被点击了");
});

document.getElementById("send-btn").addEventListener("click", () => {
    console.log("用户发送信息")
})


/* 防止中文输入法错误的发送消息 */
let isComposing = false;  // 是否处于输入法拼音状态

const inputElem = document.getElementById("user-input");

// 检测中文输入法拼音组合状态
inputElem.addEventListener("compositionstart", () => {
    isComposing = true;
});

inputElem.addEventListener("compositionend", () => {
    isComposing = false;
});

inputElem.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !isComposing) {
        event.preventDefault();  // 防止换行
        sendMessage();
    }
});

/* 按键绑定和一些其他功能 */
window.onload = () => {
    loadConversations();
    document.getElementById("send-btn").addEventListener("click", sendMessage);

    document.getElementById("new-conv-btn").addEventListener("click", createNewConversation); // 按钮点击事件绑定
    const selectElem = document.getElementById("choose_conv");
    if (selectElem) {
        selectElem.addEventListener("change", switchConversation);
    } else {
        console.warn("没有找到下拉框 #choose_conv");
    }
};


function loadConversations(callback, desiredId = null) {
    axios.get('/conversations').then(res => {
        const list = res.data.conversations;
        const select = document.getElementById("choose_conv");
        select.innerHTML = "";

        if (list.length === 0) {
            // ✅ 如果没有会话，自动创建一个
            createNewConversation();
            return;
        }

        list.forEach(id => {
            const opt = document.createElement("option");
            opt.value = id;
            opt.innerText = id;
            select.appendChild(opt);
        });

        // ✅ 如果传入想要选中的 ID 就选它，否则默认选第一个
        if (desiredId && list.includes(desiredId)) {
            currentConvId = desiredId;
        } else if (list.length > 0) {
            currentConvId = list[0];
        }

        select.value = currentConvId;

        if (callback) callback();
    });
}


function createNewConversation() {
    axios.post('/conversations/new').then(res => {
        const newId = res.data.conversation_id;

        loadConversations(() => {
            const select = document.getElementById("choose_conv");
            select.value = currentConvId;
            switchConversation();
        }, newId);
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

    console.log(message);

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
        chatBox.innerHTML += `<p class="thought">💭 思考：${escapeHtml(thinking)}</p>`;
        if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise();
}
    }

    const renderedAnswer = marked.parse(answer);  // ✅ Markdown 转 HTML
    chatBox.innerHTML += `<div class="ai-reply"><b>回答：</b>${renderedAnswer}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});

}



function switchConversation() {
    currentConvId = document.getElementById("choose_conv").value;
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";

    axios.get(`/conversations/${currentConvId}/history`)
        .then(res => {
            const history = res.data.history || [];  // 容错，避免undefined
            history.forEach(msg => {
                if (msg.role === "user") {
                    const renderedAnswer = marked.parse(answer);
                    chatBox.innerHTML += `<div class="ai-reply"><b>回答：</b>${renderedAnswer}</div>`;
                    if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise();
}

                } else if (msg.role === "assistant") {
                    let thinkMatch = msg.content.match(/<think>([\s\S]*?)<\/think>/i);
                    let thinking = thinkMatch ? thinkMatch[1].trim() : "";
                    let answer = msg.content.replace(/<think>[\s\S]*?<\/think>/i, "").trim();

                    if (thinking) {
                        chatBox.innerHTML += `<p class="thought">深度思考：${escapeHtml(thinking)}</p>`;
                    }
                    chatBox.innerHTML += `<p><b>回答：</b>${escapeHtml(answer)}</p>`;
                }
            });

            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(err => {
            console.error("获取会话历史失败：", err);
            chatBox.innerHTML = "<p style='color:red;'>加载历史失败，请重试。</p>";
        });
}

// 简单转义HTML防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}
