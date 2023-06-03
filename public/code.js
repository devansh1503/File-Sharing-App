let recieverID;
const socket = io();
function generateID() {
    return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`
}
function createRoom() {
    let joinID = generateID();
    document.getElementById("roomid").innerHTML = joinID;
    socket.emit("sender-join", {
        uid: joinID
    })
}

socket.on("init", function (data) {
    recieverID = data;
    alert("Other User Joined!")
})

function fileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function (e) {
        let buffer = new Uint8Array(reader.result);
        let el = document.createElement("div");
        el.setAttribute("style", "border:2px solid black; border-radius: 50%; padding: 10px; display: flex; flex-direction: column;justify-content: center;align-items: center;height: 150px;width: 150px;");
        el.innerHTML = `
            <p style="font-weight: 300;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${file.name}</p>
            <p style="font-size: 35px;" class="progress">0%</p>
        `;
        document.getElementsByClassName("file-uploads")[0].appendChild(el)
        shareFile({
            filename: file.name,
            total_buffer_size: buffer.length,
            buffer_size: 10240
        }, buffer, el.querySelector(".progress"));
    }
    reader.readAsArrayBuffer(file)
}

function shareFile(metadata, buffer, progress_node) {
    socket.emit("file-meta", {
        uid: recieverID,
        metadata: metadata
    });
    socket.on("fs-share", function () {
        let chunk = buffer.slice(0, metadata.buffer_size);
        buffer = buffer.slice(metadata.buffer_size, buffer.length);
        progress_node.innerText = Math.trunc((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100) + "%";
        if (chunk.length != 0) {
            socket.emit("file-raw", {
                uid: recieverID,
                buffer: chunk
            })
        }
    })
}