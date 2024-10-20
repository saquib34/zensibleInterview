# IMDB Sentiment Analysis Project

## Overview

This project implements a sentiment analysis system for IMDB movie reviews using various machine learning and deep learning techniques. It includes a React frontend for user interaction and a Flask backend for processing and analyzing the reviews.

## This project deployed on zensible.saquib.in

## Features

- Sentiment analysis of IMDB movie reviews
- Multiple machine learning models:
  - Naive Bayes (Gaussian NB)
  - Random Forest
  - Logistic Regression
  - LSTM
  - Transformer
- Interactive web interface for real-time analysis
- Visualization of model accuracies and dataset distribution
- User feedback system for continuous improvement

## Technologies Used

- Frontend: React, Recharts, Lucide React
- Backend: Flask, NLTK, SpaCy, scikit-learn, TensorFlow/Keras
- Data Processing: Pandas, NumPy
- Machine Learning: scikit-learn, TensorFlow, Keras
- Natural Language Processing: NLTK, SpaCy

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.7+
- Git

### Frontend Setup

1. Clone the repository:
   ```
   git clone https://github.com/saquib34/zensibleInterview.git
   ```
2. Navigate to the project directory:
   ```
   cd zensibleInterview
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

### Backend Setup

1. Ensure you're in the project directory
2. Install required Python packages:
   ```
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```
   python app.py
   ```

## Usage

1. Open your web browser and navigate to `http://localhost:3000` (or the port specified by your React setup)
2. Enter an IMDB movie review in the text input
3. Click "Analyze" to see the sentiment analysis results
4. (Optional) Provide feedback on the analysis accuracy

## Project Structure

- `/src`: React frontend source code
- `/public`: Public assets for the frontend
- `/backend`: Flask backend code
- `/models`: Trained machine learning models
- `/data`: Dataset and data processing scripts
- `requirements.txt`: Python dependencies
- `package.json`: Node.js dependencies

## Dataset

This project uses the IMDB Dataset of 50K Movie Reviews, available on Kaggle:
[IMDB Dataset](https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews)

## Models and Performance

| Model               | Accuracy |
|---------------------|----------|
| Gaussian NB         | 0.7379   |
| Random Forest       | 0.7997   |
| Logistic Regression | 0.82     |
| LSTM                | 0.7424   |
| Transformer         | 0.5      |

## Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes.

## License

[MIT License](LICENSE)

## Contact

Developer: Saquib
GitHub: [saquib34](https://github.com/saquib34)

## Acknowledgments

- IMDB for providing the dataset
- Kaggle for hosting the dataset
- All open-source libraries and tools used in this project