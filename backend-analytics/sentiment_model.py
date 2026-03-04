import logging
import pandas as pd
import numpy as np
from typing import List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sqlalchemy import text, Engine
from etl import get_engine, extract_reviews

# Configure logging
logger = logging.getLogger("Sentiment_Service")

# Synthetic training data for the cold-start problem (Best practice: should be in a separate CSV or file)
TRAINING_DATA: List[Tuple[str, str]] = [
    ("Excelente servicio y comida deliciosa", "positive"),
    ("El asado estaba espectacular", "positive"),
    ("Muy recomendado", "positive"),
    ("Perfecto para estudiar con un café latte", "positive"),
    ("La comida llegó fría y el mesero fue grosero", "negative"),
    ("Pésimo lugar, no vuelvo", "negative"),
    ("Servicio muy lento hoy", "negative"),
    ("Todo muy caro para lo que ofrecen", "negative"),
    ("Está bien, nada del otro mundo", "neutral"),
    ("Comida promedio, precio normal", "neutral"),
    ("Cumple su función pero le falta sabor", "neutral"),
]

def train_model() -> Pipeline:
    """Train a simple TF-IDF + Logistic Regression pipeline."""
    logger.info("Training sentiment model dynamically...")
    df_train = pd.DataFrame(TRAINING_DATA, columns=['text', 'sentiment'])
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
        ('clf', LogisticRegression(random_state=42))
    ])
    
    # Train the pipeline
    pipeline.fit(df_train['text'], df_train['sentiment'])
    return pipeline

def save_predictions_to_db(df_reviews: pd.DataFrame, model: Pipeline, engine: Engine) -> None:
    """Predict sentiments and persist to the sentiment_results table."""
    if df_reviews.empty:
        logger.warning("No reviews found to analyze.")
        return

    # ML Inference
    comments = df_reviews['comment'].fillna("")
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
        model = train_model()
        engine = get_engine()
        save_predictions_to_db(df_reviews, model, engine)
        logger.info("Pipeline executed successfully.")
    except Exception as e:
        logger.critical("Pipeline execution crashed: %s", e)

if __name__ == "__main__":
    run_pipeline()
