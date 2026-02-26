import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { scannerAPI } from '../api';

function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanner = () => {
    setError(null);
    setScanResult(null);
    setScannerActive(true);

    // Create scanner after a short delay to ensure DOM is ready
    setTimeout(() => {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      html5QrcodeScannerRef.current = html5QrcodeScanner;

      html5QrcodeScanner.render(
        async (decodedText) => {
          // QR code detected
          console.log('QR Detected:', decodedText);
          await handleScan(decodedText);
        },
        (errorMessage) => {
          // Parse error, ignore it
          console.log('Scan error:', errorMessage);
        }
      );
    }, 100);
  };

  const stopScanner = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().then(() => {
        setScannerActive(false);
      }).catch(console.error);
    }
  };

  const handleScan = async (qrData) => {
    setLoading(true);
    stopScanner();

    try {
      const response = await scannerAPI.scan(qrData);
      setScanResult(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setScanResult({ found: false, message: 'No vendor found for this QR code' });
      } else {
        setError('Failed to process QR code');
      }
      setLoading(false);
    }
  };

  const handleManualEntry = async () => {
    const vendorId = prompt('Enter Vendor ID:');
    if (vendorId) {
      await handleScan(vendorId.trim());
    }
  };

  const getRiskClass = (score) => {
    if (score >= 70) return 'risk-high';
    if (score >= 40) return 'risk-medium';
    return 'risk-low';
  };

  const resetScan = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <div>
      <h1 className="mb-3">Scan QR Code</h1>

      {!scanResult && !loading && (
        <div className="card scanner-container">
          <div className="text-center">
            <p className="mb-3">
              {scannerActive 
                ? 'Point your camera at a vendor QR code' 
                : 'Click the button below to start scanning'}
            </p>
            
            {!scannerActive ? (
              <button onClick={startScanner} className="btn btn-success btn-lg">
                📷 Start Camera Scanner
              </button>
            ) : (
              <div>
                <div id="reader" className="scanner-viewfinder"></div>
                <button onClick={stopScanner} className="btn btn-secondary mt-3">
                  Stop Scanner
                </button>
              </div>
            )}
            
            <div className="mt-3">
              <button onClick={handleManualEntry} className="btn btn-secondary">
                ⌨️ Enter ID Manually
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="card text-center">
          <div className="spinner"></div>
          <p>Processing QR code...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
          <button onClick={resetScan} className="btn btn-secondary mt-2">
            Try Again
          </button>
        </div>
      )}

      {scanResult && !scanResult.found && (
        <div className="card">
          <div className="alert alert-warning">
            ⚠️ {scanResult.message}
          </div>
          <button onClick={resetScan} className="btn btn-primary">
            Scan Another
          </button>
        </div>
      )}

      {scanResult && scanResult.found && scanResult.vendor && (
        <div>
          <div className="card">
            <div className="flex flex-between flex-center mb-3">
              <h2>✅ Vendor Verified</h2>
              <span className={`risk-badge ${getRiskClass(scanResult.vendor.risk_score)}`}>
                {scanResult.vendor.risk_score >= 70 ? 'High Risk' : 
                 scanResult.vendor.risk_score >= 40 ? 'Medium Risk' : 'Low Risk'} 
                ({scanResult.vendor.risk_score})
              </span>
            </div>

            <div className="grid grid-2">
              <div>
                <p><strong>ID:</strong> {scanResult.vendor.id}</p>
                <p><strong>Name:</strong> {scanResult.vendor.vendor_name}</p>
                {scanResult.vendor.manufacture_date && (
                  <p><strong>Manufacture Date:</strong> {scanResult.vendor.manufacture_date}</p>
                )}
                {scanResult.vendor.contact_person && (
                  <p><strong>Contact:</strong> {scanResult.vendor.contact_person}</p>
                )}
                {scanResult.vendor.contact_email && (
                  <p><strong>Email:</strong> {scanResult.vendor.contact_email}</p>
                )}
                {scanResult.vendor.contact_phone && (
                  <p><strong>Phone:</strong> {scanResult.vendor.contact_phone}</p>
                )}
              </div>
              <div>
                {scanResult.vendor.address_line1 && (
                  <p><strong>Address:</strong> {scanResult.vendor.address_line1}</p>
                )}
                {scanResult.vendor.city && (
                  <p>{scanResult.vendor.city}, {scanResult.vendor.state} {scanResult.vendor.postal_code}</p>
                )}
                {scanResult.vendor.country && (
                  <p>{scanResult.vendor.country}</p>
                )}
                {scanResult.vendor.tax_id && (
                  <p><strong>Tax ID:</strong> {scanResult.vendor.tax_id}</p>
                )}
              </div>
            </div>

            {scanResult.vendor.details && (
              <div className="mt-3">
                <strong>Details:</strong>
                <p className="text-muted">{scanResult.vendor.details}</p>
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="card">
            <div className="card-header">🤖 AI Risk Assessment</div>
            
            {scanResult.vendor.flags && scanResult.vendor.flags.length > 0 ? (
              <div className="alert alert-warning">
                <strong>⚠️ Risk Flags:</strong>
                <ul className="mt-2" style={{ paddingLeft: '1.5rem' }}>
                  {scanResult.vendor.flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="alert alert-success">
                ✅ No risk flags detected
              </div>
            )}

            {scanResult.vendor.recommendations && (
              <div className="mt-3">
                <strong>📋 Recommendations:</strong>
                <ul className="mt-2" style={{ paddingLeft: '1.5rem' }}>
                  {scanResult.vendor.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {scanResult.vendor.summary && (
              <div className="mt-3">
                <strong>📝 Summary:</strong>
                <p className="text-muted">{scanResult.vendor.summary}</p>
              </div>
            )}

            {scanResult.vendor.keywords && scanResult.vendor.keywords.length > 0 && (
              <div className="mt-3">
                <strong>🏷️ Keywords:</strong>
                <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
                  {scanResult.vendor.keywords.map((keyword, idx) => (
                    <span key={idx} className="risk-badge risk-low">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={resetScan} className="btn btn-primary">
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scanner;
