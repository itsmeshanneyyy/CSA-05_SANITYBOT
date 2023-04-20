let currentChat = 1;

epds = {
  1: {
    question: "Have you been capable of finding humor and laughing about situations?",
    0: "As much as I always could",
    1: "Not quite so much now",
    2: "Definitely not so much now",
    3: "Hardly at all",
  },
  2: {
    question: "Have you anticipated things with pleasure and excitement?",

    0: "As much as I ever did",
    1: "Rather less than I used to",
    2: "Definitely less than I used to",
    3: "Hardly at all",
  },
  3: {
    question: "Have you needlessly held yourself responsible when things didn't go well?",
    3: "Yes, most of the time",
    2: "Yes, some of the time",
    1: "Not very often",
    0: "No, Never",
  },
  4: {
    question: "Have you experienced anxiety or concern without a valid cause?",
    0: "No, not at all",
    1: "Hardly ever",
    2: "Yes, sometimes",
    3: "Yes, very often",
  },
  5: {
    question: "Have you experienced fear or panic without a clear or justifiable reason?",
    3: "Yes, quite a lot",
    2: "Yes, sometimes",
    1: "No, not much",
    0: "No, not at all",
  },
  6: {
    question: "Have things been overwhelming you?",
    3: "Yes, most of the time I haven't been able to cope",
    2: "Yes, sometimes I haven't been coping as well as usual",
    1: "No, most of the time I have coped quite well",
    0: "No, I have been coping as well as ever",
  },
  7: {
    question: "Have you been so unhappy that you have experienced trouble sleeping?",
    3: "Yes, most of the time",
    2: "Yes, sometimes",
    1: "Not very often",
    0: "No, not at all",
  },
  8: {
    question: "Have you experienced feelings of sadness or misery?",
    3: "Yes, most of the time",
    2: "Yes, quite often",
    1: "Not very often",
    0: "No, not at all",
  },
  9: {
    question: "Have you been so unhappy that you have shed tears?",
    3: "Yes, most of the time",
    2: "Yes, quite often",
    1: "Only occasionally",
    0: "No, never",
  },
  10: {
    question: "Have you had thoughts of self-harm?",
    3: "Yes, quite often",
    2: "Sometimes",
    1: "Hardly ever",
    0: "Never",
  },
};

let epdsData = [];
let epdsMessages = [];

elements = document.getElementsByClassName("preset-chat");
presetWrapper = document.querySelector(".chat_preset");

enterPreset = (e) => {
  epdsData.splice(currentChat - 1, 1, parseInt(e.target.id));
  document.querySelector(".chat_input").firstElementChild.value =
    e.target.textContent;
  epdsMessages.push(e.target.textContent);
  saveChat(e.target.textContent, "user")
  document.querySelector(".chatbox__send--footer").click();
  console.log(epdsMessages);
};

changeChatPreset();

function changeChatPreset() {
  if (currentChat <= 10) {
    elements[0].innerText = epds[currentChat][0];
    elements[1].innerText = epds[currentChat][1];
    elements[2].innerText = epds[currentChat][2];
    elements[3].innerText = epds[currentChat][3];

    elements[0].id = 0;
    elements[1].id = 1;
    elements[2].id = 2;
    elements[3].id = 3;
  } else {
    presetWrapper.remove();
    // presetWrapper.style.display = 'none';
  }

}

elements[0].addEventListener("click", enterPreset);
elements[1].addEventListener("click", enterPreset);
elements[2].addEventListener("click", enterPreset);
elements[3].addEventListener("click", enterPreset);

class Chatbox {
  constructor() {
    this.args = {
      openButton: document.querySelector(".chatbox__button"),
      chatBox: document.querySelector(".chatbox__support"),
      sendButton: document.querySelector(".send__button"),
    };

    this.state = false;
    this.messages = [];
  }

