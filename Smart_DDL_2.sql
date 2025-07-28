-- MySQL DDL for Smart WMS Backend

-- SMART_WMS 데이터베이스 생성 및 사용
CREATE DATABASE IF NOT EXISTS smart_wms;
USE smart_wms;

-- password 컬럼이 존재할 경우 삭제
#ALTER TABLE users DROP COLUMN password;


-- ─────────────────────────────────────────────
-- 1. 사용자 및 권한 관리
-- ─────────────────────────────────────────────
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER', -- Changed from MANAGER, WORKER to USER
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE', -- Changed from is_active BOOLEAN
    last_login DATETIME,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '시스템 사용자 정보';

-- ─────────────────────────────────────────────
-- 2. 거래처(회사) 관리
-- ─────────────────────────────────────────────
CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    company_code VARCHAR(50) UNIQUE,
    address VARCHAR(255),
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_number VARCHAR(50), -- Renamed from contact_phone
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT '회사(공급사/고객사) 공통 정보';

CREATE TABLE company_types (
    company_id INT,
    type ENUM('CLIENT', 'SUPPLIER') NOT NULL,
    PRIMARY KEY (company_id, type),
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
) COMMENT '회사 역할 다중 지정 테이블';

-- ─────────────────────────────────────────────
-- 3. 품목 및 창고 정보
-- ─────────────────────────────────────────────
CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'SKU 또는 품목 코드',
    item_name VARCHAR(150) NOT NULL,
    item_group VARCHAR(50),
    spec VARCHAR(100),
    barcode VARCHAR(50),
    unit VARCHAR(20) COMMENT '단위 (e.g., EA, BOX)',
    weight DECIMAL(10, 2),
    dimensions VARCHAR(100),
    unit_price_in DECIMAL(12, 2),
    unit_price_out DECIMAL(12, 2),
    safety_stock INT DEFAULT 0, -- Added safety_stock
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT '품목(상품) 정보';

CREATE TABLE warehouse_locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_code VARCHAR(50) NOT NULL UNIQUE,
    zone VARCHAR(50),
    rack VARCHAR(50),
    shelf VARCHAR(50),
    bin VARCHAR(50),
    capacity DECIMAL(10, 2)
) COMMENT '창고 내 위치 정보';

-- ─────────────────────────────────────────────
-- 4. 입출고 주문 및 상세 품목
-- ─────────────────────────────────────────────
CREATE TABLE inbound_orders (
    inbound_order_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    status ENUM('PENDING', 'RESERVED', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    expected_arrival_date DATE,
    actual_arrival_date DATETIME,
    notes TEXT, -- Added notes column
    created_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES companies(company_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) COMMENT '입고 요청 정보';

CREATE TABLE outbound_orders (
    outbound_order_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    status ENUM('PENDING', 'RESERVED', 'PICKING', 'PACKING', 'SHIPPED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    shipping_address VARCHAR(255),
    destination VARCHAR(255),
    requested_shipping_date DATE,
    actual_shipping_date DATETIME,
    notes TEXT, -- Added notes column
    created_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES companies(company_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) COMMENT '출고 요청 정보';

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    inbound_order_id INT,
    outbound_order_id INT,
    item_id INT NOT NULL,
    requested_quantity INT NOT NULL,
    processed_quantity INT DEFAULT 0,
    CONSTRAINT chk_order_type CHECK (inbound_order_id IS NOT NULL OR outbound_order_id IS NOT NULL),
    FOREIGN KEY (inbound_order_id) REFERENCES inbound_orders(inbound_order_id) ON DELETE CASCADE,
    FOREIGN KEY (outbound_order_id) REFERENCES outbound_orders(outbound_order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id)
) COMMENT '입출고 요청 품목 상세';

-- ─────────────────────────────────────────────
-- 5. 재고 및 트랜잭션
-- ─────────────────────────────────────────────
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (item_id, location_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(location_id)
) COMMENT '현재 재고 현황';

CREATE TABLE inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    from_location_id INT,
    to_location_id INT,
    quantity INT NOT NULL,
    transaction_type ENUM('INBOUND', 'OUTBOUND', 'MOVE', 'ADJUSTMENT') NOT NULL,
    order_item_id INT,
    user_id INT,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    FOREIGN KEY (from_location_id) REFERENCES warehouse_locations(location_id),
    FOREIGN KEY (to_location_id) REFERENCES warehouse_locations(location_id),
    FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) COMMENT '재고 트랜잭션 내역';

-- ─────────────────────────────────────────────
-- 6. 부가 기능 (알림, 스케줄, AMR)
-- ─────────────────────────────────────────────
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) COMMENT '사용자 알림';

CREATE TABLE schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start DATETIME NOT NULL, -- Renamed from start_time
    end DATETIME NOT NULL, -- Renamed from end_time
    all_day BOOLEAN DEFAULT FALSE, -- Added all_day
    schedule_type ENUM('INBOUND', 'OUTBOUND', 'INVENTORY_CHECK', 'MAINTENANCE') NOT NULL,
    related_order_id INT,
    assigned_to_user_id INT,
    status ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(user_id)
) COMMENT '창고 작업 일정';

CREATE TABLE amrs (
    amr_id INT AUTO_INCREMENT PRIMARY KEY,
    amr_name VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    status ENUM('IDLE', 'WORKING', 'CHARGING', 'MAINTENANCE', 'ERROR') NOT NULL DEFAULT 'IDLE',
    battery_level DECIMAL(5, 2),
    current_location_id INT,
    current_task_id INT,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_location_id) REFERENCES warehouse_locations(location_id)
) COMMENT '자율주행 로봇 상태 정보';
