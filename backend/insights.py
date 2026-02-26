"""
AI-powered vendor insights and risk assessment
Adapted from the original vendor_insights_builder.py
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, List, Optional


@dataclass
class InsightResult:
    """Container for vendor risk insights"""
    risk_score: int
    flags: List[str]
    summary: str
    keywords: List[str]
    recommendations: List[str]


_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_PHONE_RE = re.compile(r"^\+?[0-9][0-9\-\s]{7,}$")


def _clean_text(s: Optional[str]) -> str:
    return (s or "").strip()


def _split_sentences(text: str) -> List[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if p.strip()]


def _extract_keywords(text: str, top_k: int = 6) -> List[str]:
    text = text.lower()
    words = re.findall(r"[a-z0-9]{4,}", text)
    stop = {
        "this", "that", "with", "from", "have", "will", "your", "their", "vendor",
        "details", "contact", "address", "email", "phone", "bank", "account",
        "manufacture", "date", "india", "into", "over", "under", "about",
    }
    freq: dict[str, int] = {}
    for w in words:
        if w in stop:
            continue
        freq[w] = freq.get(w, 0) + 1
    return [w for w, _ in sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))[:top_k]]


def _safe_int(x, default: int = 0) -> int:
    try:
        return int(x)
    except Exception:
        return default


def _looks_like_tax_id(s: str) -> bool:
    s = _clean_text(s)
    if not s:
        return False
    return bool(re.fullmatch(r"[A-Za-z0-9\-]{8,20}", s))


def _looks_like_bank_account(s: str) -> bool:
    s = _clean_text(s).replace(" ", "").replace("-", "")
    if not s:
        return False
    return bool(re.fullmatch(r"[0-9]{9,18}", s))


def build_vendor_insights(
    vendor_id: str,
    vendor_name: Optional[str],
    manufacture_date: Optional[str],
    details: Optional[str],
    contact_person: Optional[str],
    contact_email: Optional[str],
    contact_phone: Optional[str],
    address_line1: Optional[str],
    city: Optional[str],
    state: Optional[str],
    postal_code: Optional[str],
    country: Optional[str],
    tax_id: Optional[str],
    bank_account: Optional[str],
) -> InsightResult:
    """
    Analyze vendor data and generate risk insights.
    
    Returns an InsightResult with:
    - risk_score: 0-100 risk rating
    - flags: List of issues detected
    - summary: Brief summary of vendor
    - keywords: Extracted keywords from details
    - recommendations: Actionable recommendations
    """
    flags: List[str] = []
    recs: List[str] = []

    name = _clean_text(vendor_name)
    email = _clean_text(contact_email)
    phone = _clean_text(contact_phone)
    det = _clean_text(details)
    tax = _clean_text(tax_id)
    bank = _clean_text(bank_account)

    score = 0

    # Email checks
    if not email:
        score += 18
        flags.append("Missing email")
        recs.append("Collect and verify a valid email address.")
    elif not _EMAIL_RE.match(email):
        score += 14
        flags.append("Email format looks invalid")
        recs.append("Confirm the email address format (example: name@example.com).")

    # Phone checks
    if not phone:
        score += 12
        flags.append("Missing phone")
        recs.append("Collect a contact phone number for verification.")
    elif not _PHONE_RE.match(phone):
        score += 10
        flags.append("Phone format looks invalid")
        recs.append("Verify the phone number (include country code if needed).")

    # Address completeness
    if not _clean_text(address_line1) or not _clean_text(city) or not _clean_text(postal_code):
        score += 10
        flags.append("Address is incomplete")
        recs.append("Confirm address line, city, and postal code.")

    # Tax / bank plausibility
    if tax and not _looks_like_tax_id(tax):
        score += 10
        flags.append("Tax ID format looks unusual")
        recs.append("Re-check the Tax ID (typos/extra characters).")
    if bank and not _looks_like_bank_account(bank):
        score += 12
        flags.append("Bank account format looks unusual")
        recs.append("Re-check bank account number (digits only, correct length).")

    # Manufacture date plausibility
    if manufacture_date:
        try:
            dt = datetime.fromisoformat(str(manufacture_date))
            if dt > datetime.now():
                score += 18
                flags.append("Manufacture date is in the future")
                recs.append("Confirm manufacture date; future dates are usually invalid.")
        except Exception:
            score += 6
            flags.append("Manufacture date could not be parsed")
            recs.append("Store manufacture date in a consistent date format.")

    # Suspicious keywords detection
    suspicious = ("urgent", "wire", "crypto", "gift card", "kindly", "confidential", "immediately", "refund")
    det_low = det.lower()
    hit = [k for k in suspicious if k in det_low]
    if hit:
        score += min(25, 8 + 3 * len(hit))
        flags.append(f"Suspicious phrasing detected: {', '.join(hit[:4])}" + ("..." if len(hit) > 4 else ""))
        recs.append("Perform extra verification (documents, PO validation, call-back confirmation).")

    # Minimal sanity checks
    if not name:
        score += 8
        flags.append("Missing vendor name")
        recs.append("Fill vendor name; avoid anonymous vendor entries.")

    # Clamp score 0..100
    score = max(0, min(100, _safe_int(score, 0)))

    # Summary + keywords
    sentences = _split_sentences(det)
    summary = ""
    if sentences:
        summary = " ".join(sentences[:2])
    elif det:
        summary = det[:180] + ("..." if len(det) > 180 else "")
    else:
        summary = "No details provided."

    keywords = _extract_keywords(det, top_k=6)

    # Elevate recommendations for high risk
    if score >= 70 and "Perform extra verification (documents, PO validation, call-back confirmation)." not in recs:
        recs.insert(0, "High risk detected: do an additional verification pass before approval.")

    if not recs:
        recs.append("No major issues detected. Proceed with routine verification.")

    return InsightResult(
        risk_score=score,
        flags=flags,
        summary=summary,
        keywords=keywords,
        recommendations=recs,
    )