  display() {
    const { openButton, chatBox, sendButton } = this.args;

    openButton.addEventListener("click", () => this.toggleState(chatBox));

    sendButton.addEventListener("click", () => this.onSendButton(chatBox));

    const node = chatBox.querySelector("input");
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton(chatBox);
      }
    });

    document.querySelector(".chat_input").style.display = 'none';

    // NOTE: use following lines to show early messages
    // const firstMessage = "Hi there! I'm SanityBot. I'm here to make you feel heard. Please try to answer my questions honestly for me to have maternal attachment with you. Thank you!"
    // const secondMessage = "Have you been capable of finding humor and laughing about situations?"
    // saveChat(firstMessage, "sanitybot")
    // saveChat(secondMessage, "sanitybot")
    // this.messages.push(secondMessage);
    // this.messages.push(firstMessage);
  }

  toggleState(chatbox) {
    this.state = !this.state;

    // show or hides the box
    if (this.state) {
      chatbox.classList.add("chatbox--active");
    } else {
      chatbox.classList.remove("chatbox--active");
    }
  }

  onSendButton(chatbox) {
    var textField = chatbox.querySelector("input");
    let text1 = textField.value;
    if (text1 === "") {
      return;
    }


    currentChat++;
    if (currentChat <= 10) {
      console.log(currentChat)
    } else {
      let sum = 0;
      for (let data of epdsData) {
        sum += data;
      }
      epdsData.splice(currentChat, 1, sum);

      if (currentChat <= 11) { // EVERY CHAT IN ASSESSMENT
        console.log(epdsData)
        fetch("http://127.0.0.1:5000/predict_epds", {
          method: "POST",
          body: JSON.stringify({ message: epdsData, text: epdsMessages }),
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((r) => r.json())
          .then((r) => {
            let msg2 = { name: "Sanitybot", message: r.answer };
            this.messages.push(msg2);
            this.messages.push({ name: "Sanitybot", message: "You can download the detailed version of the assessment. <a href='http://localhost:5000/file/AssessmentResult.docx'>Click here</a>" })
            msg2 = { name: "Sanitybot", message: "Do you have any questions? I will be glad to answer all your queries." };
            this.messages.push(msg2);
            // presetWrapper.style.display = 'flex';
            // elements[0].innerText = "Yes"
            // elements[1].innerText = "No"
            // elements[2].style.display = 'none'
            // elements[3].style.display = 'none'
            this.updateChatText(chatbox);
            textField.value = "";

            document.querySelector(".chat_input").style.display = 'flex';
          })
          .catch((error) => {
            console.error("Error:", error);
            this.updateChatText(chatbox);
            textField.value = "";
          });
      } else {
        fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          body: JSON.stringify({ message: text1 }),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
        })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sanitybot", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

          }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
      }
    }

    console.log(epdsData);
    changeChatPreset();



    let msg1 = { name: "User", message: text1 };
    this.messages.push(msg1);

    if (currentChat <= 10) {
      let msg2 = { name: "Sanitybot", message: epds[currentChat]["question"] };
      this.messages.push(msg2);
      saveChat(epds[currentChat]["question"], "sanitybot")
    }


    this.updateChatText(chatbox);
    textField.value = "";


  }

  updateChatText(chatbox) {
    var html = "";
    this.messages
      .slice()
      .reverse()
      .forEach(function (item, index) {
        if (item.name === "Sanitybot") {
          html +=
            '<div class="messages__item messages__item--visitor">' +
            item.message +
            "</div>";
        } else {
          html +=
            '<div class="messages__item messages__item--operator">' +
            item.message +
            "</div>";
        }
      });

    const chatmessage = chatbox.querySelector(".chatbox__messages");
    chatmessage.innerHTML = html;
  }
}

const chatbox = new Chatbox();
chatbox.display();

// FOR DARK AND LIGHT MODE
var toggle_btn;
var wrapper;
var hamburger_menu;

function declare() {
  toggle_btn = document.querySelector(".toggle-btn");
  wrapper = document.querySelector(".wrapper");
  hamburger_menu = document.querySelector(".hamburger");
}

declare();

const main = document.querySelector("main");

let dark = false;

function toggleAnimation() {
  // Clone the wrapper
  dark = !dark;
  let clone = wrapper.cloneNode(true);
  if (dark) {
    clone.classList.remove("light");
    clone.classList.add("dark");
  } else {
    clone.classList.remove("dark");
    clone.classList.add("light");
  }

  clone.classList.add("copy");
  main.appendChild(clone);

  clone.addEventListener("animationend", () => {
    wrapper.remove();
    clone.classList.remove("copy");
    // Reset Variables
    declare();
    events();
  });
}

/*==================== Toggle Event ====================*/
function events() {
  toggle_btn.addEventListener("click", toggleAnimation);
  hamburger_menu.addEventListener("click", () => {
    wrapper.classList.toggle("active");
  });
}

events();

// =----------------------------------
changeChatPreset();
