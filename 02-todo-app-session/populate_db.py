from models import db, User, Todo
from werkzeug.security import generate_password_hash


def populate_db():
  if User.query.count() > 0:
    return

  user1 = User(
      name="rahul",
      email="rahul@example.com",
      password=generate_password_hash("12345")
  )

  user2 = User(
      name="vidu",
      email="vidu@example.com",
      password=generate_password_hash("12345")
  )

  db.session.add_all([user1, user2])
  db.session.commit()

  todos = [
      Todo(text="Learn Flask", user_id=user1.id, is_done=True),
      Todo(text="Build ToDo App", user_id=user1.id, is_done=True),
      Todo(text="Read API design", user_id=user1.id, is_starred=True),
      Todo(text="Practice SQLAlchemy", user_id=user1.id),
      Todo(text="Write clean code", user_id=user1.id),
  ]

  db.session.add_all(todos)
  db.session.commit()
