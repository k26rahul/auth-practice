from flask import Flask
from models import db
from populate_db import populate_db
from routes import routes

app = Flask(__name__)
app.register_blueprint(routes)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
db.init_app(app)

with app.app_context():
  db.create_all()
  populate_db()

app.run(debug=True)
