import secrets
from string import ascii_letters, digits
from flask import request
from models import Session


def generate_token(length=10):
  chars = ascii_letters + digits
  return ''.join(secrets.choice(chars) for _ in range(length))


def validate_session():
  session_id = request.args.get("sessionId")
  token = request.args.get("token")

  session = Session.query.filter_by(id=session_id).first()
  if session and session.token == token:
    return session
  return None
