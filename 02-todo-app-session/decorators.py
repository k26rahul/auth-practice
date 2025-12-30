from functools import wraps
from flask import request, jsonify
from helpers import validate_session


def require_session(fn):
    """
    require_session is a decorator.

    It takes the original route function as input
    and returns a wrapped version of that function
    with session validation logic added.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        """
        wrapper replaces the original route function.

        It is called instead of the original function.
        It performs authentication first and, if valid,
        then calls the original function with the
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
