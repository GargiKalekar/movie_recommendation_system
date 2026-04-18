from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app)  # allow Node.js to call this API

# Load saved models once at startup
knn            = pickle.load(open('knn_model.pkl', 'rb'))
tfidf          = pickle.load(open('tfidf_model.pkl', 'rb'))
df             = pickle.load(open('movies_df.pkl', 'rb'))
content_vectors = np.load('content_vectors.npy')

# Normalize sentiment for blending
scaler = MinMaxScaler()
df['sentiment_normalized'] = scaler.fit_transform(df[['sentiment_score']])

# ── Routes ──────────────────────────────────────────

@app.route('/recommend', methods=['GET'])
def recommend():
    movie = request.args.get('title', '')   # ?title=Avatar

    matches = df[df['title'].str.lower() == movie.lower()]
    if matches.empty:
        # Return partial matches as suggestions
        suggestions = df[df['title'].str.contains(movie, case=False)]['title'].head(5).tolist()
        return jsonify({ 'error': 'Movie not found', 'suggestions': suggestions }), 404

    index = matches.index[0]

    # KNN
    distances, indices = knn.kneighbors([content_vectors[index]])
    content_scores = { int(indices[0][i]): 1 - distances[0][i] for i in range(1, 6) }

    # Sentiment similarity
    target_sentiment = df.loc[index, 'sentiment_normalized']
    sentiment_scores = {
        idx: 1 - abs(target_sentiment - df.loc[idx, 'sentiment_normalized'])
        for idx in content_scores
    }

    # Blend
    final_scores = {
        idx: 0.7 * content_scores[idx] + 0.3 * sentiment_scores[idx]
        for idx in content_scores
    }

    ranked = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)

    # Build response
    recommendations = []
    for idx, score in ranked:
        recommendations.append({
            'title':           df.loc[idx, 'title'],
            'sentiment_label': df.loc[idx, 'sentiment_label'],
            'sentiment_score': round(float(df.loc[idx, 'sentiment_score']), 3),
            'similarity':      round(score, 4),
            'genres':          df.loc[idx, 'genres'],
            'overview':        df.loc[idx, 'overview'],
        })

    return jsonify({
        'query': df.loc[index, 'title'],
        'mood':  df.loc[index, 'sentiment_label'],
        'recommendations': recommendations
    })


@app.route('/search', methods=['GET'])
def search():
    # Autocomplete — returns matching titles
    query = request.args.get('q', '')
    matches = df[df['title'].str.contains(query, case=False)]['title'].head(10).tolist()
    return jsonify({ 'results': matches })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({ 'status': 'ok', 'movies': len(df) })


if __name__ == '__main__':
    app.run(port=5000, debug=True)