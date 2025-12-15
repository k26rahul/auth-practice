import secrets
import string
from models import Session, User


def generate_token(length=10):
  chars = string.ascii_letters + string.digits
  return ''.join(secrets.choice(chars) for _ in range(length))


def validate_session(session_id, token):
  session = Session.query.filter_by(id=session_id).first()
  if not session or session.token != token:
    return False, None

  user = User.query.filter_by(id=session.user_id).first()
  return True, user
