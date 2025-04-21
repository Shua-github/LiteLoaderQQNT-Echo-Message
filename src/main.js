const { ipcMain } = require('electron');
const http = require('http');
const https = require('https');
const serverURL = "http://127.0.0.1:3000";

function call_forward_msg(message_id, group_id, user_id, is_long_id) {
    let payload = {
        message_id,
        is_long_id,
    };

    let interfaceName;  // 确保接口名变量被定义
    
    if (group_id) {
        payload.group_id = group_id;
        interfaceName = "forward_group_single_msg";
    } else if (user_id) {
        payload.user_id = user_id;
        interfaceName = "forward_friend_single_msg";
    } else {
        return Promise.reject(new Error("必须提供 group_id 或 user_id"));
    }

    const url = new URL(serverURL + "/" + interfaceName);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    };

    const client = url.protocol === "https:" ? https : http;

    return new Promise((resolve, reject) => {
        const req = client.request(url, options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                try {
                    const result = JSON.parse(data);
                    if (result.success) {
                        resolve(result);
                    } else {
                        reject(new Error("转发失败"));
                    }
                } catch (error) {
                    reject(new Error("响应解析失败"));
                }
            });
        });

        req.on("error", (error) => {
            reject(new Error("请求失败: " + error.message));
        });

        req.write(JSON.stringify(payload));
        req.end();
    });
}

// 运行在 Electron 主进程 下的插件入口
const {pluginLog} = require("./utils/backendLogUtils.js");

// 创建窗口时触发
exports.onBrowserWindowCreated = (window) => {

    try {
        // window 为 Electron 的 BrowserWindow 实例
        ipcMain.handle('call_forward_msg', async (event, message_id, group_id, user_id, is_long_id) => {
            try {
                return await call_forward_msg(message_id, group_id, user_id, is_long_id);
            } catch (error) {
                throw error;
            }
        });
    } catch (e) {
        pluginLog(e)
    }
}


// 用户登录时触发
exports.onLogin = (uid) => {
    // uid 为 账号 的 字符串 标识
}