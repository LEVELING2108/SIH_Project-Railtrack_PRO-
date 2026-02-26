import os
import tkinter as tk
from tkinter import ttk

import cv2
import mysql.connector
from pyzbar.pyzbar import decode

from vendor_insights_builder import build_vendor_insights

def _get_db_config() -> dict:
    """
    Configure DB via environment variables (recommended).
    Required:
      DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
    """
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "qr_database"),
    }


# Database connection (no hardcoded secrets)
conn = mysql.connector.connect(**_get_db_config())
cursor = conn.cursor()

class VendorQRScannerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Vendor QR Code Scanner")
        self.geometry("900x700")
        self.configure(bg="#232946")

        style = ttk.Style(self)
        style.theme_use('clam')

        ttk.Label(self, text="Scan Vendor QR Code",
                  font=("Segoe UI", 25, "bold"),
                  background="#232946", foreground="#fffffe").pack(pady=(30, 10))

        ttk.Button(self, text="Scan QR (Camera)", style='Accent.TButton',
                   command=self.scan_qr).pack(pady=25)

        info_frame = ttk.Frame(self, padding=26)
        info_frame.pack(fill=tk.BOTH, expand=True, padx=60, pady=36)

        self.result_text = tk.Text(
            info_frame, font=("Segoe UI", 13),
            bg="#ffffff", fg="#232946", wrap="word",
            relief="groove", borderwidth=3, padx=12, pady=12, height=15
        )
        self.result_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        yscroll = ttk.Scrollbar(info_frame, orient="vertical", command=self.result_text.yview)
        yscroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.result_text['yscrollcommand'] = yscroll.set

        self.show_message("Vendor details + AI insights will appear here after scanning.")

        style.configure("Accent.TButton", font=("Segoe UI", 12, "bold"), foreground="#232946")

    def show_message(self, msg):
        self.result_text.config(state=tk.NORMAL)
        self.result_text.delete("1.0", tk.END)
        self.result_text.insert(tk.END, msg)
        self.result_text.see("1.0")
        self.result_text.config(state=tk.DISABLED)

    def scan_qr(self):
        cap = cv2.VideoCapture(0)
        self.show_message("Opening camera...")
        found_id = None

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            for obj in decode(frame):
                found_id = obj.data.decode('utf-8')

                cv2.rectangle(
                    frame,
                    (obj.rect.left, obj.rect.top),
                    (obj.rect.left + obj.rect.width, obj.rect.top + obj.rect.height),
                    (0, 255, 0),
                    2
                )

                cap.release()
                cv2.destroyAllWindows()

                cursor.execute("SELECT * FROM vendor_data WHERE id=%s", (found_id,))
                result = cursor.fetchone()

                if result:
                    # Expected schema based on existing UI formatting
                    insights = build_vendor_insights(
                        vendor_id=result[0],
                        vendor_name=result[1],
                        manufacture_date=result[2],
                        details=result[3],
                        contact_person=result[4],
                        contact_email=result[5],
                        contact_phone=result[6],
                        address_line1=result[7],
                        city=result[8],
                        state=result[9],
                        postal_code=result[10],
                        country=result[11],
                        tax_id=result[12],
                        bank_account=result[13],
                    )

                    msg = (
                        f"ID: {result[0]}\n"
                        f"Vendor Name: {result[1]}\n"
                        f"Manufacture Date: {result[2]}\n"
                        f"Details: {result[3]}\n"
                        f"Contact Person: {result[4]}\n"
                        f"Contact Email: {result[5]}\n"
                        f"Contact Phone: {result[6]}\n"
                        f"Address Line 1: {result[7]}\n"
                        f"City: {result[8]}\n"
                        f"State: {result[9]}\n"
                        f"Postal Code: {result[10]}\n"
                        f"Country: {result[11]}\n"
                        f"Tax ID: {result[12]}\n"
                        f"Bank Account: {result[13]}\n"
                        f"\n"
                        f"========== AI INSIGHTS ==========\n"
                        f"Risk Score: {insights.risk_score}/100\n"
                        f"Flags: {', '.join(insights.flags) if insights.flags else 'None'}\n"
                        f"Summary: {insights.summary}\n"
                        f"Keywords: {', '.join(insights.keywords) if insights.keywords else 'None'}\n"
                        f"Recommendations:\n"
                        + "".join([f"  - {r}\n" for r in insights.recommendations])
                    )
                else:
                    msg = "No vendor found for this QR code."

                self.show_message(msg)
                return

            cv2.imshow("Scan QR Code", frame)
            if cv2.waitKey(1) == 27:
                break

        cap.release()
        cv2.destroyAllWindows()
        if not found_id:
            self.show_message("No QR code detected.")

if __name__ == "__main__":
    VendorQRScannerApp().mainloop()
    cursor.close()
    conn.close()
