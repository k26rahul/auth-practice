from flask import Flask, render_template, request
from sqlalchemy import Column, String, Integer
from flask_sqlalchemy import SQLAlchemy
import secrets
import string

db = SQLAlchemy()


class User(db.Model):
  __tablename__ = "users"
  id = Column(Integer, primary_key=True, autoincrement=True)
  name = Column(String)
  email = Column(String, unique=True)
  password = Column(String)


class Session(db.Model):
  __tablename__ = "sessions"
  id = Column(Integer, primary_key=True, autoincrement=True)
  token = Column(String)
  user_id = Column(Integer)


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"

db.init_app(app)
with app.app_context():
  db.create_all()
  if User.query.count() == 0:
    db.session.add(User(
        name="rahul",
        email="rahul@example.com",
        password="12345"
    ))
    db.session.add(User(
        name="vidu",
        email="vidu@example.com",
        password="12345"
    ))
    db.session.commit()


@app.route("/")
def index():
  return render_template("index.html")


@app.route("/launch-missile")
def launch_missile():
  session_id = request.args.get("session_id")
  token = request.args.get("token")

  session = Session.query.filter_by(id=session_id).first()
  if session and session.token == token:
    user = User.query.filter_by(id=session.user_id).first()
    return f"missile is launched by {user.name} 💀\n"
  else:
    return f'you are not allowed to launch 👎\n'


@app.route("/auth/login", methods=["POST"])
def login():
  email = request.json.get("email")
  password = request.json.get("password")

  user = User.query.filter_by(email=email).first()
  if user and user.password == password:
    token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
    session = Session(token=token, user_id=user.id)
    db.session.add(session)
    db.session.commit()

    return f"ok, logged in [{session.id=}, {token=}, {user.id=}] ✅\n"
  else:
    return "email or password incorrect 🤷‍♂️\n"


app.run(debug=True)
