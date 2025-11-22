"""
AI Quiz Result Analyzer
Analyzes student quiz performance and provides personalized recommendations
"""

import json
from datetime import datetime
from typing import Dict, List, Any
from collections import defaultdict


class QuizAnalyzer:
    """Analyzes quiz results and generates recommendations"""
    
    def __init__(self):
        self.subject_topics = {
            'biology': [
                'Reproduction in Organisms',
                'Sexual Reproduction in Flowering Plants',
                'Principles of Inheritance & Variation',
                'Molecular Basis of Inheritance',
                'Evolution',
                'Human Physiology',
                'Biotechnology & Applications',
                'Ecology'
            ],
            'chemistry': [
                'Solid State',
                'Solutions',
                'Electrochemistry',
                'Chemical Kinetics',
                'Coordination Compounds',
                'Alcohols, Phenols & Ethers',
                'Aldehydes & Ketones',
                'Carboxylic Acids',
                'Amines',
                'Biomolecules',
                'Polymers'
            ],
            'physics': [
                'Electric Charges & Fields',
                'Electrostatic Potential & Capacitance',
                'Current Electricity',
                'Moving Charges & Magnetism',
                'Magnetism & Matter',
                'Electromagnetic Induction',
                'Alternating Current',
                'Electromagnetic Waves',
                'Ray Optics',
                'Wave Optics',
                'Dual Nature of Radiation & Matter',
                'Atoms & Nuclei',
                'Semiconductor Electronics'
            ]
        }
    
    def analyze_results(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main analysis function
        
        Args:
            quiz_data: Quiz results from localStorage
            
        Returns:
            Complete analysis with recommendations
        """
        analysis = {
            'student_id': quiz_data.get('student_id', 'anonymous'),
            'analysis_id': f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'timestamp': datetime.now().isoformat(),
            'overall_performance': self._analyze_overall(quiz_data),
            'subject_analysis': self._analyze_subjects(quiz_data),
            'recommendations': self._generate_recommendations(quiz_data),
            'study_plan': self._create_study_plan(quiz_data),
            'strengths': self._identify_strengths(quiz_data),
            'weaknesses': self._identify_weaknesses(quiz_data)
        }
        
        return analysis
    
    def _analyze_overall(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze overall performance"""
        overall = quiz_data.get('overall', {})
        total = overall.get('total', 0)
        correct = overall.get('correct', 0)
        answered = overall.get('answered', 0)
        
        accuracy = (correct / total * 100) if total > 0 else 0
        completion_rate = (answered / total * 100) if total > 0 else 0
        
        # Determine performance level
        if accuracy >= 85:
            level = "Excellent"
            message = "Outstanding performance! You have a strong grasp of the material."
        elif accuracy >= 70:
            level = "Good"
            message = "Good work! Focus on weak areas to reach excellence."
        elif accuracy >= 50:
            level = "Average"
            message = "You're making progress. Consistent practice will improve your scores."
        else:
            level = "Needs Improvement"
            message = "Don't worry! With focused study, you can significantly improve."
        
        return {
            'accuracy': round(accuracy, 2),
            'completion_rate': round(completion_rate, 2),
            'total_questions': total,
            'correct_answers': correct,
            'incorrect_answers': answered - correct,
            'unanswered': total - answered,
            'performance_level': level,
            'message': message
        }
    
    def _analyze_subjects(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance by subject"""
        subjects = quiz_data.get('subjects', {})
        subject_analysis = {}
        
        for subject, stats in subjects.items():
            total = stats.get('total', 0)
            correct = stats.get('correct', 0)
            answered = stats.get('answered', 0)
            
            accuracy = (correct / total * 100) if total > 0 else 0
            
            # Identify weak areas
            weak_areas = []
            improvement_needed = accuracy < 70
            
            subject_analysis[subject] = {
                'accuracy': round(accuracy, 2),
                'correct': correct,
                'total': total,
                'wrong': total - correct,
                'status': self._get_status(accuracy),
                'improvement_needed': improvement_needed,
                'priority': 'High' if accuracy < 50 else 'Medium' if accuracy < 70 else 'Low'
            }
        
        return subject_analysis
    
    def _get_status(self, accuracy: float) -> str:
        """Get status based on accuracy"""
        if accuracy >= 85:
            return "Strong"
        elif accuracy >= 70:
            return "Moderate"
        elif accuracy >= 50:
            return "Weak"
        else:
            return "Critical"
    
    def _identify_strengths(self, quiz_data: Dict[str, Any]) -> List[str]:
        """Identify student's strengths"""
        subjects = quiz_data.get('subjects', {})
        strengths = []
        
        for subject, stats in subjects.items():
            total = stats.get('total', 0)
            correct = stats.get('correct', 0)
            accuracy = (correct / total * 100) if total > 0 else 0
            
            if accuracy >= 75:
                strengths.append(f"{subject.capitalize()}: {accuracy:.0f}% accuracy - Excellent understanding")
        
        if not strengths:
            strengths.append("Keep practicing to identify your strong subjects")
        
        return strengths
    
    def _identify_weaknesses(self, quiz_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify areas needing improvement"""
        subjects = quiz_data.get('subjects', {})
        weaknesses = []
        
        for subject, stats in subjects.items():
            total = stats.get('total', 0)
            correct = stats.get('correct', 0)
            wrong = total - correct
            accuracy = (correct / total * 100) if total > 0 else 0
            
            if accuracy < 70:
                weaknesses.append({
                    'subject': subject.capitalize(),
                    'accuracy': round(accuracy, 2),
                    'questions_wrong': wrong,
                    'severity': 'Critical' if accuracy < 50 else 'Moderate',
                    'action': self._get_action_plan(subject, accuracy)
                })
        
        # Sort by severity (lowest accuracy first)
        weaknesses.sort(key=lambda x: x['accuracy'])
        
        return weaknesses
    
    def _get_action_plan(self, subject: str, accuracy: float) -> str:
        """Generate specific action plan"""
        if accuracy < 40:
            return f"Start with fundamentals. Review basic concepts in {subject} before attempting practice questions."
        elif accuracy < 60:
            return f"Focus on understanding core concepts. Practice more {subject} questions and review mistakes."
        else:
            return f"You're close! Practice advanced {subject} problems and review common error patterns."
    
    def _generate_recommendations(self, quiz_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate personalized recommendations"""
        subjects = quiz_data.get('subjects', {})
        recommendations = []
        
        # Sort subjects by accuracy
        subject_scores = []
        for subject, stats in subjects.items():
            total = stats.get('total', 0)
            correct = stats.get('correct', 0)
            accuracy = (correct / total * 100) if total > 0 else 0
            subject_scores.append((subject, accuracy, stats))
        
        subject_scores.sort(key=lambda x: x[1])
        
        # Recommendation 1: Weakest subject
        if subject_scores:
            weakest_subject, weakest_score, weakest_stats = subject_scores[0]
            if weakest_score < 70:
                recommendations.append({
                    'priority': 'High',
                    'subject': weakest_subject.capitalize(),
                    'title': f'Focus on {weakest_subject.capitalize()}',
                    'description': f'Your {weakest_subject} score is {weakest_score:.0f}%. This needs immediate attention. '
                                 f'Dedicate at least 1-2 hours daily to strengthen this subject.',
                    'action_items': [
                        f'Review fundamental {weakest_subject} concepts',
                        'Practice 10-15 questions daily',
                        'Watch tutorial videos on weak topics',
                        'Make summary notes of key concepts'
                    ]
                })
        
        # Recommendation 2: Practice consistency
        overall = quiz_data.get('overall', {})
        answered = overall.get('answered', 0)
        total = overall.get('total', 0)
        
        if answered < total:
            unanswered = total - answered
            recommendations.append({
                'priority': 'Medium',
                'subject': 'All Subjects',
                'title': 'Complete All Questions',
                'description': f'You left {unanswered} questions unanswered. Always attempt all questions to maximize learning.',
                'action_items': [
                    'Practice time management',
                    'Attempt educated guesses for uncertain answers',
                    'Review questions you skipped'
                ]
            })
        
        # Recommendation 3: Maintain strengths
        if len(subject_scores) > 0:
            strongest_subject, strongest_score, _ = subject_scores[-1]
            if strongest_score >= 75:
                recommendations.append({
                    'priority': 'Low',
                    'subject': strongest_subject.capitalize(),
                    'title': f'Maintain Your {strongest_subject.capitalize()} Strength',
                    'description': f'You scored {strongest_score:.0f}% in {strongest_subject}! Keep practicing to maintain this level.',
                    'action_items': [
                        f'Solve advanced {strongest_subject} problems',
                        'Help peers who struggle with this subject',
                        'Take mock tests to stay sharp'
                    ]
                })
        
        return recommendations
    
    def _create_study_plan(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a personalized study plan"""
        subjects = quiz_data.get('subjects', {})
        
        # Calculate time allocation based on performance
        plan = {
            'daily_schedule': {},
            'weekly_goals': [],
            'study_duration': '2-3 hours daily'
        }
        
        total_time = 180  # minutes per day
        subject_allocation = {}
        
        # Allocate more time to weaker subjects
        for subject, stats in subjects.items():
            total = stats.get('total', 0)
            correct = stats.get('correct', 0)
            accuracy = (correct / total * 100) if total > 0 else 0
            
            # More time for weaker subjects
            if accuracy < 50:
                time_percent = 0.40
            elif accuracy < 70:
                time_percent = 0.35
            else:
                time_percent = 0.25
            
            subject_allocation[subject] = {
                'time_minutes': int(total_time * time_percent / len(subjects)),
                'focus_level': 'High' if accuracy < 60 else 'Medium' if accuracy < 75 else 'Maintenance'
            }
        
        plan['daily_schedule'] = subject_allocation
        
        # Weekly goals
        for subject, stats in subjects.items():
            total = stats.get('total', 0)
            correct = stats.get('correct', 0)
            accuracy = (correct / total * 100) if total > 0 else 0
            
            if accuracy < 60:
                target = 70
            elif accuracy < 80:
                target = 85
            else:
                target = 90
            
            plan['weekly_goals'].append(
                f"Improve {subject.capitalize()} from {accuracy:.0f}% to {target}%"
            )
        
        return plan


def analyze_quiz_results(quiz_data_json: str) -> str:
    """
    Main function to analyze quiz results
    
    Args:
        quiz_data_json: JSON string of quiz results
        
    Returns:
        JSON string of analysis results
    """
    try:
        quiz_data = json.loads(quiz_data_json)
        analyzer = QuizAnalyzer()
        analysis = analyzer.analyze_results(quiz_data)
        return json.dumps(analysis, indent=2)
    except Exception as e:
        return json.dumps({
            'error': str(e),
            'status': 'failed'
        })


if __name__ == '__main__':
    # Test with sample data
    sample_data = {
        'timestamp': '2025-11-21T20:00:00',
        'overall': {
            'correct': 45,
            'total': 75,
            'answered': 70
        },
        'subjects': {
            'biology': {'correct': 10, 'total': 16, 'answered': 16},
            'chemistry': {'correct': 18, 'total': 26, 'answered': 24},
            'physics': {'correct': 17, 'total': 33, 'answered': 30}
        }
    }
    
    result = analyze_quiz_results(json.dumps(sample_data))
    print(result)
