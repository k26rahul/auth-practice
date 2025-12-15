from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey

db = SQLAlchemy()


class User(db.Model):
  __tablename__ = "users"
  id = Column(Integer, primary_key=True)
  name = Column(String)
  email = Column(String, unique=True)
  password = Column(String)


class Session(db.Model):
  __tablename__ = "sessions"
  id = Column(Integer, primary_key=True)
  token = Column(String)
  user_id = Column(Integer, ForeignKey("users.id"))


class Todo(db.Model):
  __tablename__ = "todos"
  id = Column(Integer, primary_key=True)
  text = Column(String)
  is_done = Column(Boolean, default=False)
  is_starred = Column(Boolean, default=False)
  user_id = Column(Integer, ForeignKey("users.id"))
