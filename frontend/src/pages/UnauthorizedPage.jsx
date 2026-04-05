import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="centerScreen">
      <section className="authWrap card">
        <h1>Access Denied</h1>
        <p className="muted">You are authenticated but do not have permission for this page.</p>
        <Link className="btn-secondary inlineBtn" to="/">
          Back to Dashboard
        </Link>
      </section>
    </div>
  );
}

export default UnauthorizedPage;
