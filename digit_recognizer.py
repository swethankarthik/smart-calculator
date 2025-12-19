import cv2
import numpy as np

def recognize_digit(img_path):
    # Load image
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print("Image not found")
        return None

    # Resize for consistency
    img = cv2.resize(img, (300, 300))

    # Invert (white digit on black)
    img = cv2.bitwise_not(img)

    # Threshold
    _, thresh = cv2.threshold(img, 50, 255, cv2.THRESH_BINARY)

    # Remove noise
    kernel = np.ones((5, 5), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    # Find contours
    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        print("No digit detected")
        return None

    # Largest contour = digit
    cnt = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(cnt)

    # Bounding box
    x, y, w, h = cv2.boundingRect(cnt)
    aspect_ratio = h / w if w != 0 else 0

    # ---- Heuristic Rules (simple & effective) ----
    if area < 1500:
        digit = "1"
    elif aspect_ratio > 1.8:
        digit = "1"
    elif 0.8 < aspect_ratio < 1.2:
        digit = "0"
    elif aspect_ratio < 0.8:
        digit = "7"
    else:
        digit = "Unknown"

    print(f"Detected Digit: {digit}")
    return digit


if __name__ == "__main__":
    recognize_digit("air_written.png")
