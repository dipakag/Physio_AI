import boto3
import json
import numpy as np
import base64
from datetime import datetime
from typing import Dict, Any, List
from dataclasses import dataclass
import cv2

@dataclass
class RepetitionData:
    rep_number: int
    max_angle: float
    duration: float
    form_quality: float
    peak_position: str
    timestamp: datetime

@dataclass
class ExerciseReport:
    total_reps: int
    avg_angle: float
    avg_duration: float
    form_consistency: float
    range_of_motion: float
    symmetry_score: float
    overall_quality: float
    recommendations: List[str]
    best_rep: int
    needs_improvement: List[str]

class MovementAnalysisService:
    def __init__(self, region_name: str = "us-east-1"):
        self.bedrock = boto3.client(
            service_name="bedrock-runtime",
            region_name=region_name
        )
        self.reps: List[RepetitionData] = []
        self.current_rep: Dict[str, Any] = {
            "frames": [],
            "start_time": None
        }
        self.is_rep_in_progress = False
        self.rep_threshold = 15  # degrees
        
    async def analyze_frame(self, frame_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a single frame and track repetitions."""
        try:
            image_b64 = self._prepare_image_for_claude(frame_data['data'])
            analysis = await self._get_claude_analysis(image_b64)
            
            # Track repetition
            current_angle = analysis['angle']
            timestamp = datetime.fromtimestamp(frame_data['timestamp'] / 1000)
            
            if self._is_rep_start(current_angle):
                self._start_new_rep(timestamp)
            
            if self.is_rep_in_progress:
                self.current_rep["frames"].append({
                    "angle": current_angle,
                    "form_quality": analysis['form_quality'],
                    "timestamp": timestamp,
                    "feedback": analysis['feedback']
                })
            
            if self._is_rep_end(current_angle):
                rep_data = self._complete_rep()
                if rep_data:
                    self.reps.append(rep_data)
            
            # Generate report if we have enough reps
            report = None
            if len(self.reps) >= 3:  # Minimum reps for meaningful analysis
                report = self._generate_exercise_report()
            
            return {
                "status": "analyzed",
                "current_rep": len(self.reps) + 1,
                "current_angle": current_angle,
                "form_feedback": analysis['feedback'],
                "safety_concerns": analysis.get('safety_concerns', []),
                "report": report.dict() if report else None,
                "points": self._get_visualization_points()
            }
            
        except Exception as e:
            print(f"Analysis error: {e}")
            return {"status": "error", "error": str(e)}

    async def _get_claude_analysis(self, image_b64: str) -> Dict[str, Any]:
        """Get analysis from Claude for a single frame."""
        prompt = """Analyze this image of a person performing a side stretching exercise. 
        Focus on:
        1. Precise angle measurement of the side stretch
        2. Form quality assessment
        3. Body alignment and posture
        4. Safety concerns
        
        Return a JSON object with:
        {
            "angle": float,
            "form_quality": float (0-1),
            "posture_alignment": float (0-1),
            "feedback": string,
            "safety_concerns": string[]
        }"""

        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_b64
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        response = self.bedrock.invoke_model(
            modelId="anthropic.claude-3-sonnet-20240229-v1:0",
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        return json.loads(response_body['content'][0]['text'])

    def _generate_exercise_report(self) -> ExerciseReport:
        """Generate comprehensive report after exercise completion."""
        angles = [rep.max_angle for rep in self.reps]
        durations = [rep.duration for rep in self.reps]
        form_qualities = [rep.form_quality for rep in self.reps]
        
        # Calculate metrics
        avg_angle = np.mean(angles)
        angle_consistency = 1 - (np.std(angles) / avg_angle)
        form_consistency = np.mean(form_qualities)
        
        # Identify best rep
        best_rep_idx = np.argmax(form_qualities)
        
        # Generate recommendations
        recommendations = []
        if angle_consistency < 0.8:
            recommendations.append("Work on maintaining consistent stretch depth across repetitions")
        if form_consistency < 0.7:
            recommendations.append("Focus on maintaining proper form throughout the exercise")
        
        needs_improvement = []
        if np.mean(angles) < 30:
            needs_improvement.append("Increase stretch range gradually")
        if np.std(durations) > 2:
            needs_improvement.append("Maintain consistent timing for each repetition")

        return ExerciseReport(
            total_reps=len(self.reps),
            avg_angle=float(avg_angle),
            avg_duration=float(np.mean(durations)),
            form_consistency=float(form_consistency),
            range_of_motion=float(max(angles) - min(angles)),
            symmetry_score=self._calculate_symmetry(),
            overall_quality=float(np.mean([angle_consistency, form_consistency])),
            recommendations=recommendations,
            best_rep=best_rep_idx + 1,
            needs_improvement=needs_improvement
        )

    def _is_rep_start(self, angle: float) -> bool:
        """Detect start of a new repetition."""
        return (not self.is_rep_in_progress and 
                angle > self.rep_threshold)

    def _is_rep_end(self, angle: float) -> bool:
        """Detect end of current repetition."""
        return (self.is_rep_in_progress and 
                angle < self.rep_threshold and 
                len(self.current_rep["frames"]) > 5)

    def _start_new_rep(self, timestamp: datetime) -> None:
        """Initialize a new repetition."""
        self.is_rep_in_progress = True
        self.current_rep = {
            "frames": [],
            "start_time": timestamp
        }

    def _complete_rep(self) -> RepetitionData:
        """Complete current repetition and return analysis."""
        if not self.current_rep["frames"]:
            return None

        frames = self.current_rep["frames"]
        max_angle = max(f["angle"] for f in frames)
        duration = (frames[-1]["timestamp"] - self.current_rep["start_time"]).total_seconds()
        avg_form = np.mean([f["form_quality"] for f in frames])

        rep_data = RepetitionData(
            rep_number=len(self.reps) + 1,
            max_angle=max_angle,
            duration=duration,
            form_quality=avg_form,
            peak_position="left" if len(self.reps) % 2 == 0 else "right",
            timestamp=self.current_rep["start_time"]
        )

        self.is_rep_in_progress = False
        self.current_rep = {"frames": [], "start_time": None}
        
        return rep_data

    def _calculate_symmetry(self) -> float:
        """Calculate symmetry between left and right stretches."""
        if len(self.reps) < 2:
            return 1.0
            
        left_stretches = [r.max_angle for i, r in enumerate(self.reps) if i % 2 == 0]
        right_stretches = [r.max_angle for i, r in enumerate(self.reps) if i % 2 == 1]
        
        if not left_stretches or not right_stretches:
            return 1.0
            
        avg_left = np.mean(left_stretches)
        avg_right = np.mean(right_stretches)
        
        return 1 - abs(avg_left - avg_right) / max(avg_left, avg_right)

    def _get_visualization_points(self) -> List[List[float]]:
        """Generate points for visualization."""
        points = []
        for rep in self.reps:
            x = rep.rep_number * 60
            y = rep.max_angle * 2
            points.append([x, y])
        return points

    def _prepare_image_for_claude(self, frame_data: List[int]) -> str:
        """Convert frame data to base64 for Claude."""
        image_array = np.array(frame_data, dtype=np.uint8).reshape((480, 640, 4))
        rgb_image = image_array[:, :, :3]
        _, buffer = cv2.imencode('.jpg', rgb_image)
        return base64.b64encode(buffer).decode('utf-8')
