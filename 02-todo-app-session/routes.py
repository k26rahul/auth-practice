from flask import Blueprint, request, jsonify, render_template
from models import db, User, Session, Todo
from helpers import generate_token, validate_session
from decorators import require_session
from werkzeug.security import check_password_hash

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
    session = Session(token=generate_token(), user_id=user.id)
    db.session.add(session)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Logged in as {user.name}",
        "payload": {
            "sessionId": session.id,
            "token": session.token,
            "userId": user.id
        }
    })

  return jsonify({
      "success": False,
      "message": "Email or password incorrect"
  })


@routes.route("/todo/create")
def create_todo():
  """
  This route intentionally uses inline session validation
  (instead of the @require_session decorator) to explicitly
  demonstrate the non-decorator authentication approach
  for learning and comparison purposes.
  """
  ok, user = validate_session(
      request.args.get("sessionId"),
      request.args.get("token")
  )

  if not ok:
    return jsonify({"success": False, "message": "Unauthorized"})

  text = request.args.get("text")
  todo = Todo(text=text, user_id=user.id)
  db.session.add(todo)
  db.session.commit()

  return jsonify({"success": True, "message": "Todo created"})


@routes.route("/todo/list")
@require_session
def list_todos(user):
  todos = Todo.query.filter_by(user_id=user.id).all()

  payload = [
      {
          "id": todo.id,
          "text": todo.text,
          "isDone": todo.is_done,
          "isStarred": todo.is_starred
      }
      for todo in todos
  ]

  return jsonify({
      "success": True,
      "message": "Todos fetched",
      "payload": payload
  })


@routes.route("/todo/update")
@require_session
def update_todo(user):
  todo_id = request.args.get("todoId")
  action = request.args.get("action")

  todo = Todo.query.filter_by(id=todo_id, user_id=user.id).first()
  if not todo:
    return jsonify({"success": False, "message": "Todo not found"})

  if action == "markDone":
    todo.is_done = not todo.is_done
  elif action == "markStarred":
    todo.is_starred = not todo.is_starred

  db.session.commit()
  return jsonify({"success": True, "message": "Todo updated"})


@routes.route("/todo/delete")
@require_session
def delete_todo(user):
  todo_id = request.args.get("todoId")

  todo = Todo.query.filter_by(id=todo_id, user_id=user.id).first()
  if not todo:
    return jsonify({"success": False, "message": "Todo not found"})

  db.session.delete(todo)
  db.session.commit()

  return jsonify({"success": True, "message": "Todo deleted"})
