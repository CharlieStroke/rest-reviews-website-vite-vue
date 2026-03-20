import logging
import json
import os
import pandas as pd
import numpy as np
from typing import List, Tuple, Optional
import re
import unicodedata
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, f1_score
from sqlalchemy import text, Engine
from etl import get_engine, extract_reviews

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "sentiment_pipeline.joblib")

# Configure logging
logger = logging.getLogger("Sentiment_Service")

def normalize_text(text: str) -> str:
    """Normalize text: lowercase, remove accents, and special characters."""
    if not isinstance(text, str):
        return ""
    # Normalize unicode (NFD) and filter out non-spacing marks (accents)
    text = "".join(
        c for c in unicodedata.normalize('NFD', text.lower())
        if unicodedata.category(c) != 'Mn'
    )
    # Remove special characters
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return text.strip()

# Synthetic training data for the cold-start problem
# Context: University campus food establishments (cafetería, snack bar, comedor, food truck)
TRAINING_DATA: List[Tuple[str, str]] = [
    # ── Positive (30 examples) ──
    ("Excelente servicio y comida deliciosa", "positive"),
    ("El asado estaba espectacular", "positive"),
    ("Muy recomendado", "positive"),
    ("Perfecto para estudiar con un café latte", "positive"),
    ("Increíble lugar, el Guajaquenito nunca falla", "positive"),
    ("La comida es de 10", "positive"),
    ("Muy buen ambiente y servicio", "positive"),
    ("Me encantó la experiencia", "positive"),
    ("Súper recomendado el postre", "positive"),
    ("Atención excelente y platos abundantes", "positive"),
    ("Calidad precio inmejorable", "positive"),
    ("De lo mejor que he probado en la zona", "positive"),
    ("Todo un éxito, volveremos sin duda", "positive"),
    ("El personal es súper amable", "positive"),
    ("Las tortas del food truck son las mejores del campus", "positive"),
    ("Siempre vengo entre clases, la comida corrida es riquísima", "positive"),
    ("El café de la cafetería principal me salva cada mañana", "positive"),
    ("Buenísimos los chilaquiles, porciones generosas", "positive"),
    ("La mejor opción para comer rápido y rico en la uni", "positive"),
    ("Me sorprendió la calidad del comedor ejecutivo", "positive"),
    ("Los precios son justos para la calidad que ofrecen", "positive"),
    ("Hoy probé el menú del día y quedé encantado", "positive"),
    ("La atención es rápida incluso en hora pico", "positive"),
    ("Variedad de opciones saludables, eso se agradece", "positive"),
    ("El agua de horchata está increíble", "positive"),
    ("Se nota la frescura de los ingredientes", "positive"),
    ("El lugar está siempre limpio y bien organizado", "positive"),
    ("Excelente relación calidad precio para estudiantes", "positive"),
    ("Los tacos del food truck son adictivos", "positive"),
    ("Muy buena opción vegetariana en el comedor", "positive"),

    # ── Negative (28 examples) ──
    ("La comida llegó fría y el mesero fue grosero", "negative"),
    ("Pésimo lugar, no vuelvo", "negative"),
    ("Servicio muy lento hoy", "negative"),
    ("Todo muy caro para lo que ofrecen", "negative"),
    ("No me gustó nada", "negative"),
    ("La carne estaba cruda", "negative"),
    ("Lugar sucio y ruidoso", "negative"),
    ("No vuelvo nunca más", "negative"),
    ("Mala experiencia desde que entramos", "negative"),
    ("El peor servicio que he recibido", "negative"),
    ("Comida insípida y mala atención", "negative"),
    ("Decepción total, no lo recomiendo", "negative"),
    ("Caro y malo", "negative"),
    ("La fila era enorme y tardaron media hora en atenderme", "negative"),
    ("Me cobraron de más y no quisieron corregirlo", "negative"),
    ("El refresco estaba caliente y sin gas", "negative"),
    ("Las porciones son muy pequeñas para el precio", "negative"),
    ("Encontré un cabello en mi comida, qué asco", "negative"),
    ("Siempre se les acaba todo antes de las 2pm", "negative"),
    ("El arroz estaba duro y los frijoles sin sabor", "negative"),
    ("Pésima higiene en la cocina, se ve desde afuera", "negative"),
    ("No tienen opciones para alérgicos, muy descuidado", "negative"),
    ("Pedí sin chile y me lo pusieron de todos modos", "negative"),
    ("La sopa del día sabía a agua con sal", "negative"),
    ("Muy mala actitud del personal hoy", "negative"),
    ("El food truck siempre tiene los mismos platillos aburridos", "negative"),
    ("Me enfermé del estómago después de comer ahí", "negative"),
    ("Horrible experiencia, tardaron 40 minutos para un sandwich", "negative"),

    # ── Neutral (27 examples) ──
    ("Está bien, nada del otro mundo", "neutral"),
    ("Comida promedio, precio normal", "neutral"),
    ("Cumple su función pero le falta sabor", "neutral"),
    ("Es aceptable", "neutral"),
    ("Ni bueno ni malo", "neutral"),
    ("Un lugar más del montón", "neutral"),
    ("Normalito", "neutral"),
    ("Está bien para salir del paso", "neutral"),
    ("Precios estándar", "neutral"),
    ("Local pequeño y concurrido", "neutral"),
    ("La comida es normal, nada especial", "neutral"),
    ("No está mal pero tampoco destaca", "neutral"),
    ("El menú es limitado pero cumple", "neutral"),
    ("Viene bien cuando no tienes tiempo de salir del campus", "neutral"),
    ("A veces está bueno a veces no tanto", "neutral"),
    ("Los precios son los esperados para una cafetería universitaria", "neutral"),
    ("El lugar es pequeño pero funcional", "neutral"),
    ("Comida casera básica sin nada extraordinario", "neutral"),
    ("Regular, hay días mejores que otros", "neutral"),
    ("No me quejo pero tampoco repito seguido", "neutral"),
    ("El servicio es correcto sin más", "neutral"),
    ("Tienen pocas opciones pero están bien", "neutral"),
    ("Es lo que hay en el campus, cumple su objetivo", "neutral"),
    ("La comida está tibia pero pasable", "neutral"),
    ("Normal para un comedor universitario", "neutral"),
    ("Nada destacable pero tampoco malo", "neutral"),
    ("Está decente para el precio que manejan", "neutral"),
]

