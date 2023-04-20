const chatBox = document.querySelector(".chat_input");
const send = chatBox.querySelector(".send__button");
const chatInput = chatBox.querySelector("input");
const chatHistory = document.querySelector(".chatbox__support");
const chatPreset = document.querySelector(".chat_preset");
const chatForm = document.querySelector("#chat_form");
const chatMessages = document.querySelector(".chatbox__messages");
const typingIndicator = chatForm.querySelector(".typing-indicator");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

epds = [
  { question: "Are you ready to answer my questions?", 0: "Yes", 1: "No" },
  {
    question:
      "I wanted to ask, have you found that laughter and humor have helped you cope with some of the challenges of being a new mom?",
    0: "As much as I always could",
    1: "Not quite so much now",
    2: "Definitely not so much now",
    3: "Hardly at all",
  },
  {
    question: "Ohh, I see. Coping with postpartum depression is unique for everyone. While some women find humor helpful, it's okay if it's not for you. I'm curious if you've been looking forward to things with pleasure and excitement lately? It's totally okay if you haven't.",
    0: "As much as I ever did",
    1: "Rather less than I used to",
    2: "Definitely less than I used to",
    3: "Hardly at all",
  },
  {
    question:
      "It's completely normal for your level of excitement to change during the postpartum period, and it's okay if you're feeling less excited than you used to. Do you mind if I ask if you have ever found yourself feeling responsible or guilty for things that may not have been entirely within your control as a new mom?",
    3: "Yes, most of the time",
    2: "Yes, some of the time",
    1: "Not very often",
    0: "No, Never",
  },
  {
    question: "I understand. It's completely normal to feel a sense of responsibility or guilt as a new mom, even for things outside of your control. I hope you don't mind me asking, but have you ever felt worried or anxious without a clear reason? Please feel free to share, as it's important to take care of your mental health.",
    0: "No, not at all",
    1: "Hardly ever",
    2: "Yes, sometimes",
    3: "Yes, very often",
  },
  {
    question:
      "That makes sense. Whether you experience worry or anxiety frequently or not, know that it's common to have ups and downs. Could you tell me if you have experienced fear or panic without a clear or justifiable reason? Please know that you can share as much or as little as you'd like, and I'm here to provide support.",
    3: "Yes, quite a lot",
    2: "Yes, sometimes",
    1: "No, not much",
    0: "No, not at all",
  },
  {
    question: "I appreciate your honesty. Many new moms experience anxiety or fear, even without a clear cause. Also, it's normal to feel overwhelmed at times, especially as a new mom. Have you experienced that recently?",
    3: "Yes, most of the time I haven't been able to cope",
    2: "Yes, sometimes I haven't been coping as well as usual",
    1: "No, most of the time I have coped quite well",
    0: "No, I have been coping as well as ever",
  },
  {
    question:
      "It's understandable to feel overwhelmed as a new parent. It sounds like you've been experiencing some challenges with coping. But do you know that it's common for our mental and emotional state to affect our sleep. Have you noticed any changes in your sleeping patterns recently?",
    3: "Yes, most of the time",
    2: "Yes, sometimes",
    1: "Not very often",
    0: "No, not at all",
  },
  {
    question: "I see where you're coming from. Having trouble sleeping is a common experience when one is feeling unhappy or stressed. It's normal to have such feelings sometimes. Can I ask if you've been feeling low or unhappy recently?",
    3: "Yes, most of the time",
    2: "Yes, quite often",
    1: "Not very often",
    0: "No, not at all",
  },
  {
    question: "I understand that feeling sad or miserable can be a difficult experience, but know that you're not alone. Would it be okay if I ask if you've been feeling so unhappy that you've cried? Remember that it's common to have intense emotions, and it's important to take care of yourself.",
    3: "Yes, most of the time",
    2: "Yes, quite often",
    1: "Only occasionally",
    0: "No, never",
  },
  {
    question: "Ah, I see. It's completely normal to feel emotional and cry during tough times. However, I want to make sure you're taking care of yourself. Have you ever had any thoughts of hurting yourself? It's okay to talk about these things, and I'm here to listen and support you.",
    3: "Yes, quite often",
    2: "Sometimes",
    1: "Hardly ever",
    0: "Never",
  },
];
let is_assess = false;
let currentEPDS = 0;
const userEPDS = [];
let messages = [];
let is_start = false;

