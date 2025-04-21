const pluginName = '[Echo-Message]'

class ListenerHandler {
    constructor(msgContentContainer) {
        this.msgContentContainer = msgContentContainer
        this.leaveTimeout = undefined
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleMouseEnter() {
        clearTimeout(this.leaveTimeout);
        appendPlusOneTag(this.msgContentContainer); // 添加 +1 标签
    }

    handleMouseLeave() {
        this.leaveTimeout = setTimeout(() => {
            removePlusOneTag(this.msgContentContainer);
        }, 150) // 移除 +1 标签
    };

    addCommonPlusOne() {
        try {
            if (!this.msgContentContainer?.classList.contains('echo-message')) {
                this.msgContentContainer.classList.add('echo-message')
                this.msgContentContainer.addEventListener('mouseenter', this.handleMouseEnter)
                this.msgContentContainer.addEventListener('mouseleave', this.handleMouseLeave)
            }
        } catch (e) {
            console.error(e);
        }
    }
}

export async function messageRenderer(allChats) {
    for (let i = 0; i < allChats.length; i++) {
        const msgContentContainer = allChats[i]?.querySelector('.msg-content-container')
        const preMsgConContainer = i > 0 ? allChats[i - 1]?.querySelector('.msg-content-container') : null;
        if (preMsgConContainer?.querySelector('.em-svg-container')) removePlusOneTag(msgContentContainer)
        if (msgContentContainer?.classList.contains('em-msg-container')) continue

        const currentMsgContent = allChats[i]?.querySelector('.message-content');
        const prevMsgContent = i - 1 < 0 ? undefined : allChats[i - 1]?.querySelector('.message-content');
        const nextMsgContent = i + 1 === allChats.length ? undefined : allChats[i + 1]?.querySelector('.message-content');
        if (!(prevMsgContent || nextMsgContent)) {
            (new ListenerHandler(msgContentContainer)).addCommonPlusOne()
            continue
        }
        if (!msgChecker(prevMsgContent, currentMsgContent, nextMsgContent)) {
            (new ListenerHandler(msgContentContainer)).addCommonPlusOne()
            continue
        }
        appendPlusOneTag(msgContentContainer)
    }
}

function msgChecker(prevMsgContent, currentMsgContent, nextMsgContent) {
    const prevMsgs = msgExtractor(prevMsgContent)
    const currentMsgs = msgExtractor(currentMsgContent)
    const nextMsgs = msgExtractor(nextMsgContent)
    return JSON.stringify(nextMsgs) === JSON.stringify(currentMsgs) &&
        JSON.stringify(currentMsgs) !== JSON.stringify(prevMsgs)
}

function msgExtractor(msgContent) {
    if (!msgContent?.querySelectorAll) return []
    return [
        ...(Array.from(msgContent?.querySelectorAll('.text-normal')).map(textElement => textElement?.innerText)),
        ...(Array.from(msgContent?.querySelectorAll('.image-content')).map(imgElement => imgElement?.src)),
        ...(Array.from(msgContent?.querySelectorAll('.markdown-element')).map(markdownElement => markdownElement.children))
    ]
}

/**
 * 添加 +1 标签
 * @param {HTMLElement} el 消息内容容器
 */
function appendPlusOneTag(el) {
    if (!el || el.classList.contains("lite-tools-plus-one-msg")) {
        return;
    }
    const slot = el.querySelector(".lite-tools-slot") || el; // 如果没有插槽，直接使用 el
    console.log("添加 +1 标记", el);
    el.classList.add("lite-tools-plus-one-msg");

    const plusOneEl = document.createElement("div");
    plusOneEl.className = 'em-svg-container';
    plusOneEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#66ccff"><path d="M250-292.31v-120H130v-60h120v-120h60v120h120v60H310v120h-60Zm391.54 71.54v-428.77l-96.62 68.31-34.46-51.54 149.39-106.46h47.84v518.46h-66.15Z"/></svg>`;
    plusOneEl.style.display = 'flex';
    plusOneEl.style.justifyContent = 'center';
    plusOneEl.style.alignItems = 'center';
    plusOneEl.style.cursor = 'pointer';

    if (el.classList.contains('container--others')) {
        plusOneEl.classList.add('em-plus-one-img-right');
    } else {
        plusOneEl.classList.add('em-plus-one-img-left');
    }

    slot.appendChild(plusOneEl);
    el.classList.add('em-msg-container');

    plusOneEl.style.opacity = "0.2";
    setTimeout(() => {
        plusOneEl.style.opacity = "0.9";
        plusOneEl.style.transform = el.classList.contains('container--others') ? "translateX(50%)" : "translateX(-50%)";
        plusOneEl.style.border = "2px solid #66ccff";
    }, 100);

    plusOneEl.addEventListener('mouseenter', () => {
        plusOneEl.style.transform = el.classList.contains('container--others') ? "translateX(50%) scale(1.1)" : "translateX(-50%) scale(1.1)";
        plusOneEl.style.boxShadow = "0 0 10px rgba(17,183,234,0.5)";
    });
    plusOneEl.addEventListener('mouseleave', () => {
        plusOneEl.style.transform = el.classList.contains('container--others') ? "translateX(50%) scale(1)" : "translateX(-50%) scale(1)";
        plusOneEl.style.boxShadow = "none";
    });
    plusOneEl.addEventListener('mousedown', () => {
        plusOneEl.style.transform = el.classList.contains('container--others') ? "translateX(50%) scale(0.9)" : "translateX(-50%) scale(0.9)";
        plusOneEl.style.boxShadow = "0 0 5px rgba(17,183,234,0.5)";
    });
    plusOneEl.addEventListener('mouseup', () => {
        plusOneEl.style.transform = el.classList.contains('container--others') ? "translateX(50%) scale(1)" : "translateX(-50%) scale(1)";
        plusOneEl.style.boxShadow = "0 0 5px rgba(17,183,234,0.5)";
    });

    plusOneListener(plusOneEl);
}

/**
 * 移除 +1 标签
 * @param {HTMLElement} el 消息内容容器
 */
function removePlusOneTag(el) {
    if (!el || !el.classList.contains("lite-tools-plus-one-msg")) {
        return;
    }
    const plusOneEl = el.querySelector(".em-svg-container");
    if (plusOneEl) {
        console.log("移除 +1 标记", el);
        plusOneEl.style.opacity = "0";
        plusOneEl.style.transform = el.classList.contains('container--others') ? "translateX(-100%)" : "translateX(100%)";
        setTimeout(() => {
            el.removeChild(plusOneEl);
            el.classList.remove("lite-tools-plus-one-msg");
            el.classList.remove("em-msg-container");
        }, 500);
    }
}

/**
 * 添加 +1 标签点击事件监听器
 * @param {HTMLElement} plusOneEl SVG 容器
 */
function plusOneListener(plusOneEl) {
    plusOneEl.addEventListener('click', async () => {
        const msgID = plusOneEl.closest('.ml-item').id;
        const curAioData = app.__vue_app__.config.globalProperties.$store.state.common_Aio.curAioData;
        const peerUid = curAioData.header.uid;
        const peerUin = curAioData.header.uin;
        const chatType = curAioData.chatType;

        try {
            if (chatType == 1) {
                console.log(curAioData)
                await window.echo_message.call_forward_msg(msgID, null, peerUin)
            } else if (chatType == 2) {
                await window.echo_message.call_forward_msg(msgID, peerUid, null)
            } else {
                new Error('未知聊天类型')
            }
            console.log(`消息转发成功，消息ID: ${msgID}`);
            console.log(chatType)
        } catch (error) {
            console.error('消息转发失败:', error);
        }
    });
}

/**
 * 注入 CSS 样式
 */
export function patchCss() {
    console.log(pluginName + 'css加载中');

    let style = document.createElement('style');
    style.type = "text/css";
    style.id = "echo-message-css";

    let sHtml = `
.em-msg-container {
    position: relative;
    overflow: unset !important;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
}

.em-plus-one-img-right {
    position: absolute;
    left: calc(100% - 5px);
    width: 25px;
    height: 25px;
    border-radius: 50%;
    opacity: 0.2;
    color: var(--text-color);
    background-color: var(--background-color-05);
    backdrop-filter: blur(14px);
    box-shadow: var(--box-shadow);
    transition: 250ms;
}

.em-plus-one-img-left {
    position: absolute;
    right: calc(100% - 5px);
    width: 25px;
    height: 25px;
    border-radius: 50%;
    opacity: 0.2;
    color: var(--text-color);
    background-color: var(--background-color-05);
    backdrop-filter: blur(28px);
    box-shadow: var(--box-shadow);
    transition: 250ms;
}
`;

    style.innerHTML = sHtml;
    document.getElementsByTagName('head')[0].appendChild(style);
    console.log(pluginName + 'css加载完成');
}