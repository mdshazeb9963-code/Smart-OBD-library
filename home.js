import React from 'react';

function Home() {
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

      <h2 align="center">Welcome Mechanic</h2>
      <p align="center">Manage your cars from the menu</p>
      <br />

      <div
        style={{
          backgroundColor: 'rgba(242, 246, 249, 0.92)',
          padding: '75px',
          borderRadius: '12px',
          boxShadow: '0 8px 16px #205f7e',
          width: '350px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h3 style={{ color: '#205f7e', fontSize: '24px' }}>
          Smart OBD Library Scanner
        </h3>
        <p>Choose an option from the menu to continue.</p>
      </div>

      <sidebar
        style={{
          position: 'fixed',
          top: '86px',
          left: '0',
          height: '100%',
          width: '125px',
          backgroundColor: '#f7f9fb',
          color: '#191819',
          padding: '20px',
          boxShadow: '2px 0 5px #09a7c780',
          fontFamily: 'Bebas Neue, sans-serif',
        }}
      >
        <h2><i><u>MENU</u></i></h2>
        <ul style={{ listStyleType: 'none', padding: '0' }}>
          <li style={{ marginBottom: '10px' }}>
            <a
              href="/cars"
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                width: '125px',
                boxSizing: 'border-box',
                color: '#fff',
                backgroundColor: '#6c757d',
                border: '1px solid #6c757d',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Cars
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href="/add-car"
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                width: '125px',
                boxSizing: 'border-box',
                color: '#fff',
                backgroundColor: '#6c757d',
                border: '1px solid #6c757d',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Add a New Car
            </a>
          </li>
          <li>
            <a
              href="/history"
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                width: '125px',
                boxSizing: 'border-box',
                color: '#fff',
                backgroundColor: '#6c757d',
                border: '1px solid #6c757d',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              History
            </a>
          </li>
        </ul>
      </sidebar>

      <footer style={{ textAlign: 'center', marginTop: '70px', fontFamily: 'Arial Narrow, sans-serif' }}>
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
          <u>WELCOME MECHANIC</u>
        </p>
      </footer>
    </div>
  );
}

export default Home;