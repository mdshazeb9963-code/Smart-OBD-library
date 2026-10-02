import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        setMessage('Incorrect password.');
    };

    return (
        <div>
            <nav
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#F4EFC7',
                    fontSize: '29px',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif',
                    backgroundColor: '#1321bef4',
                    padding: '19px',
                    borderRadius: '5px',
                    marginTop: '4px',
                    boxShadow: '0 4px 8px #0c0965f4',
                }}
            >
                <b>🛠️ WELCOME TO SMART OBD SMART LIBRARY SCANNER⚙️</b>
            </nav>

            <h2 align="center">Welcome to the Mechanic Page</h2>
            <p align="center">Enter your password to continue</p>
            <br />

            <div
                style={{
                    backgroundColor: 'rgba(242, 246, 249, 0.92)',
                    padding: '55px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px #205f7e',
                    width: '350px',
                    margin: '0 auto',
                    textAlign: 'center',
                }}
            >
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        aria-label="Mechanic password"
                        style={{
                            width: '100%',
                            padding: '15px',
                            border: '1px solid #aaa',
                            borderRadius: '8px',
                            fontSize: '18px',
                            boxSizing: 'border-box',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            marginTop: '18px',
                            padding: '15px 40px',
                            fontSize: '18px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        Submit
                    </button>
                    {message && <p role="status" style={{ fontWeight: 'bold' }}>{message}</p>}
                </form>
            </div>
        </div>
    );
}

export default Mechanic;