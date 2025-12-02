import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('טוען תשלום...');
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    async function complete() {
      try {
        const params = new URLSearchParams(search);
        const token = params.get('token') || params.get('orderId') || params.get('PayerID');
        if (!token) {
          setMessage('לא נמצא מזהה תשלום');
          setLoading(false);
          return;
        }

        // call backend to capture order
        const res = await api.capturePayPalOrder({ orderId: token });
        setMessage(res.message || 'התשלום נקלט והפרופיל הופעל');

        // after a short delay redirect to edit/profile
        setTimeout(() => navigate('/musician/edit'), 1800);
      } catch (err) {
        console.error('Payment capture failed', err);
        setMessage(err.message || 'שגיאה בהשלמת התשלום');
      } finally {
        setLoading(false);
      }
    }
    complete();
  }, [search, navigate]);

  return (
    <div style={{padding:40, textAlign:'center'}} dir="rtl">
      <h2>{loading ? 'מסתיים...' : 'סיום תשלום'}</h2>
      <p>{message}</p>
    </div>
  );
}
