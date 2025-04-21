const { contextBridge, ipcRenderer } = require('electron');

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("echo_message", {
    call_forward_msg: (message_id, group_id, user_id) => 
        ipcRenderer.invoke('call_forward_msg', message_id, group_id, user_id),
    startRender: () => ipcRenderer.send("LiteLoader.echo_message.startRender"),
});
