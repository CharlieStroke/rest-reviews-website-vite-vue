from __future__ import annotations

import pandas as pd

from .value_objects import IGEWeights

# Minimum transformer confidence to trust the model's label without override.
_CONFIDENCE_THRESHOLD = 0.72

# IGE weighted score thresholds for label derivation.
_NEG_CEILING = 2.5   # weighted < this → negative
_POS_FLOOR   = 3.7   # weighted ≥ this → positive


class SentimentReconciler:
    """Combine transformer text-confidence with explicit star-rating signals.

    Two-layer override strategy:
      1. High confidence (≥ 0.72) → trust the model unconditionally.
      2. Low confidence → derive a label from the IGE-weighted star scores
         and apply two food-quality veto rules before finalising.
    """

    @staticmethod
    def reconcile(
        text_label: str,
        text_prob: float,
        food_score: float | None = None,
        service_score: float | None = None,
        price_score: float | None = None,
    ) -> tuple[str, float]:
        """Return the final (label, probability) for a review.

        Parameters
        ----------
        text_label:    Raw label from the transformer ("positive"/"negative"/"neutral").
        text_prob:     Confidence from the transformer (0–1).
        food_score:    Star rating 1-5 for food quality (most important signal).
        service_score: Star rating 1-5 for service.
        price_score:   Star rating 1-5 for price/value.

        Returns the original prediction unchanged when scores are absent or
        when the model is already confident.
        """
        # No scores provided — nothing to reconcile
        if food_score is None or service_score is None or price_score is None:
            return text_label, text_prob

        # Model is confident enough to trust as-is
        if text_prob >= _CONFIDENCE_THRESHOLD:
            return text_label, text_prob

        # ── Model is uncertain: derive label from weighted scores ──────────
        weighted = food_score * 0.5 + service_score * 0.3 + price_score * 0.2

        # Food veto 1: food ≤ 2 stars — experience was bad; cannot be "positive"
        if food_score <= 2 and text_label == "positive":
            override = "negative" if weighted < _NEG_CEILING else "neutral"
            return override, 0.6

        # Food veto 2: food == 3 stars (mediocre) + uncertain model calls it positive
        if food_score == 3 and text_label == "positive":
            return "neutral", 0.6

        # Derive score-based label
        if weighted < _NEG_CEILING:
            score_label = "negative"
        elif weighted < _POS_FLOOR:
            score_label = "neutral"
        else:
            score_label = "positive"

        # If model and scores agree, keep original probability
        if text_label == score_label:
            return text_label, text_prob

        # Disagree — prefer score-based label with a moderate synthetic confidence
        return score_label, 0.6


class IGECalculator:
    @staticmethod
    def calculate(
        food: float,
        service: float,
        price: float,
        weights: IGEWeights = IGEWeights(),
    ) -> float:
        """Return IGE score in the 0–100 range for a single review."""
        raw = (food * weights.food) + (service * weights.service) + (price * weights.price)
        return raw * weights.scale

    @staticmethod
    def calculate_global(
        reviews_df: pd.DataFrame,
        weights: IGEWeights = IGEWeights(),
    ) -> float:
        """Return the mean IGE score across all rows of *reviews_df*.

        The DataFrame must contain the columns: food_score, service_score, price_score.
        Returns 0.0 for an empty DataFrame.
        """
        if reviews_df.empty:
            return 0.0

        ige_series = (
            reviews_df["food_score"] * weights.food
            + reviews_df["service_score"] * weights.service
            + reviews_df["price_score"] * weights.price
        ) * weights.scale

        return float(ige_series.mean())
