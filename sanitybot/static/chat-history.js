const sendButton = document.querySelector(".send__button");
const buttonYes = document.querySelector(".save_messages_yes");
const buttonNo = document.querySelector(".save_messages_no");
const modal = document.querySelector("#modal");
const showModal = document.querySelector("#show-modal");

// const chatInput = document.querySelector(".chat_input").children[0];

async function saveChat(message, by) {
    await fetch("http://127.0.0.1:5000/add_message_history", {
        method: 'POST', mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, by }),
    }).then((res) => res.json())
        .then((res) => { console.log(res) })
}

// sendButton.addEventListener('click', async (e) => {
//     const chat = chatInput.value;
//     const by = "user"

//     await fetch("http://127.0.0.1:5000/add_message_history", {
//         method: 'POST', mode: "cors",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ message: chat, by }),
//     }).then((res) => res.json())
//         .then((res) => { console.log(res) })
// });

showModal.addEventListener('click', async (e) => {
    modal.showModal();
});

buttonYes.addEventListener('click', async (e) => {
    modal.close();
});

buttonNo.addEventListener('click', async (e) => {
    console.log('no clicked')

    await fetch("http://127.0.0.1:5000/delete_messages", {
        method: 'DELETE', mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json())
        .then((res) => {
            console.log(res);
            modal.close();
            // window.location.href = "http://127.0.0.1:5000/welcomeback";
            window.location.replace("http://127.0.0.1:5000/welcomeback");
        })
});