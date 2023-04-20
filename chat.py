from nltk_utils import bag_of_words, tokenize
from model import NeuralNet
import random
import json
import torch
import os
import openai
from flask_login import current_user
from sanitybot.models import ChatHistory


def detect(message, epds):
    openai.organization = "org-HSjZwP5xRG5Nv6UxyhU9X7jZ"
    openai.api_key = "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"
    response = openai.Completion.create(model="text-davinci-003", prompt=f"direction: match the input to the options and display the equivalent option value to the equivalent, don't explain, choose in options list, if no equivalent value randomly select from options question: Could you tell me if you have experienced fear or panic without a clear justifiable reason? options: '{epds['0']}', '{epds['1']}', '{epds['2']}', '{epds['3']}' input: {message} equivalent: ",
                                        temperature=0.9, max_tokens=7)
    return response.choices[0].text.replace("'", "")


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r') as json_data:
    intents = json.load(json_data)

FILE = "data.pth"
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "Sam"


def get_response(msg):
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])

    return "Sorry, I didn't get your questions. Please try to ask about postpartum depression or any maternal health related quotes."


def from_history_to_prompt(chat):
    # value_if_true if condition else value_if_false
    new_chat = { "role": "user" if (chat.by == "sanitybot") else chat.by, "content": chat.message }
    return new_chat


def predict_chat(input):
    openai.organization = "org-HSjZwP5xRG5Nv6UxyhU9X7jZ"
    openai.api_key = "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"

    chats = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.date_send.desc()).all()
    print(chats)

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"""
    [User Profile
    first name: {current_user.firstname}
    middle name: {current_user.middlename}
    last name: {current_user.lastname}
    age: {current_user.age}
    address: {current_user.address}
    contact: {current_user.contact}
    email: {current_user.email}
    marital status: {current_user.marital}
    ]

    [Socio-Demographic Profile [educational attainment: {current_user.educ},
    emplyment status: {current_user.employ},
    family montly income: {current_user.income},
    diagnosed history with a psychiatric condition: {current_user.sdp1},
    psychiatric illness history: {current_user.sdp2},
    smoking: {current_user.sdp3},
    taking alcohol: {current_user.sdp4},
    physical abuse history: {current_user.sdp5},
    sexual abuse history: {current_user.sdp6},
    status of child: {current_user.sdp7},
    planned pregnancy: {current_user.sdp8},
    breastfeeding: {current_user.sdp9}]]

    [pregnancy records [No. of Pregnancy: {current_user.numpreg},
    No. of Living Children: {current_user.livechild},
    No. of Premature Births: {current_user.numpremature},
    No.of Miscarriage: {current_user.nummiscarriage},
    Medical comorbidities: {current_user.comor},
    Mode of Delivery: {current_user.delivery},
    obstetric complication: {current_user.compli},
    child with congenital illness: {current_user.ill}]] 
    
    [if Mode of Delivery: Vaginal based on this data [induction of labor: {current_user.pr1},
    Epidural anesthesia given: {current_user.pr2},
    Hours of labor: {current_user.pr3}]] 

    [try to include the data on your reply][make your reply only one paragraph, and limit your chat into 40 words][you can make question based on the data]
    
    [STRICT RULES]
    [limit your answer only about postpartum depression]
    [do not talk about other topics not related, relevant, connected to pospartum depression]
    [make an appology if the topic is not about postpartum]
    
    """},
            *list(map(from_history_to_prompt, chats[:3])),
            {"role": "user", "content": f"{input}"},
        ]
    )


    data = response.choices[0].message.content
    formated_string = data.replace("\n", "<br>")


    return formated_string


def chat(inp):
    print(inp)
    print(words)
    results = model.predict([bag_of_words(inp, words)])[0]
    results_index = numpy.argmax(results)
    tag = labels[results_index]

    if results[results_index] > 0.75:
        for tg in data["intents"]:
            if tg['tag'] == tag:
                responses = tg['responses']
                return (random.choice(responses))

    return 'Sorry, I didnt get that. what is your question again?'


if __name__ == "__main__":
    print("Let's chat! (type 'quit' to exit)")
    while True:
        # sentence = "do you use credit cards?"
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)
