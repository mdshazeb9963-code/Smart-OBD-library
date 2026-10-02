import React from 'react';

const cars = [
  { name: 'Toyota Corolla', year: '2022', status: 'Available' },
  { name: 'Honda Civic', year: '2021', status: 'Available' },
  { name: 'Ford Mustang', year: '2023', status: 'Available' },
];

function Cars() {
  return (
    <div>
      <nav
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#F4EFC7',
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: 'Poppins, sans-serif',
          backgroundColor: '#1321bef4',
          padding: '12px',
          borderRadius: '5px',
          marginTop: '4px',
          boxShadow: '0 4px 8px #0c0965f4',
        }}
      >
        <b>AVAILABLE CARS</b>
      </nav>

      <h2 align="center">Available Cars</h2>
      <p align="center">Select a car to view its details</p>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          margin: '35px 30px',
        }}
      >
        {cars.map((car) => (
          <article
            key={car.name}
            style={{
              backgroundColor: 'rgba(242, 246, 249, 0.92)',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 8px 16px #205f7e',
              width: '220px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '58px' }} aria-hidden="true">🚗</div>
            <h3 style={{ color: '#205f7e', margin: '12px 0' }}>{car.name}</h3>
            <p style={{ margin: '8px 0' }}><b>Year:</b> {car.year}</p>
            <p style={{ margin: '8px 0', color: '#198754', fontWeight: 'bold' }}>
              {car.status}
            </p>
          </article>
        ))}
      </div>

      <sidebar
        style={{
          position: 'fixed',
          top: '76px',
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
          <li><a href="/cars" style={{ color: '#1495d5', textDecoration: 'underline' }}>Cars</a></li>
          <li><a href="/add-car" style={{ color: '#1495d5', textDecoration: 'underline' }}>Add a New Car</a></li>
          <li><a href="/history" style={{ color: '#1495d5', textDecoration: 'underline' }}>History</a></li>
        </ul>
      </sidebar>
    </div>
  );
}

export default Cars;
