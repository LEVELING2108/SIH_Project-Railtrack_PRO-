import cv2

# Start webcam
cap = cv2.VideoCapture(0)

# Create QRCode detector
qr_detector = cv2.QRCodeDetector()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detect and decode QR code
    data, bbox, _ = qr_detector.detectAndDecode(frame)

    if bbox is not None:
        # Convert bbox points to integers for drawing
        points = bbox.astype(int).reshape(-1, 2)
        # Draw bounding box
        cv2.polylines(frame, [points], True, (0, 255, 0), 3)
        # Display decoded text if found
        if data:
            cv2.putText(frame, data, tuple(points[0]), cv2.FONT_HERSHEY_SIMPLEX,
                        0.8, (0, 0, 255), 2)
            print("Decoded Data:", data)

    cv2.imshow("QR Code Scanner", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
import cv2

# Start webcam
cap = cv2.VideoCapture(0)

# Create QRCode detector
qr_detector = cv2.QRCodeDetector()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detect and decode QR code
    data, bbox, _ = qr_detector.detectAndDecode(frame)

    if bbox is not None:
        # Convert bbox points to integers for drawing
        points = bbox.astype(int).reshape(-1, 2)
        # Draw bounding box
        cv2.polylines(frame, [points], True, (0, 255, 0), 3)
        # Display decoded text if found
        if data:
            cv2.putText(frame, data, tuple(points[0]), cv2.FONT_HERSHEY_SIMPLEX,
                        0.8, (0, 0, 255), 2)
            print("Decoded Data:", data)

    cv2.imshow("QR Code Scanner", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