async function database(url, method = "GET", body = {}) {
  let data;
  switch (method) {
    case "GET":
      data = await fetch(`http://127.0.0.1:5000/${url}`, {
        method,
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((json) => json);
      break;
    default:
      data = await fetch(`http://127.0.0.1:5000/${url}`, {
        method,
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((json) => json);
      break;
  }

  return data;
}

function addMessage(message, by, isLoading = false) {
  messages.push({ message, by });
  chatInput.value = "";

  let newMessages = "";
  messages
    .slice()
    .reverse()
    .filter((c) => {
      if (isLoading) {
        return c;
      } else {
        messages = messages.filter((obj) => obj.by !== "loading");
        return c.by != "loading";
      }
    })
    .forEach((c) => {
      switch (c.by) {
        case "user":
          newMessages += `<div class="messages__item messages__item--operator">${c.message}</div>`;
          break;
        case "sanitybot":
          newMessages += `<div class="messages__item messages__item--visitor">${c.message}</div>`;
          break;
        case "loading":
          newMessages += `<div class="messages__item messages__item--visitor typing-indicator"><span></span><span></span><span></span></div>`;
          break;
      }
    });

  chatMessages.innerHTML = newMessages;
  chatMessages.scrollTop = 0;
}

const handleSend = async (event) => {
  event.preventDefault();
  if (chatInput.value.trim() == "") {
    return;
  }

  const message = chatInput.value.trim();
  await user(message);

  if (is_assess) {
    addMessage("", "loading", true);
    await delay(1000);
    const data = await database("predict_chat", "POST", { message });
    await sanitybot(data.answer);
  }

  if (!is_start) {
    is_start = true;
    await assessment();
  } else {
    console.log(currentEPDS)
    if (event.target.id === "chat_form") {

      const detect = await database("assess-detect", "POST", { message, epds: { 0: epds[currentEPDS][0], 1: epds[currentEPDS][1], 2: epds[currentEPDS][2], 3: epds[currentEPDS][3] } })

      for (const [key, value] of Object.entries(epds[currentEPDS])) {
        console.log(`${value.toLowerCase().trim()} ____ ${detect.toLowerCase().trim()}`)
        if (value.toLowerCase().trim().includes(detect.toLowerCase().trim())) {
          userEPDS.push(key);
          currentEPDS++;
          epds_assessment(event);
        }
      }
    }
    else {
      userEPDS.push(event.target.id);
      epds_assessment(event);
    }
  }
};
chatForm.addEventListener("submit", handleSend);

async function getMessages() {
  const data = await database("messages");
  messages = [];
  for (const chat of data.chats) {
    messages.push(chat);
  }

  let newMessages = "";
  data.chats
    .slice()
    .reverse()
    .forEach((c) => {
      switch (c.by) {
        case "user":
          newMessages += `<div class="messages__item messages__item--operator">${c.message}</div>`;
          break;
        case "sanitybot":
          newMessages += `<div class="messages__item messages__item--visitor">${c.message}</div>`;
          break;
      }
    });

  chatMessages.innerHTML = newMessages;
}

async function handlePreset(event) {
  const message = event.target.innerText;
  chatInput.value = message;
  chatPreset.style.opacity = 0;
  handleSend(event);
  currentEPDS++;
}

async function assessment() {
  await getMessages();

  is_assess = await database("is-assess", "GET");
  if (is_assess) {
    chatBox.style.display = "flex";
    return;
  }
  addMessage("", "loading", true);

  if (!is_start) {
    await delay(2000);
    await sanitybot(
      "Hello there! It's lovely to meet you! I'm SanityBot, your AI friend, and I'm here to help you take care of yourself. I'm excited to get to know you better, but before we begin our conversation, could you please answer a few questions to help me understand how I can best support you?"
    );
    addMessage("", "loading", true);

    await delay(4000);
    await sanitybot("I hope you're doing well. I'm here and ready to listen if you need someone to talk to. Can we chat about anything on your mind?");

    chatPreset.children[0].innerText = epds[currentEPDS][0];
    chatPreset.children[1].innerText = epds[currentEPDS][1];
    chatPreset.children[2].style.display = "none";
    chatPreset.children[3].style.display = "none";
    chatPreset.children[0].addEventListener("click", handlePreset);
    chatPreset.children[1].addEventListener("click", delete_messages);
    chatPreset.style.display = "flex";
  } else {
    await delay(2000);
    await sanitybot(
      "Great to hear that! I'm here to provide support for any questions or concerns you may have about postpartum depression."
    );

    chatPreset.children[0].id = 0;
    chatPreset.children[1].id = 1;
    chatPreset.children[2].id = 2;
    chatPreset.children[3].id = 3;
    chatPreset.children[0].innerText = epds[currentEPDS][0];
    chatPreset.children[1].innerText = epds[currentEPDS][1];
    chatPreset.children[2].innerText = epds[currentEPDS][2];
    chatPreset.children[3].innerText = epds[currentEPDS][3];
    chatPreset.children[0].addEventListener("click", handlePreset);
    chatPreset.children[1].removeEventListener("click", delete_messages);
    chatPreset.children[1].addEventListener("click", handlePreset);
    chatPreset.children[2].addEventListener("click", handlePreset);
    chatPreset.children[3].addEventListener("click", handlePreset);
    chatPreset.children[2].style.display = "block";
    chatPreset.children[3].style.display = "block";

    addMessage("", "loading", true);
    await delay(2000);

    await sanitybot(epds[currentEPDS].question);

    chatPreset.style.display = "flex";
    chatPreset.style.opacity = 100;
  }
}
assessment();

async function user(message) {
  addMessage(message, "user");
  await database("add_message_history", "POST", {
    message,
    by: "user",
  });
}
async function sanitybot(message) {
  await database("add_message_history", "POST", {
    message,
    by: "sanitybot",
  });
  addMessage(message, "sanitybot");
}
function updatePreset(epds) {
  chatPreset.children[0].innerText = epds[0];
  chatPreset.children[1].innerText = epds[1];
  chatPreset.children[2].innerText = epds[2];
  chatPreset.children[3].innerText = epds[3];
  chatPreset.style.opacity = 100;
}
async function epds_assessment(event) {
  if (is_assess) {
    return;
  }

  if (currentEPDS < epds.length) {
    addMessage("", "loading", true);
    await delay(2000);
    await sanitybot(epds[currentEPDS].question);
    updatePreset(epds[currentEPDS]);
  } else {
    let sum = 0;
    for (let data of userEPDS) {
      sum += Number(data);
    }
    userEPDS.push(sum);

    console.log(userEPDS);

    addMessage("", "loading", true);
    await delay(2000);

    const data = await database("predict_epds", "POST", { epds: userEPDS });

    console.log('data', data)
    console.log('self_help', data.self_help)
    await sanitybot(data.answer);

    addMessage("", "loading", true);
    await delay(12000);

    let message =
      "Your assessment results are now available for download. You can access your detailed analysis by following the link I provided. If you have any questions or concerns, please don't hesitate to reach out to me. I’m here to help. <a href='http://localhost:5000/file/AssessmentResult.docx'>Click here</a>";
    await sanitybot(message);

    addMessage("", "loading", true);
    await delay(10000);

    message =
      "In case you need extra support, I can also provide you with some self-help options to help you cope with your condition. Just let me know if you're interested and I’ll be happy to provide more information. Interested in self-help options?";
    await sanitybot(message);



    chatPreset.children[0].innerText = "Yes";
    chatPreset.children[1].innerText = "No";
    chatPreset.children[2].style.display = "none";
    chatPreset.children[3].style.display = "none";
    chatPreset.children[0].addEventListener("click", self_help_yes);
    chatPreset.children[1].addEventListener("click", self_help_no);
    chatPreset.style.display = "flex";
    chatPreset.style.opacity = 100;


  }
}

async function self_help_yes() {
  const data2 = await database("predict_epds", "POST", { epds: userEPDS });
  console.log('data', data2)
  let num = parseInt(data2.self_help); // from utils.pdd_prediction self_help

  if (num === 0) {
    console.log("The number is zero.");
    await delay(8000);
    await sanitybot(
      `<div>While the assessment indicates that depression is not likely, it's still important to prioritize your mental health and well-being. Here are some self-help resources that you may find helpful:</div>
      <br>
      <div>\n\u2022Prioritize self-care: Take time for yourself each day to do something that you enjoy, whether it's reading a book, taking a bath, or going for a walk.</div>
      <div>\n\u2022Stay connected: Make time to connect with friends and family, even if it's just a quick phone call or text message.</div>
      <div>\n\u2022Exercise regularly: Exercise has been shown to have numerous mental health benefits, including reducing stress and anxiety.</div>
      <div>\n\u2022Eat a healthy, balanced diet: A healthy diet can help support your overall physical and mental health.</div>
      <div>\n\u2022Get enough sleep: Aim for at least 7-8 hours of sleep each night to support your physical and mental well-being.</div>`
    );
    addMessage("", "loading", true);
    await delay(10000);
    await delay(8000);
    await sanitybot(
      `<div>Some reliable websites that you may find helpful for postpartum depression include:</div>
      <br>
      <div>\n\u2022Postpartum Support International <a href="https://www.postpartum.net/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022National Institute of Mental Health <a href="https://www.nimh.nih.gov/health/topics/postpartum-depression/index.shtml" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022American Pregnancy Association <a href="https://americanpregnancy.org/mental-health/postpartum-depression/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022Mayo Clinic <a href="https://www.mayoclinic.org/diseases-conditions/postpartum-depression/symptoms-causes/syc-20376617" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The Postpartum Stress Center <a href="https://postpartumstress.com/" target='_blank'>(Click Here)</a></div>
      <br>
      Remember that taking care of yourself is essential, even if you're not experiencing depression. If you have any questions or concerns, please don't hesitate to reach out to me.`
    );
  } else if (num === 1) {
    console.log("The number is one.");
    await delay(8000);
    await sanitybot(
      `<div>Here are some additional self-help options that may be helpful if your initial assessment for postpartum depression suggests a possible depression:
      </div>
      <br>
      <div>\n\u2022Exercise regularly, even if it's just a short walk outside. Exercise can help improve mood and reduce stress.</div>
      <div>\n\u2022Connect with other new mothers who may be experiencing similar feelings. Consider joining a support group or attending a postpartum exercise class.
      </div>
      <div>\n\u2022Practice relaxation techniques such as deep breathing or meditation to help manage stress and anxiety.</div>
      <div>\n\u2022Get enough sleep and try to establish a regular sleep routine.
      </div>
      <div>\n\u2022Eat a balanced diet with plenty of fruits, vegetables, whole grains, and lean protein.</div>
      <div>\n\u2022Make time for yourself and engage in activities that you enjoy.
      </div>
      <div>\n\u2022Consider speaking with a therapist or mental health professional to discuss your concerns and develop a personalized plan for managing your symptoms.</div>`
    );
    addMessage("", "loading", true);
    await delay(10000);
    await delay(8000);
    await sanitybot(
      `<div>Here are some more trusted websites related to postpartum depression:</div>
      <br>
      <div>\n\u2022The Blue Dot Project <a href="https://www.thebluedotproject.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022Postpartum Health Alliance <a href="https://postpartumhealthalliance.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u20222020 Mom <a href="https://www.2020mom.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022National Perinatal Association <a href="https://www.nationalperinatal.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022PANDAS Foundation <a href="https://www.pandasfoundation.org.uk/" target='_blank'>(Click Here)</a></div>
      <br>
      Remember, taking care of your mental health is just as important as taking care of your physical health. Don't hesitate to reach out for support if you need it.`
    );
  } else if (num === 2) {
    console.log("The number is two.");
    await delay(8000);
    await sanitybot(
      `<div>While the assessment indicates a fairly high possibility of postpartum depression, it's essential to prioritize your mental health and well-being. As a new mother, taking care of yourself is just as important as taking care of your baby. Here are some self-help resources that may assist you in coping with postpartum depression: </div>
      <br>
      <div>\n\u2022Talk to someone: It can be helpful to speak to a trusted friend, family member, or healthcare professional about your feelings.</div>
      <div>\n\u2022Join a support group: There are many support groups for new mothers who are experiencing postpartum depression. Joining a group can help you feel less alone and provide you with a safe space to share your feelings.</div>
      <div>\n\u2022Get enough rest: It's important to prioritize sleep and try to get as much rest as possible.</div>
      <div>\n\u2022Exercise: Exercise has been shown to be an effective way to reduce symptoms of depression. Even going for a short walk can be beneficial.</div>
      <div>\n\u2022Practice self-care: Take time to do things that make you feel good, whether it's taking a relaxing bath, reading a book, or watching a favorite movie.</div>
      <div>\n\u2022Consider therapy: Therapy can be a helpful tool for managing postpartum depression. There are many therapists who specialize in working with new mothers.</div>`
    );
    addMessage("", "loading", true);
    await delay(10000);
    await delay(8000);
    await sanitybot(
      `<div>Some reliable websites that you may find helpful for postpartum depression include:</div>
      <br>
      <div>\n\u2022The Postpartum Health Alliance <a href="https://postpartumhealthalliance.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The Blue Dot Project <a href="https://www.thebluedotproject.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The National Perinatal Association <a href="https://www.nationalperinatal.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The Association for Postnatal Illness <a href="https://apni.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The Postpartum Society of Florida <a href="https://postpartumsocietyfl.org" target='_blank'>(Click Here)</a></div>
      <br>
      Remember that seeking help is a sign of strength, and there is no shame in reaching out for support. Let me know if you have any questions or concerns.`
    );
  } else if (num === 3) {
    console.log("The number is three.");
    await delay(8000);
    await sanitybot(
      `<div>I'm sorry to hear that the assessment has resulted in probable depression, but please know that you're not alone and there are resources available to support you. Here are some self-help resources that may be helpful specifically for postpartum depression: </div>
      <br>
      <div>\n\u2022Reach out to your healthcare provider or a mental health professional for further assessment and guidance. They may recommend therapy, medication, or other treatment options.</div>
      <div>\n\u2022Practice self-care activities such as getting enough sleep, eating healthy meals, and engaging in regular exercise.</div>
      <div>\n\u2022Seek support from family, friends, or a support group. Connecting with others who have experienced or are currently experiencing postpartum depression can be helpful.</div>
      <div>\n\u2022Try relaxation techniques such as deep breathing, meditation, or yoga to manage stress and anxiety.</div>
      <div>\n\u2022Consider online resources such as websites, forums, or apps that provide support and information on postpartum depression.</div>
      <div>\n\u2022Practice mindfulness or meditation to help manage negative thoughts and feelings.</div>
      <div>\n\u2022Consider joining a support group for new mothers experiencing similar struggles.</div>`
    );
    addMessage("", "loading", true);
    await delay(10000);
    await delay(8000);
    await sanitybot(
      `<div>Some reliable websites that you may find helpful for postpartum depression include:</div>
      <br>
      <div>\n\u2022The Blue Dot Project <a href="https://www.thebluedotproject.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The Postpartum Health Alliance <a href="https://postpartumhealthalliance.org/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The Pregnancy and Postpartum Health Alliance of Texas <a href="https://www.texasperinatal.org/ppha/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The Black Women's Health Imperative <a href="https://bwhi.org/programs/maternal-and-infant-mortality/maternal-mental-health/" target='_blank'>(Click Here)</a></div>
      <div>\n\u2022The Association for Postnatal Illness <a href="https://apni.org/" target='_blank'>(Click Here)</a></div>
      <br>
      Remember that it's important to seek professional help if you're struggling with postpartum depression. Don't hesitate to speak with a healthcare provider or mental health professional for further assistance.`
    );
  } else {
    console.log("The number is outside the range of 0 to 3.");
    await delay(8000);
    await sanitybot(
      "Self help - The number is outside the range of 0 to 3."
    );
  }

  chatPreset.style.opacity = 0;
  chatBox.style.display = "flex";
  is_assess = true;
  chatPreset.style.display = "none";
}

async function self_help_no() {

  chatPreset.style.opacity = 0;
  await delay(1000);
  await sanitybot(
    "No problem at all! If you change your mind and would like more information on self-help resources in the future, please don't hesitate to reach out to me. I am always here to support you."
  );

  chatBox.style.display = "flex";
  is_assess = true;
  chatPreset.style.display = "none";
}

async function delete_messages() {
  await user("No");
  addMessage("", "loading", true);
  chatPreset.style.opacity = 0;
  await delay(1000);
  await sanitybot(
    "Oh that’s sad. Maybe we can have another conversation some other time, I’m always here to listen."
  );

  await fetch("http://127.0.0.1:5000/delete_messages", {
    method: "DELETE",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      modal.close();
      window.location.replace("http://127.0.0.1:5000/welcomeback");
    });
}
