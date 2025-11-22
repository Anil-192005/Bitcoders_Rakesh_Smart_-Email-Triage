"""
Flask API Server for AI Quiz Analysis
Provides endpoints for analyzing quiz results and generating recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from ai_analyzer import QuizAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

analyzer = QuizAnalyzer()


@app.route('/api/analyze', methods=['POST'])
def analyze_results():
    """
    Endpoint to analyze quiz results
    
    Expected JSON body:
    {
        "timestamp": "...",
        "overall": {...},
        "subjects": {...}
    }
    
    Returns:
    Complete analysis with recommendations
    """
    try:
        quiz_data = request.json
        
        if not quiz_data:
            return jsonify({
                'error': 'No data provided',
                'status': 'failed'
            }), 400
        
        # Perform AI analysis
        analysis = analyzer.analyze_results(quiz_data)
        
        return jsonify({
            'status': 'success',
            'data': analysis
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Quiz Analyzer',
        'version': '1.0'
    }), 200


@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Get only recommendations without full analysis
    """
    try:
        quiz_data = request.json
        recommendations = analyzer._generate_recommendations(quiz_data)
        
        return jsonify({
            'status': 'success',
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500


@app.route('/api/study-plan', methods=['POST'])
def get_study_plan():
    """
    Get personalized study plan
    """
    try:
        quiz_data = request.json
        study_plan = analyzer._create_study_plan(quiz_data)
        
        return jsonify({
            'status': 'success',
            'study_plan': study_plan
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500


if __name__ == '__main__':
    print("🚀 Starting AI Quiz Analyzer API Server...")
    print("📊 Server running at: http://localhost:5000")
    print("🔗 API Endpoints:")
    print("   - POST /api/analyze - Full analysis")
    print("   - POST /api/recommendations - Get recommendations")
    print("   - POST /api/study-plan - Get study plan")
    print("   - GET  /api/health - Health check")
    app.run(debug=True, port=5000)
