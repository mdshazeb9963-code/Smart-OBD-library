import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandHeader } from './layout';

function Mechanic() {
  const navigate = useNavigate();
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password === '123321') {
      navigate('/home');
      return;
    }
    setMessage('That password is incorrect. Please try again.');
  };

  return (
    <div className="app-page">
      <BrandHeader />
      <main className="auth-content">
        <section className="auth-card">
          <div className="auth-icon" aria-hidden="true">⚙</div>
          <p className="section-kicker">MECHANIC WORKSPACE</p>
          <h1>Welcome back</h1>
          <p className="auth-description">Enter your workshop password to continue.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="mechanic-password">Workshop password</label>
            <input
              id="mechanic-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage('');
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button className="primary-button" type="submit">
              Enter workspace <span aria-hidden="true">→</span>
            </button>
            {message && <p className="form-message" role="alert">{message}</p>}
          </form>
          <p className="auth-hint">Need access? Contact your workshop administrator.</p>
        </section>
      </main>
    </div>
  );
}

export default Mechanic;
