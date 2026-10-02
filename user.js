import React from 'react';
import { useNavigate } from 'react-router-dom';


function User() {
  const navigate = useNavigate();

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
         fontFamily: 'Poppins, ',
         backgroundColor: '#1321bef4',
         padding: '19px',
         borderRadius: '5px',
         marginTop: '4px',
         boxShadow: '0 4px 8px #0c0965f4',
       }}
      ><b>
       🛠️ WELCOME TO SMART OBD SMART LIBRARY SCANNER⚙️
       </b>
      </nav>
      <h2 align="center">Select Your user type</h2>
      <p align="center">And login!  </p>
      <br/>
      <div 
        style={{
          backgroundColor: 'rgba(242, 246, 249, 0.92)',
          padding: '75px',
          borderRadius: '12px',
          boxShadow: '0 8px 16px #205f7e',
          width: '350px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '19px',
        }}
      >
        <button
          onClick={() => navigate('/mechanic')}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#007bff', // blue
            color: '#fff',
            fontWeight: 'bold',
            width: '50%',
          }}
        >
          Mechanic
        </button>

        <button
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#3bd05e', // green
            color: '#fff',
            fontWeight: 'bold',
            width: '50%',
          }}
        >
          Customer
        </button>
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
            <li><a href="about.js" style={{ color: '#1495d5', textDecoration: 'underline' }}>About</a></li>
            <li><a href="contact.js" style={{ color: '#1495d5', textDecoration: 'underline' }}>Contact</a></li>
          </ul>
        </sidebar>
      </div>
      <footer style={{ textAlign: 'center', marginTop:70, fontFamily: 'Arial Narrow, sans-serif' }}>
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}><i>SELECT THE RIGHT BUTTON</i></p>
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}><u>If you are a mechanic, click Mechanic</u></p>
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}><u>If you are a customer, press Customer to continue</u></p>
      </footer>
      <footer>
      
      </footer>
    </div>
    
  );
}

export default User;