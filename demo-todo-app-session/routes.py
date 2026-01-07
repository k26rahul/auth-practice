from flask import Blueprint, request, jsonify, render_template
from models import db, User, Session, Todo
from werkzeug.security import check_password_hash
from utils import generate_token

routes = Blueprint("routes", __name__)


@routes.route("/")
def index():
  return render_template("index.html")


@routes.route("/auth/login", methods=["POST"])
def login():
  email = request.json.get("email")
  password = request.json.get("password")

  user = User.query.filter_by(email=email).first()
  if user and check_password_hash(user.password, password):
    session = Session(
        token=generate_token(),
        user_id=user.id
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Logged in as {user.name}",
        "payload": {
            "sessionId": session.id,
            "token": session.token,
        }
    })
  else:
    return jsonify({
        "success": False,
        "message": f"Incorrect email or password",
    })


@routes.route("/todo/list")
def list_todos():
  session_id = request.args.get("sessionId")
  token = request.args.get("token")

  session = Session.query.filter_by(id=session_id).first()
  if session and session.token == token:
    todos = Todo.query.filter_by(user_id=session.user_id).all()
    return jsonify({
        "success": True,
        "message": "All todos fetched",
        "payload": {
            "todos": [{
                "id": todo.id,
                "text": todo.text,
                "isDone": todo.is_done,
                "isStarred": todo.is_starred,
            } for todo in todos]
        }
    })

  return jsonify(["server is sad :("])


@routes.route("/todo/create")
def create_todo():
  return jsonify(["server is happy :)"])


@routes.route("/todo/update")
def update_todo():
  return jsonify(["server is happy :)"])
