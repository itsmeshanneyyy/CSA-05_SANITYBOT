from sanitybot.models import ChatHistory
from flask_login import login_required, current_user
from socket import socket
from sanitybot import create_app
from flask import request, jsonify, send_file
from chat import get_response, detect, predict_chat
from utils import pdd_prediction
from flask_migrate import Migrate
from sanitybot import db
app = create_app()


@app.post("/predict")
def predict():
    text1 = request.get_json().get("message")
    response = get_response(text1)
    print(response)
    message = {"answer": response}
    return jsonify(message)


@app.post("/predict_chat")
def chat_predict():
    text1 = request.get_json().get("message")
    response = predict_chat(text1)
    print(response)
    message = {"answer": response}
    return jsonify(message)


@app.get("/messages")
def get_messages():
    chats = ChatHistory.query.filter_by(user_id=current_user.id).all()
    messages = [{"message": chat.message, "by": chat.by} for chat in chats]
    print(messages)
    return jsonify({"chats": messages})


@app.post('/add_message_history')
def add_message_history():
    chat = request.get_json().get("message")
    by = request.get_json().get("by")

    new_chat = ChatHistory(
        message=chat, user_id=current_user.id, by=by)
    db.session.add(new_chat)
    db.session.commit()

    return jsonify({"message": "message saved"})


@app.delete('/delete_messages')
def delete_messages():
    ChatHistory.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({"message": "chat history deleted"})


@app.post("/predict_epds")
def predict_epds():

    text1 = request.get_json().get("epds")
    response = pdd_prediction(text1)
    current_user.is_assess = True
    db.session.commit()
    print(response[0])
    message = {"answer": response[0], "self_help": response[1]}
    return jsonify(message)


@app.route('/file/<path:filename>')
def serve_file(filename):
    return send_file(filename, as_attachment=True)


@app.get('/is-assess')
def user():
    return jsonify(current_user.is_assess)


@app.post('/assess-detect')
def value():
    epds = request.get_json().get("epds")
    message = request.get_json().get("message")
    print(epds)
    output = detect(message, epds)
    return jsonify(output)


if __name__ == '__main__':
    app.run(debug=True)
