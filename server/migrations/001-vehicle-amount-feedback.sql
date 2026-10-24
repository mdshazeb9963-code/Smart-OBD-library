USE obd;

ALTER TABLE vehicles
  ADD COLUMN amount DECIMAL(10, 2) NULL;

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
