# Restaurant Analytics - Python Intelligence Service

Data Science engine dedicated to **Sentiment Analysis** and high-level gastronomic metric calculation.

---

## 🔬 Intelligence Pipeline

The service implements an end-to-end analytical pipeline:

1.  **ETL Layer**: Extracts raw review data from Supabase using **SQLAlchemy** and **Pandas**.
2.  **Preprocessing**: Custom NLP normalization (Unicode NFD, Stopword removal, special character stripping).
3.  **ML Inference**:
    -   **Model**: Logistic Regression.
    -   **Vectorization**: TF-IDF (Term Frequency-Inverse Document Frequency) to highlight emotional keywords.
    -   **Classification**: Positive, Neutral, or Negative sentiments.
4.  **IGE Calculation**: Implements the *Index of Gastronomic Experience* weighted algorithm.

---

## 📈 The IGE Metric

Our unique Index of Gastronomic Experience (IGE) is calculated as follows:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Food**  | 50%    | Taste, temperature, and presentation. |
| **Service**| 30%    | Wait time, staff kindness, and attention. |
| **Price** | 20%    | Value for money perception. |

---

## 🛠️ Setup & Execution

### Prerequisites
- Python 3.12+
- Virtual Environment (recommended)

### Installation
1.  **Create venv**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
    ```
2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Environment**: 
    Ensure `.env` contains the `DATABASE_URL`.

### Running manually
To test the pipeline independently of the Node backend:
```bash
python sentiment_model.py
```

---

## 📁 Repository Structure

-   `sentiment_model.py`: Main entry point and ML pipeline definition.
-   `etl.py`: Data extraction logic from PostgreSQL.
-   `config.py`: Environment and SQLAlchemy configuration.
-   `simulate.py`: Utility to generate synthetic data for testing.

---

## 📡 Node.js Integration
This module is designed to be invoked as a child process. It returns execution metrics (accuracy, F1-score, and IGE averages) via a standardized JSON `stdout` contract.
