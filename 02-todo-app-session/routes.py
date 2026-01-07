from flask import Blueprint, request, jsonify, render_template
from models import db, User, Session, Todo
from werkzeug.security import check_password_hash
from utils import validate_session, generate_token

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
  session = validate_session()
  if session:
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
  else:
    return jsonify({"success": False, "message": "Unauthorized"}), 401


@routes.route("/todo/create")
def create_todo():
  session = validate_session()
  if session:
    text = request.args.get("text")

    db.session.add(Todo(
        text=text,
        user_id=session.user_id
    ))
    db.session.commit()

    return jsonify({"success": True, "message": "Todo created"})
  else:
    return jsonify({"success": False, "message": "Unauthorized"}), 401


@routes.route("/todo/update")
def update_todo():
  if validate_session():
    todo_id = request.args.get("todoId")
    action = request.args.get("action")

    todo = Todo.query.filter_by(id=todo_id).first()

    if action == "markDone":
      todo.is_done = not todo.is_done

    elif action == "markStarred":
      todo.is_starred = not todo.is_starred

    db.session.commit()
    return jsonify({"success": True, "message": "Todo updated"})
  else:
    return jsonify({"success": False, "message": "Unauthorized"}), 401


@routes.route("/todo/delete")
def delete_todo():
  if validate_session():
    todo_id = request.args.get("todoId")

    todo = Todo.query.filter_by(id=todo_id).first()

    db.session.delete(todo)
    db.session.commit()
    return jsonify({"success": True, "message": "Todo deleted"})
  else:
    return jsonify({"success": False, "message": "Unauthorized"}), 401
