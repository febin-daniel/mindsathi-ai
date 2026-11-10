import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

df = pd.read_csv("data/emotions.csv").dropna()
df = df[df["language"].isin(["ml", "ta", "en"])]
print("Rows used:", len(df))

for lang in ["ml", "ta", "en"]:
    d = df[df["language"] == lang]
    X_tr, X_te, y_tr, y_te = train_test_split(
        d["text"], d["emotion"], test_size=0.25,
        stratify=d["emotion"], random_state=42)
    m = make_pipeline(
        TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True),
        LogisticRegression(max_iter=2000, class_weight="balanced"))
    m.fit(X_tr, y_tr)
    print(lang, "test sentences:", len(y_te),
          "accuracy:", round(accuracy_score(y_te, m.predict(X_te)), 3))