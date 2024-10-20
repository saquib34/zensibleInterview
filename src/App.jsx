import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Info, FileText, Grid, BarChart2, Cpu, Download, PieChart, Code, Terminal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts';

const IMDBAnalysisDashboard = () => {
  console.log("IMDBAnalysisDashboard rendering started");

  const [IMDBText, setIMDBText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userMood, setUserMood] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [animateChart, setAnimateChart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const Surl = 'http://13.233.91.141:5000' || 'http://127.0.0.1:5000';
  useEffect(() => {
    console.log("Initial effect running");
    setTimeout(() => setAnimateChart(true), 500);
  }, []);

  const handleAnalyze = async () => {
    console.log("handleAnalyze called");
    if (IMDBText.trim().length < 10) {
      setError("Please enter a longer review (at least 10 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${Surl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ IMDB: IMDBText }),
      });
      const data = await response.json();
      if (response.ok) {
        setAnalysis(data);
        setTimeout(() => {
          setShowFeedback(true);
        }, 5000);
      } else {
        setError(data.error || "An error occurred while analyzing the text.");
      }
    } catch (error) {
      console.error('Error analyzing IMDB:', error);
      setError("An error occurred while connecting to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    console.log("handleFeedbackSubmit called");
    try {
      const response = await fetch(`${Surl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          IMDB: IMDBText,
          processed_IMDB: analysis?.processed_text,
          logistic_sentiment: analysis?.logistic_sentiment,
          user_mood: userMood,
          is_correct: isCorrect,
        }),
      });
      if (response.ok) {
        setShowFeedback(false);
        setUserMood('');
        setIsCorrect(null);
      } else {
        const data = await response.json();
        setError(data.error || "An error occurred while submitting feedback.");
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError("An error occurred while connecting to the server.");
    }
  };

  const accuracyData = useMemo(() => [
    { name: 'Gaussian NB', accuracy: 0.7379 },
    { name: 'Random Forest', accuracy: 0.7997 },
    { name: 'Logistic Regression', accuracy: 0.82 },
    { name: 'LSTM', accuracy: 0.7424 },
    { name: 'Transformer', accuracy: 0.5 },
  ], []);

  const datasetData = useMemo(() => [
    { name: 'Positive', value: 25000 },
    { name: 'Negative', value: 25000 },
  ], []);

  const COLORS = ['#0088FE', '#00C49F'];

  const trainingProgressData = useMemo(() => [
    { epoch: 1, accuracy: 0.6 },
    { epoch: 2, accuracy: 0.65 },
    { epoch: 3, accuracy: 0.7 },
    { epoch: 4, accuracy: 0.73 },
    { epoch: 5, accuracy: 0.75 },
    { epoch: 6, accuracy: 0.77 },
    { epoch: 7, accuracy: 0.79 },
    { epoch: 8, accuracy: 0.8 },
    { epoch: 9, accuracy: 0.81 },
    { epoch: 10, accuracy: 0.82 },
  ], []);

  const MemoizedBarChart = useMemo(() => (
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
  ), [accuracyData]);

  console.log("About to return JSX");

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 animate-pulse">IMDB Sentiment Analysis</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Zap className="mr-2 text-yellow-500 animate-spin" />
          Analyze IMDB Review
        </h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={IMDBText}
            onChange={(e) => setIMDBText(e.target.value)}
            placeholder="Enter IMDB text..."
            aria-label="IMDB review text"
            className="flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-300 transition-all duration-300"
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
        {analysis && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md animate-fadeIn">
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
                className="p-1 border rounded focus:ring-2 focus:ring-blue-300 transition-all duration-300"
              />
            </div>
            <div className="mb-2">
              <label className="block">Was the analysis correct?</label>
              <div>
                <button
                  onClick={() => setIsCorrect(true)}
                  className={`mr-2 px-2 py-1 rounded ${isCorrect === true ? 'bg-green-500 text-white' : 'bg-gray-200'} transition-colors focus:outline-none focus:ring-2 focus:ring-green-300`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setIsCorrect(false)}
                  className={`px-2 py-1 rounded ${isCorrect === false ? 'bg-red-500 text-white' : 'bg-gray-200'} transition-colors focus:outline-none focus:ring-2 focus:ring-red-300`}
                >
                  No
                </button>
              </div>
            </div>
            <button
              onClick={handleFeedbackSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Details */}
        <div className="transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Info className="mr-2 text-blue-500" />
            Project Details
          </h2>
          <div className="space-y-2">
            <p><strong>Developed By:</strong> Saquib</p>
            <p><strong>Dataset Used:</strong> IMDB Dataset of 50K Movie Reviews</p>
            <p><strong>Dataset Link:</strong> <a href="https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Kaggle - IMDB Dataset</a></p>
            <p><strong>GitHub Repository:</strong> <a href="https://github.com/saquib34/zensibleInterview" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center"><Code size={16} className="mr-1" /> zensibleInterview</a></p>
            <p><strong>IPython Notebook:</strong> <a href="/model.ipynb" download className="text-blue-600 hover:underline flex items-center"><Download size={16} className="mr-1" /> Download model.ipynb</a></p>
            <p><strong>Embedding Results:</strong> Saved as simple.csv</p>
          </div>
        </div>
        
        {/* Dataset Details */}
        <div className="transform hover:scale-105 transition-transform duration-300">
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
        
        {/* Model Accuracy Comparison */}
        <div className="md:col-span-2 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart2 className="mr-2 text-red-500" />
            Model Accuracy Comparison
          </h2>
          <div className="w-full h-64">
            {MemoizedBarChart}
          </div>
        </div>
        
        {/* Models Trained */}
        <div className="transform hover:scale-105 transition-transform duration-300">
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
        
        {/* Preprocessing Steps */}
        <div className="transform hover:scale-105 transition-transform duration-300">
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
        
        {/* Model Architecture and Embeddings */}
        <div className="md:col-span-2 transform hover:scale-105 transition-transform duration-300">
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

        {/* Setup Instructions */}
        <div className="md:col-span-2 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Terminal className="mr-2 text-gray-500" />
            Setup Instructions
          </h2>
          <div className="space-y-2">
            <p><strong>Frontend Setup:</strong></p>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>Clone the repository: <code className="bg-gray-200 px-1 rounded">git clone https://github.com/saquib34/zensibleInterview.git</code></li>
              <li>Navigate to the project directory: <code className="bg-gray-200 px-1 rounded">cd zensibleInterview</code></li>
              <li>Install dependencies: <code className="bg-gray-200 px-1 rounded">npm install</code></li>
              <li>Start the development server: <code className="bg-gray-200 px-1 rounded">npm start</code></li>
            </ol>
            <p><strong>Backend Setup:</strong></p>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>Ensure you have Python installed</li>
              <li>Install required packages: <code className="bg-gray-200 px-1 rounded">pip install -r requirements.txt</code></li>
              <li>Start the Flask server: <code className="bg-gray-200 px-1 rounded">python app.py</code></li>
            </ol>
          </div>
        </div>

        {/* Training Progress */}
        <div className="md:col-span-2 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart2 className="mr-2 text-blue-500" />
            Training Progress
          </h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500">
        <p>© 2024 IMDB Sentiment Analysis Project. All rights reserved.</p>
        <p>Developed with ❤️ by Saquib</p>
      </footer>
    </div>
  );
};

export default IMDBAnalysisDashboard;