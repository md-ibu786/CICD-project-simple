import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy  # type: ignore[reportMissingImports]

app = Flask(__name__)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/contactdb"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Database Model
class Submission(db.Model):

    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "message": self.message
        }


# Home route
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Flask backend is running successfully"
    })


# Submit form
@app.route("/submit", methods=["POST"])
def submit():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({
            "error": "All fields are required"
        }), 400

    if "@" not in email:
        return jsonify({
            "error": "Invalid email address"
        }), 400

    # Create database record
    submission = Submission(
        name=name,
        email=email,
        message=message
    )

    try:
        db.session.add(submission)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Thank you, {name}! Your submission was saved.",
            "data": submission.to_dict()
        }), 201

    except Exception as error:
        db.session.rollback()

        app.logger.exception("Database insertion failed")

        return jsonify({
            "error": "Unable to save submission"
        }), 500


# Retrieve all submissions
@app.route("/submissions", methods=["GET"])
def get_submissions():

    submissions = Submission.query.order_by(
        Submission.id.desc()
    ).all()

    return jsonify({
        "submissions": [
            submission.to_dict()
            for submission in submissions
        ]
    }), 200


# Initialize database tables
with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)