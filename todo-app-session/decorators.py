from functools import wraps
from flask import request, jsonify
from helpers import validate_session


def require_session(fn):
  """
  require_session is a decorator factory.

  It takes a function and returns a decorator that
  wraps the original route function with session
  validation logic.
  """
  @wraps(fn)
  def wrapper(*args, **kwargs):
    """
    wrapper is the actual decorator.

    It receives the original function, performs
    authentication before execution, and then
    calls the original function with the
    authenticated user injected as an argument.
    """
    ok, user = validate_session(
        request.args.get("session_id"),
        request.args.get("token")
    )

    if not ok:
      return jsonify({
          "success": False,
          "message": "Unauthorized"
      })

    return fn(user, *args, **kwargs)

  return wrapper
