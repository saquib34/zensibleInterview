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

app = Flask(__name__)
CORS(app)

# Download necessary NLTK data
nltk.download('wordnet')
nltk.download('omw-1.4')

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Load SpaCy model
nlp = spacy.load("en_core_web_sm", disable=["parser", "ner", "tagger", "attribute_ruler"])

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
    return re.sub('[^a-zA-Z0-9\s]', '', text)

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
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128).to(device)
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
    
    # Get embeddings
    embeddings = get_embeddings(processed_text)
    
    # Perform TextBlob sentiment analysis (for backend use only)
    textblob_analysis = TextBlob(processed_text)
    if textblob_analysis.sentiment.polarity > 0:
        textblob_sentiment = "Positive"
    elif textblob_analysis.sentiment.polarity < 0:
        textblob_sentiment = "Negative"
    else:
        textblob_sentiment = "Neutral"
    textblob_confidence = abs(textblob_analysis.sentiment.polarity)
    
    # Perform logistic regression sentiment analysis
    logistic_prediction = logistic_model.predict([embeddings])[0]
    logistic_probabilities = logistic_model.predict_proba([embeddings])[0]
    logistic_sentiment = "Positive" if logistic_prediction == 1 else "Negative"
    logistic_confidence = logistic_probabilities[1] if logistic_prediction == 1 else logistic_probabilities[0]
    
    # Store TextBlob results in the database or log them as needed
    
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
    
    conn = sqlite3.connect('feedback.db')
    c = conn.cursor()
    c.execute('''INSERT INTO feedback (tweet, processed_tweet, textblob_sentiment, logistic_sentiment, user_mood, is_correct, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?)''',
              (tweet, processed_tweet, textblob_sentiment, logistic_sentiment, user_mood, is_correct, datetime.now()))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Feedback saved successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)