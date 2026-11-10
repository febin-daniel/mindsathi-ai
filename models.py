from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Sample(db.Model):
    """One labelled sentence used to train the emotion model."""
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    emotion = db.Column(db.String(20), nullable=False)
    language = db.Column(db.String(5), default="en")
    created = db.Column(db.DateTime, default=datetime.utcnow)