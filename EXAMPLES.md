# Usage Examples

## Basic Examples

### 1. Detect Kitchen Items

**Setup:**
- Mode: `Boxes`
- Thinking Budget: `2`
- Queries: `banana, bowl, cup, knife, spoon`

**Expected Output:**
- Bounding boxes around each item
- Labels identifying each object
- ~500-800ms latency

### 2. Track a Person

**Setup:**
- Mode: `Points`
- Thinking Budget: `1`
- Queries: `person, face, hand`

**Expected Output:**
- Center points on detected features
- Real-time tracking at ~2 fps
- <500ms latency

### 3. Plan a Trajectory

**Setup:**
- Mode: `Trajectory`
- Thinking Budget: `4`
- Queries: `reach the cup`

**Expected Output:**
- Path from start to goal
- 5+ intermediate waypoints
- Visual line connecting points

### 4. Live Conversation

**Setup:**
1. Click "Start Live Session"
2. Wait for connection
3. Ask: "What objects do you see in the scene?"

**Expected Output:**
- Audio response describing the scene
- Text transcript of conversation
- <1s response latency

## Advanced Use Cases

### Object Counting

**Prompt via Live API:**
```
"How many bananas are visible on the table?"
```

**Combined with ER:**
- Mode: `Boxes`
- Queries: `banana`
- Count boxes in results array

### Spatial Reasoning

**Prompt:**
```
"Which object is closest to the camera?"
"What is to the left of the cup?"
```

**Setup:**
- Mode: `Boxes`
- Thinking Budget: `5`
- Let ER analyze spatial relationships

### Safety Monitoring

**Prompt:**
```
"Are there any hazardous objects in view?"
```

**Setup:**
- Mode: `Boxes`
- Queries: `knife, scissors, fire, broken glass`
- Real-time alerts

### Robotics Control

**Workflow:**
1. Get trajectory from ER: `reach the target`
2. Convert normalized coords to robot workspace
3. Send to motion planner/controller

**Example Code:**
```typescript
// Get trajectory
const result = await fetch('/api/er/frame', {
  method: 'POST',
  body: JSON.stringify({
    imageBase64: frame,
    mode: 'trajectory',
    queries: ['grasp the cup'],
    thinkingBudget: 4,
  }),
});

const { results } = await result.json();

// Convert to robot coordinates
const robotPath = results.trajectory.map(([y, x]) => ({
  x: (x / 1000) * WORKSPACE_WIDTH + OFFSET_X,
  y: (y / 1000) * WORKSPACE_HEIGHT + OFFSET_Y,
  z: TABLE_HEIGHT,
}));

// Send to controller
await robotController.movePath(robotPath);
```

## Prompt Templates

### Object Detection
```
"Detect all [OBJECT_TYPE] in the scene and return bounding boxes"
```

### Quality Inspection
```
"Identify any defects, damage, or anomalies on the [PRODUCT]"
```

### Inventory
```
"List all items visible on the shelf with their positions"
```

### Assembly Verification
```
"Check if all components are correctly positioned for assembly step [N]"
```

## Performance Tuning

### Low Latency (<500ms)
```typescript
{
  thinkingBudget: 0,
  mode: 'points',
  queries: ['specific', 'objects'],
  // Downscale to 640px
}
```

### High Accuracy
```typescript
{
  thinkingBudget: 6,
  mode: 'boxes',
  queries: [], // Detect all
  // Full resolution
}
```

### Balanced
```typescript
{
  thinkingBudget: 2,
  mode: 'boxes',
  queries: ['top', '5', 'objects'],
  // 960px resolution
}
```

## Integration Examples

### ROS (Robot Operating System)

```python
# ros_bridge.py
import rospy
import requests
from geometry_msgs.msg import Point, Pose
from vision_msgs.msg import Detection2DArray, Detection2D

def er_to_ros_detections(er_results):
    detections = Detection2DArray()
    
    for item in er_results:
        det = Detection2D()
        det.header.frame_id = "camera"
        
        # Center point
        y, x = item['point']
        det.bbox.center.x = x / 1000.0
        det.bbox.center.y = y / 1000.0
        
        # Bounding box
        if 'box' in item:
            ymin, xmin, ymax, xmax = item['box']
            det.bbox.size_x = (xmax - xmin) / 1000.0
            det.bbox.size_y = (ymax - ymin) / 1000.0
        
        detections.detections.append(det)
    
    return detections

# Publish to ROS topic
pub = rospy.Publisher('/gemini/detections', Detection2DArray, queue_size=10)
```

### Arduino/STM32

```cpp
// serial_control.ino
#include <ArduinoJson.h>

void handleERCommand(String json) {
  StaticJsonDocument<1024> doc;
  deserializeJson(doc, json);
  
  JsonArray trajectory = doc["trajectory"];
  
  for (JsonVariant point : trajectory) {
    int y = point[0];
    int x = point[1];
    
    // Convert to servo angles
    int servoX = map(x, 0, 1000, 0, 180);
    int servoY = map(y, 0, 1000, 0, 180);
    
    // Move servos
    moveServos(servoX, servoY);
    delay(500);
  }
}
```

### Python Controller

```python
# controller.py
import requests
import numpy as np

class GeminiController:
    def __init__(self, server_url="http://localhost:5050"):
        self.server_url = server_url
    
    def get_object_position(self, image_path, object_name):
        with open(image_path, 'rb') as f:
            image_b64 = base64.b64encode(f.read()).decode()
        
        response = requests.post(
            f"{self.server_url}/api/er/frame",
            json={
                "imageBase64": image_b64,
                "mode": "points",
                "queries": [object_name],
                "thinkingBudget": 2
            }
        )
        
        results = response.json()["results"]
        if results:
            y, x = results[0]["point"]
            return (x / 1000, y / 1000)  # Normalized coords
        return None
    
    def plan_path(self, image_b64, goal):
        response = requests.post(
            f"{self.server_url}/api/er/frame",
            json={
                "imageBase64": image_b64,
                "mode": "trajectory",
                "queries": [goal],
                "thinkingBudget": 4
            }
        )
        
        trajectory = response.json()["results"]["trajectory"]
        return np.array(trajectory) / 1000  # Normalize
```

## Testing & Validation

### Manual Test Checklist

- [ ] Camera access granted
- [ ] Video feed displays
- [ ] Points mode detects objects
- [ ] Boxes mode draws rectangles
- [ ] Trajectory mode shows paths
- [ ] Queries filter results
- [ ] Thinking budget affects latency
- [ ] Live API connects
- [ ] Voice input works
- [ ] Text messages send
- [ ] Transcripts display
- [ ] Stats update (latency, FPS)

### Automated Testing

```bash
# Health check
./scripts/health-check.sh

# Load test (requires 'ab' tool)
ab -n 100 -c 10 http://localhost:5050/health
```

## Common Patterns

### Conditional Detection
```typescript
// Only process when motion detected
if (motionDetected) {
  const results = await processFrame();
}
```

### Multi-object Tracking
```typescript
// Track multiple objects across frames
const tracker = new ObjectTracker();
results.forEach(obj => {
  tracker.update(obj.label, obj.point);
});
```

### Alert System
```typescript
// Alert on specific conditions
if (results.some(r => r.label === 'hazard')) {
  sendAlert('Hazard detected!');
}
```