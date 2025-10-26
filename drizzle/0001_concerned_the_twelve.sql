CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`userId` int NOT NULL,
	`checkIn` timestamp NOT NULL,
	`checkOut` timestamp NOT NULL,
	`guests` int NOT NULL,
	`totalPrice` int NOT NULL,
	`status` enum('pendente','confirmado','cancelado','concluido') NOT NULL DEFAULT 'pendente',
	`paymentStatus` enum('pendente','pago','reembolsado') NOT NULL DEFAULT 'pendente',
	`paymentMethod` varchar(50),
	`specialRequests` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`propertyId` int,
	`subject` varchar(255),
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`propertyType` enum('casa','apartamento','kitnet','sobrado','chacara') NOT NULL,
	`address` varchar(500) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`zipCode` varchar(10) NOT NULL,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`pricePerNight` int NOT NULL,
	`bedrooms` int NOT NULL,
	`bathrooms` int NOT NULL,
	`maxGuests` int NOT NULL,
	`area` int,
	`amenities` text,
	`images` text NOT NULL,
	`mainImage` text NOT NULL,
	`ownerId` int NOT NULL,
	`status` enum('disponivel','ocupado','manutencao') NOT NULL DEFAULT 'disponivel',
	`featured` boolean NOT NULL DEFAULT false,
	`rating` int DEFAULT 0,
	`reviewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`userId` int NOT NULL,
	`bookingId` int,
	`rating` int NOT NULL,
	`comment` text,
	`cleanliness` int,
	`accuracy` int,
	`communication` int,
	`location` int,
	`value` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;