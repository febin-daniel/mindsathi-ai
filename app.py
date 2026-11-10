from flask import (Flask, render_template, jsonify, request,
                   session, redirect, url_for)
from models import db
from functools import wraps
import os
import csv
import joblib
import pandas as pd
import train

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-me")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "12345")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mindsathi.db"
db.init_app(app)

with app.app_context():
    db.create_all()

model = joblib.load("model/emotion.joblib")

# Safety check runs BEFORE the model. Add more words later.
CRISIS_WORDS = ["suicide", "kill myself", "end my life", "want to die", "ആത്മഹത്യ"]

EMOTIONS = ["sad", "anxious", "angry", "happy", "stressed", "neutral"]


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return wrapper


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/health")
def health():
    return jsonify(status="ok", message="MindSathi Python backend is running")


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify(error="text is required"), 400
    if any(w in text.lower() for w in CRISIS_WORDS):
        return jsonify(emotion="crisis", confidence=1.0, show_emergency=True)
    probs = model.predict_proba([text])[0]
    i = probs.argmax()
    return jsonify(emotion=str(model.classes_[i]),
                   confidence=round(float(probs[i]), 3),
                   show_emergency=False)


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    error = None
    if request.method == "POST":
        if request.form.get("password") == ADMIN_PASSWORD:
            session["is_admin"] = True
            return redirect(url_for("admin"))
        error = "Wrong password"
    return render_template("login.html", error=error)


@app.route("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


@app.route("/admin")
@admin_required
def admin():
    df = pd.read_csv("data/emotions.csv").dropna()
    counts = df["emotion"].value_counts().to_dict()
    recent = df.tail(10).values.tolist()
    return render_template("admin.html", counts=counts,
                           total=len(df), recent=recent)


def append_rows(rows):
    with open("data/emotions.csv", "rb") as f:
        f.seek(-1, 2)
        needs_newline = f.read(1) != b"\n"
    with open("data/emotions.csv", "a", newline="", encoding="utf-8") as f:
        if needs_newline:
            f.write("\n")
        csv.writer(f).writerows(rows)


@app.route("/admin/add", methods=["POST"])
@admin_required
def admin_add():
    text = request.form.get("text", "").strip().replace(",", " ")
    emotion = request.form.get("emotion", "")
    language = request.form.get("language", "en")
    if text and emotion in EMOTIONS:
        append_rows([[text, emotion, language]])
    return redirect(url_for("admin"))


@app.route("/admin/bulk", methods=["POST"])
@admin_required
def admin_bulk():
    emotion = request.form.get("emotion", "")
    language = request.form.get("language", "en")
    lines = request.form.get("lines", "").splitlines()
    if emotion in EMOTIONS:
        rows = [[l.strip().replace(",", " "), emotion, language]
                for l in lines if l.strip()]
        append_rows(rows)
    return redirect(url_for("admin"))


@app.route("/admin/retrain", methods=["POST"])
@admin_required
def admin_retrain():
    global model
    result = train.train()
    model = joblib.load("model/emotion.joblib")
    return jsonify(result)

from replies import REPLIES, TOOLS, CRISIS_EXTRA


def is_crisis_text(text):
    t = text.lower()
    return any(w in t for w in CRISIS_WORDS) or any(w in t for w in CRISIS_EXTRA)


@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(silent=True) or {}
    lang = data.get("language", "en")
    if lang not in REPLIES:
        lang = "en"
    text = ""
    for m in reversed(data.get("messages", [])):
        if m.get("role") == "user":
            text = str(m.get("text", ""))
            break
    if is_crisis_text(text):
        return jsonify({"reply": REPLIES[lang]["crisis"], "emotion": "neutral",
                        "confidence": 0, "crisis": True, "tool": None})
    probs = model.predict_proba([text])[0]
    best = int(probs.argmax())
    emotion = str(model.classes_[best])
    return jsonify({"reply": REPLIES[lang].get(emotion, REPLIES[lang]["neutral"]),
                    "emotion": emotion,
                    "confidence": round(float(probs[best]) * 100),
                    "crisis": False,
                    "tool": TOOLS.get(emotion)})


if __name__ == "__main__":
    app.run(debug=True)