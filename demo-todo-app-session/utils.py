import secrets
from string import ascii_letters, digits


def generate_token(length=10):
  chars = ascii_letters + digits
  return ''.join(secrets.choice(chars) for _ in range(length))
