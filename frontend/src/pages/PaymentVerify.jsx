import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api";

export default function PaymentVerify() {
  const [status, setStatus] = useState("checking"); // checking | failed
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }
    api
      .get(`/payments/verify?orderId=${orderId}`)
      .then(() => navigate("/library?purchase=success", { replace: true }))
      .catch(() => setStatus("failed"));
  }, [orderId]);

  if (status === "checking") {
    return <p className="state-line">Confirming your payment…</p>;
  }

  return (
    <div className="page">
      <p className="error">
        We couldn't confirm this payment. If money was deducted from your account, it will
        appear in your library shortly — otherwise, please try again.
      </p>
      <p className="muted" style={{ marginTop: 14 }}>
        <Link to="/library">Go to My Library</Link>
      </p>
    </div>
  );
}
