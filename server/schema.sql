CREATE DATABASE IF NOT EXISTS obd
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE obd;

CREATE TABLE IF NOT EXISTS vehicles (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  year SMALLINT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Available',
  code VARCHAR(8) NOT NULL DEFAULT '',
  license VARCHAR(40) NOT NULL,
  customer_name VARCHAR(120) NULL,
  phone VARCHAR(30) NOT NULL,
  odometer VARCHAR(40) NULL,
  fuel VARCHAR(40) NULL,
  amount DECIMAL(10, 2) NULL,
  image MEDIUMTEXT NULL,
  scan_report JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX vehicles_active_idx (deleted_at, id)
) ENGINE=InnoDB AUTO_INCREMENT=104;

CREATE TABLE IF NOT EXISTS workshop_about (
  id TINYINT UNSIGNED NOT NULL,
  content VARCHAR(180) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_feedback (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  vehicle_name VARCHAR(120) NOT NULL,
  customer_name VARCHAR(120) NULL,
  message VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX customer_feedback_created_idx (created_at, id)
) ENGINE=InnoDB;

INSERT INTO vehicles (id, name, year, status, code, license, phone, odometer, fuel)
VALUES
  (101, 'Toyota Corolla', 2022, 'Available', 'TC', '456-ABC', '', '82k mi', '75%'),
  (102, 'Honda Civic', 2021, 'Available', 'HC', '789-DEF', '', '45k mi', '58%'),
  (103, 'Ford Mustang', 2023, 'Available', 'FM', '101-XYZ', '', '112k mi', '40%')
ON DUPLICATE KEY UPDATE id = VALUES(id);

INSERT INTO workshop_about (id, content)
VALUES (1, 'Quick access to your vehicle reference library.')
ON DUPLICATE KEY UPDATE id = VALUES(id);
