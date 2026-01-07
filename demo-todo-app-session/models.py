from sqlalchemy import Column, String, Integer, Boolean
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
  id = Column(Integer, primary_key=True, autoincrement=True)
  name = Column(String)
  email = Column(String)
  password = Column(String)


class Session(db.Model):
  id = Column(Integer, primary_key=True, autoincrement=True)
  token = Column(String)
  user_id = Column(Integer)


class Todo(db.Model):
  id = Column(Integer, primary_key=True, autoincrement=True)
  text = Column(String)
  is_done = Column(Boolean)
  is_starred = Column(Boolean)
  user_id = Column(Integer)
