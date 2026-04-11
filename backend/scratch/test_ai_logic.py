import sys
import os
import json
from unittest.mock import MagicMock, patch

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.ai_service import AIService

def test_json_cleaning():
    service = AIService()
    dirty_json = "Here is the result: ```json\n{\"score\": 85}\n``` hope this helps!"
    clean = service._clean_json_response(dirty_json)
    assert clean == '{"score": 85}'
    print("PASSED: JSON cleaning")

@patch('google.generativeai.GenerativeModel')
def test_analyze_profile(mock_model):
    # Mocking Gemini response
    mock_response = MagicMock()
    mock_response.text = '{"score": 90, "strengths": ["Python"], "weaknesses": ["None"], "missing_skills": [], "suggestions": ["Keep going"]}'
    mock_model.return_value.generate_content.return_value = mock_response

    service = AIService()
    # Force provider to gemini for test
    service.provider = "gemini"
    service._gemini_pro = mock_model()
    
    result = service.analyze_profile("Expert Python Developer")
    assert result["score"] == 90
    print("PASSED: analyze_profile logic")

@patch('google.generativeai.GenerativeModel')
def test_recommend_jobs(mock_model):
    mock_response = MagicMock()
    mock_response.text = '{"recommendations": [{"job_id": "1", "title": "Dev", "match_score": 95, "explanation": "Good fit"}]}'
    mock_model.return_value.generate_content.return_value = mock_response

    service = AIService()
    service.provider = "gemini"
    service._gemini_flash = mock_model()

    context_jobs = [{"_id": "1", "title": "Dev", "description": "Python role"}]
    result = service.recommend_jobs(["Python"], "Remote", context_jobs)
    
    assert len(result["recommendations"]) == 1
    assert result["recommendations"][0]["job_id"] == "1"
    print("PASSED: recommend_jobs context logic")

if __name__ == "__main__":
    try:
        test_json_cleaning()
        test_analyze_profile()
        test_recommend_jobs()
        print("\nAll internal logic tests passed successfully!")
    except Exception as e:
        print(f"\nTests failed: {e}")
        sys.exit(1)
