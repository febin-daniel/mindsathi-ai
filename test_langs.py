import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

df = pd.read_csv("data/emotions.csv").dropna()
_, test = train_test_split(df, test_size=0.25, stratify=df["emotion"], random_state=42)
m = joblib.load("model/emotion.joblib")
test = test.copy()
test["pred"] = m.predict(test["text"])
for lang, g in test.groupby("language"):
    print(lang, "sentences:", len(g), "accuracy:", round(accuracy_score(g["emotion"], g["pred"]), 3))