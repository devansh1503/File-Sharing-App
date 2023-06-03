let senderID;
const socket = io();
function generateID() {
    return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`
}
function createRoom() {
    senderID = document.getElementById("room-id").value;
    let joinID = generateID();
    socket.emit("reciever-join", {
        uid: joinID,
        sender_uid: document.getElementById("room-id").value
    })
    alert("Joined!")
}

let fileShare = {}

socket.on("fs-meta", function (metadata) {
    fileShare.metadata = metadata;
    fileShare.transmitted = 0;
    fileShare.buffer = [];
    let el = document.createElement("div");
    el.setAttribute("style", "border:2px solid black; border-radius: 50%; padding: 10px; display: flex; flex-direction: column;justify-content: center;align-items: center;height: 150px;width: 150px;");
    el.innerHTML = `
            <p style="font-weight: 300;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${metadata.filename}</p>
            <p style="font-size: 35px;" class="progress">0%</p>
        `;
    document.getElementsByClassName("file-uploads")[0].appendChild(el)
    fileShare.progress_node = el.querySelector(".progress");

    socket.emit("fs-start", {
        uid:senderID
    })
})
socket.on("fs-share", function(buffer){
    fileShare.buffer.push(buffer)
    fileShare.transmitted += buffer.byteLength;
    fileShare.progress_node.innerText = Math.trunc(fileShare.transmitted / fileShare.metadata.total_buffer_size * 100) + "%";
    if(fileShare.transmitted == fileShare.metadata.total_buffer_size){
        download(new Blob(fileShare.buffer), fileShare.metadata.filename);
        fileShare = {}
    }
    else{
        socket.emit("fs-start", {
            uid:senderID
        });
    }
})

function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchorElement = document.createElement('a');
    anchorElement.href = url;
    anchorElement.download = filename;
  
    // Programmatically trigger the download
    anchorElement.click();
  
    // Clean up the temporary URL
    URL.revokeObjectURL(url);
  }