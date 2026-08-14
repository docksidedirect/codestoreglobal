-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(30) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `avatar_url` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `role` ENUM('SUPERADMIN', 'TENANT_ADMIN', 'MEMBER', 'FREELANCER') NOT NULL DEFAULT 'MEMBER',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `language` VARCHAR(191) NOT NULL DEFAULT 'en',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'UTC',
    `paypal_email` VARCHAR(191) NULL,
    `github_url` VARCHAR(191) NULL,
    `linkedin_url` VARCHAR(191) NULL,
    `portfolio_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tenant_id` VARCHAR(30) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_tenant_id_idx`(`tenant_id`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenants` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `subdomain` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `industry` VARCHAR(191) NULL,
    `company_size` VARCHAR(191) NULL,
    `founded_year` INTEGER NULL,
    `website_url` VARCHAR(191) NULL,
    `logo_url` VARCHAR(191) NULL,
    `banner_url` VARCHAR(191) NULL,
    `status` ENUM('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `subscription_tier` ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE') NOT NULL DEFAULT 'FREE',
    `subscription_ends_at` DATETIME(3) NULL,
    `paypal_merchant_id` VARCHAR(191) NULL,
    `verification_doc_url` VARCHAR(191) NULL,
    `tax_id` VARCHAR(191) NULL,
    `billing_address` TEXT NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `social_links` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `owner_id` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `tenants_slug_key`(`slug`),
    UNIQUE INDEX `tenants_subdomain_key`(`subdomain`),
    INDEX `tenants_slug_idx`(`slug`),
    INDEX `tenants_subdomain_idx`(`subdomain`),
    INDEX `tenants_status_idx`(`status`),
    INDEX `tenants_subscription_tier_idx`(`subscription_tier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_invites` (
    `id` VARCHAR(30) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPERADMIN', 'TENANT_ADMIN', 'MEMBER', 'FREELANCER') NOT NULL DEFAULT 'MEMBER',
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tenant_id` VARCHAR(30) NOT NULL,
    `invited_by` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `tenant_invites_token_key`(`token`),
    UNIQUE INDEX `tenant_invites_tenant_id_email_key`(`tenant_id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(30) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `thumbnail_url` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `module_count` INTEGER NOT NULL DEFAULT 0,
    `duration_minutes` INTEGER NOT NULL DEFAULT 0,
    `difficulty` VARCHAR(191) NOT NULL DEFAULT 'BEGINNER',
    `rating` DECIMAL(3, 2) NULL,
    `enroll_count` INTEGER NOT NULL DEFAULT 0,
    `tags` JSON NULL,
    `prerequisites` JSON NULL,
    `learning_outcomes` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tenant_id` VARCHAR(30) NOT NULL,
    `instructor_id` VARCHAR(30) NOT NULL,

    INDEX `courses_tenant_id_idx`(`tenant_id`),
    INDEX `courses_is_published_idx`(`is_published`),
    UNIQUE INDEX `courses_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_modules` (
    `id` VARCHAR(30) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `order_index` INTEGER NOT NULL,
    `duration_minutes` INTEGER NOT NULL DEFAULT 0,
    `is_preview` BOOLEAN NOT NULL DEFAULT false,
    `video_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `course_id` VARCHAR(30) NOT NULL,

    INDEX `course_modules_course_id_idx`(`course_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `short_desc` VARCHAR(191) NULL,
    `category` ENUM('SAAS_TOOL', 'COMPONENT_LIBRARY', 'TEMPLATE', 'PLUGIN', 'API_SERVICE', 'EBOOK', 'COURSE_BUNDLE') NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `image_urls` JSON NULL,
    `download_url` VARCHAR(191) NULL,
    `demo_url` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sales_count` INTEGER NOT NULL DEFAULT 0,
    `rating` DECIMAL(3, 2) NULL,
    `tags` JSON NULL,
    `version` VARCHAR(191) NULL DEFAULT '1.0.0',
    `changelog` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tenant_id` VARCHAR(30) NOT NULL,
    `seller_id` VARCHAR(30) NOT NULL,

    INDEX `products_tenant_id_idx`(`tenant_id`),
    INDEX `products_category_idx`(`category`),
    INDEX `products_is_active_idx`(`is_active`),
    UNIQUE INDEX `products_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(30) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `author_id` VARCHAR(30) NOT NULL,
    `course_id` VARCHAR(30) NULL,
    `product_id` VARCHAR(30) NULL,

    INDEX `reviews_course_id_idx`(`course_id`),
    INDEX `reviews_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_listings` (
    `id` VARCHAR(30) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `requirements` TEXT NOT NULL,
    `responsibilities` TEXT NULL,
    `budget_min` DECIMAL(10, 2) NULL,
    `budget_max` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED') NOT NULL DEFAULT 'OPEN',
    `escrow_amount` DECIMAL(10, 2) NULL,
    `escrow_released` BOOLEAN NOT NULL DEFAULT false,
    `paypal_order_id` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `is_remote` BOOLEAN NOT NULL DEFAULT true,
    `skills_required` JSON NULL,
    `experience_level` VARCHAR(191) NULL,
    `deadline` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tenant_id` VARCHAR(30) NOT NULL,
    `posted_by_id` VARCHAR(30) NOT NULL,

    INDEX `job_listings_tenant_id_idx`(`tenant_id`),
    INDEX `job_listings_status_idx`(`status`),
    INDEX `job_listings_created_at_idx`(`created_at`),
    UNIQUE INDEX `job_listings_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_applications` (
    `id` VARCHAR(30) NOT NULL,
    `cover_letter` TEXT NOT NULL,
    `proposed_rate` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `attachments` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `job_id` VARCHAR(30) NOT NULL,
    `applicant_id` VARCHAR(30) NOT NULL,

    INDEX `job_applications_job_id_idx`(`job_id`),
    UNIQUE INDEX `job_applications_job_id_applicant_id_key`(`job_id`, `applicant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_rooms` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NULL,
    `type` ENUM('DIRECT', 'GROUP', 'CHANNEL') NOT NULL DEFAULT 'DIRECT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tenant_id` VARCHAR(30) NOT NULL,

    INDEX `chat_rooms_tenant_id_idx`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_participants` (
    `id` VARCHAR(30) NOT NULL,
    `room_id` VARCHAR(30) NOT NULL,
    `user_id` VARCHAR(30) NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_read_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `chat_participants_room_id_user_id_key`(`room_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` VARCHAR(30) NOT NULL,
    `content` TEXT NOT NULL,
    `room_id` VARCHAR(30) NOT NULL,
    `sender_id` VARCHAR(30) NOT NULL,
    `attachments` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `chat_messages_room_id_idx`(`room_id`),
    INDEX `chat_messages_sender_id_idx`(`sender_id`),
    INDEX `chat_messages_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(30) NOT NULL,
    `type` ENUM('SYSTEM', 'TENANT', 'JOB', 'PAYMENT', 'CHAT', 'APPROVAL') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(30) NOT NULL,
    `tenant_id` VARCHAR(30) NULL,

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_is_read_idx`(`is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_transactions` (
    `id` VARCHAR(30) NOT NULL,
    `paypal_order_id` VARCHAR(191) NOT NULL,
    `paypal_capture_id` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `platform_fee` DECIMAL(10, 2) NOT NULL,
    `seller_payout` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `type` ENUM('SUBSCRIPTION', 'PRODUCT_SALE', 'ESCROW_DEPOSIT', 'ESCROW_RELEASE', 'REFUND', 'PLATFORM_FEE') NOT NULL,
    `tenant_id` VARCHAR(30) NULL,
    `user_id` VARCHAR(30) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `platform_transactions_paypal_order_id_key`(`paypal_order_id`),
    INDEX `platform_transactions_paypal_order_id_idx`(`paypal_order_id`),
    INDEX `platform_transactions_tenant_id_idx`(`tenant_id`),
    INDEX `platform_transactions_status_idx`(`status`),
    INDEX `platform_transactions_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(30) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(30) NULL,
    `old_value` JSON NULL,
    `new_value` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(30) NULL,
    `tenant_id` VARCHAR(30) NULL,

    INDEX `audit_logs_tenant_id_idx`(`tenant_id`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forum_categories` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(191) NULL DEFAULT 'MessageCircle',
    `color` VARCHAR(191) NULL DEFAULT '#3b82f6',
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tenant_id` VARCHAR(30) NOT NULL,

    INDEX `forum_categories_tenant_id_idx`(`tenant_id`),
    INDEX `forum_categories_is_active_idx`(`is_active`),
    UNIQUE INDEX `forum_categories_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forum_threads` (
    `id` VARCHAR(30) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `content` TEXT NOT NULL,
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `is_locked` BOOLEAN NOT NULL DEFAULT false,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `post_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tenant_id` VARCHAR(30) NOT NULL,
    `category_id` VARCHAR(30) NOT NULL,
    `author_id` VARCHAR(30) NOT NULL,

    INDEX `forum_threads_tenant_id_idx`(`tenant_id`),
    INDEX `forum_threads_category_id_idx`(`category_id`),
    INDEX `forum_threads_is_pinned_idx`(`is_pinned`),
    INDEX `forum_threads_created_at_idx`(`created_at`),
    UNIQUE INDEX `forum_threads_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forum_posts` (
    `id` VARCHAR(30) NOT NULL,
    `content` TEXT NOT NULL,
    `is_solution` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `thread_id` VARCHAR(30) NOT NULL,
    `author_id` VARCHAR(30) NOT NULL,

    INDEX `forum_posts_thread_id_idx`(`thread_id`),
    INDEX `forum_posts_author_id_idx`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forum_votes` (
    `id` VARCHAR(30) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(30) NOT NULL,
    `thread_id` VARCHAR(30) NULL,
    `post_id` VARCHAR(30) NULL,

    UNIQUE INDEX `forum_votes_user_id_thread_id_key`(`user_id`, `thread_id`),
    UNIQUE INDEX `forum_votes_user_id_post_id_key`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_invites` ADD CONSTRAINT `tenant_invites_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_invites` ADD CONSTRAINT `tenant_invites_invited_by_fkey` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_modules` ADD CONSTRAINT `course_modules_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_listings` ADD CONSTRAINT `job_listings_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_listings` ADD CONSTRAINT `job_listings_posted_by_id_fkey` FOREIGN KEY (`posted_by_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `job_listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_participants` ADD CONSTRAINT `chat_participants_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_categories` ADD CONSTRAINT `forum_categories_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_threads` ADD CONSTRAINT `forum_threads_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_threads` ADD CONSTRAINT `forum_threads_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `forum_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_threads` ADD CONSTRAINT `forum_threads_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `forum_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_votes` ADD CONSTRAINT `forum_votes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_votes` ADD CONSTRAINT `forum_votes_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `forum_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forum_votes` ADD CONSTRAINT `forum_votes_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `forum_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
