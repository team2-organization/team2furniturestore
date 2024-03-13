-- MySQL dump 10.13  Distrib 8.0.34, for macos13 (x86_64)
--
-- Host: aws.connect.psdb.cloud    Database: cosc-3380-team-project-db
-- ------------------------------------------------------
-- Server version	8.0.34-PlanetScale

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '553e7fad-c770-11ee-b5c0-72cdd3243572:1-465,
6da1d921-ba38-11ee-99b7-c6ed3cc2c981:1-152,
6dbbe5e4-ba38-11ee-abde-125c77f097b6:1-52,
c0ce45e7-bc6c-11ee-b552-527871fef0e7:1-59,
e05b88fb-c221-11ee-bc03-b64252a6b0f1:1-256,
e060fa26-c221-11ee-a07a-5a65eb06ed86:1-51';

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `addressID` int NOT NULL AUTO_INCREMENT,
  `streetNumber` varchar(7) NOT NULL,
  `streetName` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` smallint NOT NULL,
  `zipCode` smallint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`addressID`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `address_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `cartID` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `sessionID` varchar(100) NOT NULL,
  `isEmpty` tinyint(1) NOT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `total` bigint NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`cartID`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartItem`
--

DROP TABLE IF EXISTS `cartItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartItem` (
  `cartItemID` int NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `cart_id` bigint NOT NULL,
  `price` float NOT NULL DEFAULT '0',
  `sku` varchar(100) NOT NULL,
  `discount` float NOT NULL DEFAULT '0',
  `quantity` smallint DEFAULT '1',
  PRIMARY KEY (`cartItemID`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cartItem_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cartID`),
  CONSTRAINT `cartItem_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`productID`),
  CONSTRAINT `cartItem_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartItem`
--

LOCK TABLES `cartItem` WRITE;
/*!40000 ALTER TABLE `cartItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `cartItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `categoryID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `managerSsn` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`categoryID`),
  UNIQUE KEY `name` (`name`),
  KEY `managerSsn` (`managerSsn`),
  CONSTRAINT `category_ibfk_1` FOREIGN KEY (`managerSsn`) REFERENCES `employee` (`ssn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employeeID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(15) NOT NULL,
  `ssn` varchar(15) NOT NULL,
  `lastName` varchar(15) NOT NULL,
  `badgeNumber` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phoneNumber` int DEFAULT NULL,
  `dateOfHire` datetime NOT NULL,
  `myManagerID` int DEFAULT NULL,
  PRIMARY KEY (`employeeID`),
  UNIQUE KEY `ssn` (`ssn`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `myManagerID` (`myManagerID`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`myManagerID`) REFERENCES `managers` (`managerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `managers`
--

DROP TABLE IF EXISTS `managers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `managers` (
  `managerID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(15) NOT NULL,
  `lastName` varchar(15) NOT NULL,
  PRIMARY KEY (`managerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `managers`
--

LOCK TABLES `managers` WRITE;
/*!40000 ALTER TABLE `managers` DISABLE KEYS */;
/*!40000 ALTER TABLE `managers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderItem`
--

DROP TABLE IF EXISTS `orderItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderItem` (
  `orderItemID` int NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `orders_id` int DEFAULT NULL,
  `price` float NOT NULL DEFAULT '0',
  `sku` varchar(100) NOT NULL,
  `discount` float NOT NULL DEFAULT '0',
  `content` text NOT NULL,
  `quantity` smallint DEFAULT '1',
  PRIMARY KEY (`orderItemID`),
  KEY `orders_id` (`orders_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `orderItem_ibfk_1` FOREIGN KEY (`orders_id`) REFERENCES `orders` (`orderID`),
  CONSTRAINT `orderItem_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`productID`),
  CONSTRAINT `orderItem_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderItem`
--

LOCK TABLES `orderItem` WRITE;
/*!40000 ALTER TABLE `orderItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `orderID` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `total` float NOT NULL,
  `discount` int DEFAULT NULL,
  `paymentMethod_id` int DEFAULT NULL,
  `orderDate` datetime DEFAULT NULL,
  `tax` float DEFAULT NULL,
  PRIMARY KEY (`orderID`),
  KEY `paymentMethod_id` (`paymentMethod_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`paymentMethod_id`) REFERENCES `paymentMethod` (`paymentMethodID`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentMethod`
--

DROP TABLE IF EXISTS `paymentMethod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paymentMethod` (
  `paymentMethodID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`paymentMethodID`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `paymentMethod_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentMethod`
--

LOCK TABLES `paymentMethod` WRITE;
/*!40000 ALTER TABLE `paymentMethod` DISABLE KEYS */;
/*!40000 ALTER TABLE `paymentMethod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `productID` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` varchar(255) DEFAULT NULL,
  `image` varchar(225) NOT NULL,
  `brand` varchar(255) NOT NULL,
  `publishedAt` datetime DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `price` int NOT NULL DEFAULT '0',
  `rating` int NOT NULL,
  `reviewCount` int NOT NULL DEFAULT '0',
  `count` int NOT NULL DEFAULT '0',
  `category_id` int DEFAULT NULL,
  `employee_id` int NOT NULL,
  `sale_id` int DEFAULT NULL,
  `SKU` int NOT NULL,
  `createdAt` date DEFAULT NULL,
  PRIMARY KEY (`productID`),
  UNIQUE KEY `title` (`title`),
  KEY `employee_id` (`employee_id`),
  KEY `sale_id` (`sale_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeID`),
  CONSTRAINT `product_ibfk_2` FOREIGN KEY (`sale_id`) REFERENCES `sale` (`saleID`),
  CONSTRAINT `product_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `category` (`categoryID`),
  CONSTRAINT `product_chk_1` CHECK (((5 >= `rating`) >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productReview`
--

DROP TABLE IF EXISTS `productReview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productReview` (
  `productReviewID` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`productReviewID`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `productReview_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`userID`),
  CONSTRAINT `productReview_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`productID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productReview`
--

LOCK TABLES `productReview` WRITE;
/*!40000 ALTER TABLE `productReview` DISABLE KEYS */;
/*!40000 ALTER TABLE `productReview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale`
--

DROP TABLE IF EXISTS `sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale` (
  `saleID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `percentDiscount` int NOT NULL,
  `endDate` datetime NOT NULL,
  PRIMARY KEY (`saleID`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
/*!40000 ALTER TABLE `sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping`
--

DROP TABLE IF EXISTS `shipping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping` (
  `shippingID` varchar(10) DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `streetNumber` varchar(7) NOT NULL,
  `streetName` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` smallint NOT NULL,
  `zipCode` smallint NOT NULL,
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `shipping_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`userID`),
  CONSTRAINT `shipping_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`orderID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping`
--

LOCK TABLES `shipping` WRITE;
/*!40000 ALTER TABLE `shipping` DISABLE KEYS */;
/*!40000 ALTER TABLE `shipping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `supplierID` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `category_id` int DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `nextSupply` datetime DEFAULT NULL,
  `lastSupply` datetime NOT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`supplierID`),
  UNIQUE KEY `companyName` (`companyName`),
  KEY `category_id` (`category_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `supplier_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`categoryID`),
  CONSTRAINT `supplier_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`productID`),
  CONSTRAINT `supplier_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `transactionID` int NOT NULL AUTO_INCREMENT,
  `paymentMethod_id` int NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `authorized` tinyint(1) NOT NULL,
  `status` varchar(15) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`transactionID`),
  KEY `paymentMethod_id` (`paymentMethod_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`paymentMethod_id`) REFERENCES `paymentMethod` (`paymentMethodID`),
  CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userID` bigint NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `username` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(20) NOT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `registeredAt` datetime NOT NULL,
  `profile` text,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-02 12:02:41
