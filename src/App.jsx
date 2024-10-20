import React, { useState } from 'react';
import { Zap, Info, FileText, Grid, BarChart2, Cpu, Download, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const IMDBAnalysisDashboard = () => {
  const [IMDBText, setIMDBText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userMood, setUserMood] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const handleAnalyze = async () => {
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ IMDB: IMDBText }),
      });
      const data = await response.json();
      setAnalysis(data);
      
      setTimeout(() => {
        setShowFeedback(true);
      }, 5000);
    } catch (error) {
      console.error('Error analyzing IMDB:', error);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          IMDB: IMDBText,
          processed_IMDB: analysis.processed_text,
          logistic_sentiment: analysis.logistic_sentiment,
          user_mood: userMood,
          is_correct: isCorrect,
        }),
      });
      setShowFeedback(false);
      setUserMood('');
      setIsCorrect(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const accuracyData = [
    { name: 'Gaussian NB', accuracy: 0.7379 },
    { name: 'Random Forest', accuracy: 0.7997 },
    { name: 'Logistic Regression', accuracy: 0.82 },
    { name: 'LSTM', accuracy: 0.7424 },
    { name: 'Transformer', accuracy: 0.5 },
  ];

  const datasetData = [
    { name: 'Positive', value: 25000 },
    { name: 'Negative', value: 25000 },
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">IMDB Sentiment Analysis</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Zap className="mr-2 text-yellow-500 animate-pulse" />
          Analyze IMDB
        </h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={IMDBText}
            onChange={(e) => setIMDBText(e.target.value)}
            placeholder="Enter IMDB text..."
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleAnalyze}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors transform hover:scale-105"
          >
            Analyze
          </button>
        </div>
        {analysis && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Analysis Results:</h3>
            <div className="animate-fadeIn">
              <h4 className="font-semibold">Logistic Regression Analysis:</h4>
              <p>Sentiment: <span className="text-green-600">{analysis.logistic_sentiment}</span></p>
              <p>Confidence: <span className="text-purple-600">{analysis.logistic_confidence}</span></p>
            </div>
            <p className="font-semibold mt-2">Processed Text:</p>
            <p className="text-sm text-gray-600">{analysis.processed_text}</p>
          </div>
        )}
        {showFeedback && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md animate-slideIn">
            <h3 className="font-semibold mb-2">Please provide feedback:</h3>
            <div className="mb-2">
              <label className="block">What's your mood?</label>
              <input
                type="text"
                value={userMood}
                onChange={(e) => setUserMood(e.target.value)}
                className="p-1 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block">Was the analysis correct?</label>
              <div>
                <button
                  onClick={() => setIsCorrect(true)}
                  className={`mr-2 px-2 py-1 rounded ${isCorrect === true ? 'bg-green-500 text-white' : 'bg-gray-200'} transition-colors`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setIsCorrect(false)}
                  className={`px-2 py-1 rounded ${isCorrect === false ? 'bg-red-500 text-white' : 'bg-gray-200'} transition-colors`}
                >
                  No
                </button>
              </div>
            </div>
            <button
              onClick={handleFeedbackSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors transform hover:scale-105"
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Info className="mr-2 text-blue-500" />
            Project Details
          </h2>
          <div className="space-y-2">
            <p><strong>Developed By:</strong> Saquib</p>
            <p><strong>Dataset Used:</strong> IMDB Dataset of 50K Movie Reviews</p>
            <p><strong>Dataset Link:</strong> <a href="https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Kaggle - IMDB Dataset</a></p>
            <p><strong>IPython Notebook:</strong> <a href="/model.ipynb" download className="text-blue-600 hover:underline flex items-center"><Download size={16} className="mr-1" /> Download model.ipynb</a></p>
            <p><strong>Embedding Results:</strong> Saved as simple.csv</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PieChart className="mr-2 text-green-500" />
            Dataset Details
          </h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={datasetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {datasetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart2 className="mr-2 text-red-500" />
            Model Accuracy Comparison
          </h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2 text-purple-500" />
            Models Trained
          </h2>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li className="animate-bounce">Naive Bayes (Gaussian NB)</li>
            <li className="animate-bounce" style={{animationDelay: "0.1s"}}>Random Forest</li>
            <li className="animate-bounce" style={{animationDelay: "0.2s"}}>Logistic Regression</li>
            <li className="animate-bounce" style={{animationDelay: "0.3s"}}>LSTM</li>
            <li className="animate-bounce" style={{animationDelay: "0.4s"}}>Transformer</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Grid className="mr-2 text-indigo-500" />
            Preprocessing Steps
          </h2>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Remove HTML tags</li>
            <li>Remove special characters</li>
            <li>Remove extra spaces</li>
            <li>Remove URLs</li>
            <li>Convert to lowercase</li>
            <li>Remove punctuation</li>
            <li>Lemmatization (using NLTK and SpaCy)</li>
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Cpu className="mr-2 text-yellow-500" />
            Model Architecture and Embeddings
          </h2>
          <div className="space-y-2">
            <p><strong>Word Embeddings:</strong> We use pre-trained GloVe (Global Vectors for Word Representation) embeddings to convert words into dense vector representations.</p>
            <p><strong>Sentence Embeddings:</strong> For the Transformer model, we utilize BERT (Bidirectional Encoder Representations from Transformers) to generate contextual embeddings for entire sentences.</p>
            <p><strong>TF-IDF Vectorization:</strong> For traditional machine learning models (Naive Bayes, Random Forest, Logistic Regression), we employ TF-IDF (Term Frequency-Inverse Document Frequency) vectorization to convert text into numerical features.</p>
            <p><strong>LSTM:</strong> Our LSTM model consists of an embedding layer, followed by LSTM layers, and dense layers for classification. This architecture is particularly effective for capturing long-term dependencies in text.</p>
            <p><strong>Transformer:</strong> We implement a Transformer-based model inspired by BERT, which uses self-attention mechanisms to process input text. This model excels at understanding context and relationships between words.</p>
            <p><strong>Ensemble:</strong> We combine predictions from multiple models using a voting mechanism to improve overall accuracy and robustness of our sentiment analysis system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IMDBAnalysisDashboard;