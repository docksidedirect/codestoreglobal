-- Jobs monetization: featured listings + platform commission tracking
ALTER TABLE `job_listings`
  ADD COLUMN `featured` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `featured_until` DATETIME(3) NULL,
  ADD COLUMN `featured_fee` DECIMAL(10,2) NULL,
  ADD COLUMN `commission_rate` DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  ADD COLUMN `commission_amount` DECIMAL(10,2) NULL,
  ADD COLUMN `commission_status` ENUM('UNPAID','INVOICED','PAID','WAIVED') NOT NULL DEFAULT 'UNPAID';

CREATE INDEX `job_listings_featured_featured_until_idx` ON `job_listings`(`featured`, `featured_until`);

ALTER TABLE `platform_transactions` MODIFY COLUMN `type` ENUM('SUBSCRIPTION','PRODUCT_SALE','ESCROW_DEPOSIT','ESCROW_RELEASE','REFUND','PLATFORM_FEE','JOB_FEATURE_FEE','JOB_COMMISSION') NOT NULL;
