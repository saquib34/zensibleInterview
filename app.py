from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import sqlite3
from datetime import datetime
import re
import spacy
import torch
from transformers import GPT2Tokenizer, GPT2Model
from nltk.stem import WordNetLemmatizer
import nltk
import joblib
import os
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download necessary NLTK data
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Load SpaCy model
print("Loading SpaCy model...")
nlp = spacy.load("en_core_web_sm", disable=["parser", "ner", "tagger", "attribute_ruler"])
print("Model loaded successfully.")

# Initialize GPT-2 model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_name = "gpt2"
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
gpt2_model = GPT2Model.from_pretrained(model_name).to(device)
gpt2_model.eval()

# Load logistic regression model
model_filename = 'logistic_regression_model.joblib'
logistic_model = joblib.load(model_filename)

# Text preprocessing functions
def remove_tags(text):
    return re.sub('<[^<]+?>', '', text)

def remove_special_characters(text):
    return re.sub(r'[^a-zA-Z0-9\s]', '', text)

def remove_extra_spaces(text):
    return re.sub(' +', ' ', text)

def remove_urls(text):
    return re.sub(r'http\S+|www\S+', '', text)

def to_lower(text):
    return text.lower()

def remove_punctuation(text):
    return re.sub(r'[^\w\s]', '', text)

def lemmatize(text):
    return ' '.join([lemmatizer.lemmatize(word) for word in text.split()])

def lemmatize_spacy(text):
    doc = nlp(text)
    return " ".join([token.lemma_ for token in doc])

def get_embeddings(text):
    if not text.strip():
        logger.warning("Empty input provided to get_embeddings")
        return None
    
    logger.info(f"Generating embeddings for text: {text[:50]}...")
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128).to(device)
    
    if inputs['input_ids'].numel() == 0:
        logger.warning("Tokenization resulted in empty input")
        return None
    
    with torch.no_grad():
        outputs = gpt2_model(**inputs)
    last_hidden_state = outputs.last_hidden_state
    embeddings = torch.mean(last_hidden_state, dim=1)
    return embeddings.cpu().numpy().flatten()

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('feedback.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS feedback
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  tweet TEXT,
                  processed_tweet TEXT,
                  textblob_sentiment TEXT,
                  logistic_sentiment TEXT,
                  user_mood TEXT,
                  is_correct BOOLEAN,
                  timestamp DATETIME)''')
    conn.commit()
    conn.close()

init_db()

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.json
    tweet_text = data.get('tweet', '')
    
    logger.info(f"Received tweet: {tweet_text}")
    
    if not tweet_text.strip():
        logger.warning("Empty input provided")
        return jsonify({
            'error': 'Empty input provided',
            'logistic_sentiment': 'Unknown',
            'logistic_confidence': 0,
            'processed_text': '',
        }), 400
    
    # Apply text preprocessing steps
    processed_text = tweet_text
    processed_text = remove_tags(processed_text)
    processed_text = remove_special_characters(processed_text)
    processed_text = remove_extra_spaces(processed_text)
    processed_text = remove_urls(processed_text)
    processed_text = to_lower(processed_text)
    processed_text = remove_punctuation(processed_text)
    processed_text = lemmatize(processed_text)
    processed_text = lemmatize_spacy(processed_text)
    
    logger.info(f"Processed text: {processed_text}")
    
    # Get embeddings
    embeddings = get_embeddings(processed_text)
    
    if embeddings is None:
        logger.error("Failed to generate embeddings")
        return jsonify({
            'error': 'Failed to generate embeddings',
            'logistic_sentiment': 'Unknown',
            'logistic_confidence': 0,
            'processed_text': processed_text,
        }), 500
    
    # Perform logistic regression sentiment analysis
    try:
        logistic_prediction = logistic_model.predict([embeddings])[0]
        logistic_probabilities = logistic_model.predict_proba([embeddings])[0]
        logistic_sentiment = "Positive" if logistic_prediction == 1 else "Negative"
        logistic_confidence = logistic_probabilities[1] if logistic_prediction == 1 else logistic_probabilities[0]
    except Exception as e:
        logger.error(f"Error in logistic regression prediction: {str(e)}")
        return jsonify({
            'error': 'Error in sentiment prediction',
            'logistic_sentiment': 'Unknown',
            'logistic_confidence': 0,
            'processed_text': processed_text,
        }), 500
    
    return jsonify({
        'logistic_sentiment': logistic_sentiment,
        'logistic_confidence': round(logistic_confidence, 2),
        'processed_text': processed_text,
    })

@app.route('/feedback', methods=['POST'])
def save_feedback():
    data = request.json
    tweet = data.get('tweet')
    processed_tweet = data.get('processed_tweet')
    logistic_sentiment = data.get('logistic_sentiment')
    user_mood = data.get('user_mood')
    is_correct = data.get('is_correct')
    
    # Perform TextBlob analysis again for storing in the database
    textblob_analysis = TextBlob(processed_tweet)
    if textblob_analysis.sentiment.polarity > 0:
        textblob_sentiment = "Positive"
    elif textblob_analysis.sentiment.polarity < 0:
        textblob_sentiment = "Negative"
    else:
        textblob_sentiment = "Neutral"
    
    try:
        conn = sqlite3.connect('feedback.db')
        c = conn.cursor()
        c.execute('''INSERT INTO feedback (tweet, processed_tweet, textblob_sentiment, logistic_sentiment, user_mood, is_correct, timestamp)
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                  (tweet, processed_tweet, textblob_sentiment, logistic_sentiment, user_mood, is_correct, datetime.now()))
        conn.commit()
        conn.close()
        logger.info("Feedback saved successfully")
        return jsonify({"message": "Feedback saved successfully"}), 200
    except Exception as e:
        logger.error(f"Error saving feedback: {str(e)}")
        return jsonify({"error": "Failed to save feedback"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)