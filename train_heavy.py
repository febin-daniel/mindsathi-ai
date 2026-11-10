import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from embedder import SentenceEmbedder


def train(csv="data/emotions.csv", out="model/emotion.joblib"):
    df = pd.read_csv(csv).dropna()

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["emotion"],
        test_size=0.25, stratify=df["emotion"], random_state=42)

    model = make_pipeline(
        SentenceEmbedder(),
        LogisticRegression(max_iter=2000, class_weight="balanced"))
    model.fit(X_train, y_train)

    pred = model.predict(X_test)
    print(classification_report(y_test, pred, zero_division=0))
    accuracy = accuracy_score(y_test, pred)

    joblib.dump(model, out)
    return {"samples": len(df), "accuracy": round(float(accuracy), 3)}


if __name__ == "__main__":
    print(train())