def save_model(pipeline: Pipeline) -> str:
    """Save the trained pipeline to disk using joblib."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    logger.info("Model saved to %s", MODEL_PATH)
    return MODEL_PATH


def load_model() -> Optional[Pipeline]:
    """Load a previously saved pipeline from disk. Returns None if not found."""
    if os.path.exists(MODEL_PATH):
        logger.info("Loading cached model from %s", MODEL_PATH)
        return joblib.load(MODEL_PATH)
    return None


def evaluate_model() -> dict:
    """Evaluate the model using train/test split and cross-validation.

    Returns a dict with accuracy, f1_score (weighted), and cv_accuracy_mean.
    """
    df = pd.DataFrame(TRAINING_DATA, columns=['text', 'sentiment'])
    df['text'] = df['text'].apply(normalize_text)

    SPANISH_STOP_WORDS = [
        'un', 'una', 'unas', 'unos', 'el', 'la', 'los', 'las', 'de', 'del',
        'y', 'o', 'en', 'para', 'con', 'por', 'a', 'al', 'que', 'es'
    ]

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2), stop_words=SPANISH_STOP_WORDS)),
        ('clf', LogisticRegression(random_state=42, class_weight='balanced'))
    ])

    # Train/test split evaluation
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['sentiment'], test_size=0.2, random_state=42, stratify=df['sentiment']
    )
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')

    # Cross-validation (5-fold, or fewer if dataset is small)
    n_folds = min(5, df['sentiment'].value_counts().min())
    cv_scores = cross_val_score(pipeline, df['text'], df['sentiment'], cv=n_folds, scoring='accuracy')

    metrics = {
        "accuracy": round(float(acc), 4),
        "f1Score": round(float(f1), 4),
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "cv_accuracy_std": round(float(cv_scores.std()), 4),
    }
    logger.info("Evaluation metrics: %s", metrics)
    return metrics


def train_model(force_retrain: bool = False) -> Pipeline:
    """Train a TF-IDF + Logistic Regression pipeline, or load from cache."""
    if not force_retrain:
        cached = load_model()
        if cached is not None:
            logger.info("Using cached model from disk.")
            return cached

    logger.info("Training sentiment model with %d examples...", len(TRAINING_DATA))
    df_train = pd.DataFrame(TRAINING_DATA, columns=['text', 'sentiment'])

    # Pre-normalize training data
    df_train['text'] = df_train['text'].apply(normalize_text)

    # Basic Spanish stop words
    SPANISH_STOP_WORDS = [
        'un', 'una', 'unas', 'unos', 'el', 'la', 'los', 'las', 'de', 'del',
        'y', 'o', 'en', 'para', 'con', 'por', 'a', 'al', 'que', 'es'
    ]

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2), stop_words=SPANISH_STOP_WORDS)),
        ('clf', LogisticRegression(random_state=42, class_weight='balanced'))
    ])

    # Train on full dataset and save
    pipeline.fit(df_train['text'], df_train['sentiment'])
    save_model(pipeline)
    return pipeline

def save_predictions_to_db(df_reviews: pd.DataFrame, model: Pipeline, engine: Engine) -> None:
    """Predict sentiments and persist to the sentiment_results table."""
    if df_reviews.empty:
        logger.warning("No reviews found to analyze.")
        return

    # ML Inference with normalization
    comments = df_reviews['comment'].fillna("").apply(normalize_text)
    predictions = model.predict(comments)
    probabilities = np.max(model.predict_proba(comments), axis=1)

    try:
        with engine.begin() as conn:
            # Check for model version v1.0.0
            result = conn.execute(text("SELECT id FROM model_versions WHERE version = 'v1.0.0' LIMIT 1")).fetchone()
            
            if result:
                model_version_id = result[0]
            else:
                logger.info("Initializing model_version v1.0.0 in database...")
                res = conn.execute(text("""
                    INSERT INTO model_versions (version, dataset_size, trained_at)
                    VALUES ('v1.0.0', :dataset_size, NOW())
                    RETURNING id
                """), {"dataset_size": len(TRAINING_DATA)})
                model_version_id = res.scalar()
                
            logger.info("Using Model Version ID: %s", model_version_id)

            inserted_count = 0
            for i, row in df_reviews.iterrows():
                review_id = row['id']
                pred_label = str(predictions[i])
                prob = float(probabilities[i])
                
                # Cleanup old results for this review
                conn.execute(text("DELETE FROM sentiment_results WHERE review_id = :review_id"), {"review_id": review_id})
                
                # Insert results with correct type casting for 'sentiment_label'
                conn.execute(text("""
                    INSERT INTO sentiment_results (review_id, model_version_id, predicted_label, probability)
                    VALUES (:review_id, :modelVersionId, CAST(:label AS sentiment_label), :prob)
                """), {
                    "review_id": review_id,
                    "modelVersionId": model_version_id,
                    "label": pred_label,
                    "prob": prob
                })
                inserted_count += 1
                
            logger.info("Successfully persisted %d sentiment results.", inserted_count)
            
    except Exception as e:
        logger.error("Database persistence failed: %s", e)
        raise

def run_pipeline() -> None:
    """Executes the complete End-to-End Analytical Pipeline."""
    logger.info("Starting End-to-End Sentiment Analysis Pipeline")
    try:
        df_reviews = extract_reviews()
        if df_reviews.empty:
            print(json.dumps({"accuracy": 0, "f1Score": 0, "sentiment_label": "neutral", "ige_global": 0}))
            return

        # Calculate IGE: 50% food, 30% service, 20% price (Scaled to 100)
        df_reviews['ige'] = (df_reviews['food_score']*0.5 + df_reviews['service_score']*0.3 + df_reviews['price_score']*0.2) * 20
        ige_global = float(df_reviews['ige'].mean())

        # Evaluate model with train/test split and cross-validation
        eval_metrics = evaluate_model()

        model = train_model()
        engine = get_engine()
        save_predictions_to_db(df_reviews, model, engine)

        # Determine overall sentiment from predictions
        comments = df_reviews['comment'].fillna("").apply(normalize_text)
        predictions = model.predict(comments)
        sentiment_counts = pd.Series(predictions).value_counts()
        sentiment_label = str(sentiment_counts.index[0])

        # Output metrics matching the JSON contract for Node integration
        metrics = {
            "accuracy": eval_metrics["accuracy"],
            "f1Score": eval_metrics["f1Score"],
            "sentiment_label": sentiment_label,
            "ige_global": round(ige_global, 2),
        }
        print(json.dumps(metrics))
        logger.info("Pipeline executed successfully.")
    except Exception as e:
        logger.critical("Pipeline execution crashed: %s", e)
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    run_pipeline()
