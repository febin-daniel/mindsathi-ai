from sentence_transformers import SentenceTransformer
from sklearn.base import BaseEstimator, TransformerMixin


class SentenceEmbedder(BaseEstimator, TransformerMixin):
    def __init__(self, model_name="paraphrase-multilingual-MiniLM-L12-v2"):
        self.model_name = model_name

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if getattr(self, "_model", None) is None:
            self._model = SentenceTransformer(self.model_name)
        return self._model.encode(list(X), show_progress_bar=False)

    def __getstate__(self):
        state = self.__dict__.copy()
        state.pop("_model", None)
        return state