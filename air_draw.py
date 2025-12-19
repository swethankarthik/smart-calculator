import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Hand detector
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

mp_draw = mp.solutions.drawing_utils

# Webcam
cap = cv2.VideoCapture(0)

# Canvas for drawing
canvas = None
prev_x, prev_y = None, None

while True:
    success, frame = cap.read()
    if not success:
        break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape

    if canvas is None:
        canvas = np.zeros((h, w, 3), dtype=np.uint8)

    # Convert to RGB
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            # Index finger tip (landmark 8)
            x = int(hand_landmarks.landmark[8].x * w)
            y = int(hand_landmarks.landmark[8].y * h)

            if prev_x is None:
                prev_x, prev_y = x, y

            # Draw line
            cv2.line(canvas, (prev_x, prev_y), (x, y), (255, 255, 255), 5)
            prev_x, prev_y = x, y

            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
    else:
        prev_x, prev_y = None, None

    # Merge canvas with frame
    combined = cv2.addWeighted(frame, 0.7, canvas, 0.3, 0)

    cv2.putText(
        combined,
        "Draw in air with index finger | Press C to clear | Q to quit",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2
    )

    cv2.imshow("Air Writing - Phase 1", combined)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("c"):
        canvas = np.zeros((h, w, 3), dtype=np.uint8)
    elif key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
