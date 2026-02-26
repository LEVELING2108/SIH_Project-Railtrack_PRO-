import os

import mysql.connector
import qrcode
from PIL import Image

def _get_db_config() -> dict:
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "qr_database"),
    }

# DB connection (no hardcoded secrets)
conn = mysql.connector.connect(**_get_db_config())
cursor = conn.cursor()

rec_id = input("Enter Vendor Record ID to generate QR for: ").strip()

cursor.execute("SELECT * FROM vendor_data WHERE id=%s", (rec_id,))
result = cursor.fetchone()

if result:
    qr = qrcode.make(str(result[0]))
    filename = f'qr_vendor_{rec_id}.png'
    qr.save(filename)
    print(f"QR code generated and saved as {filename}")
    # Optionally display it
    img = Image.open(filename)
    img.show()
else:
    print("No vendor found with this ID.")

cursor.close()
conn.close()
