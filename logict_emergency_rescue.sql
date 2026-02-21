-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: logict
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add user',6,'add_user'),(22,'Can change user',6,'change_user'),(23,'Can delete user',6,'delete_user'),(24,'Can view user',6,'view_user'),(25,'Can add course',7,'add_course'),(26,'Can change course',7,'change_course'),(27,'Can delete course',7,'delete_course'),(28,'Can view course',7,'view_course'),(29,'Can add feedback',8,'add_feedback'),(30,'Can change feedback',8,'change_feedback'),(31,'Can delete feedback',8,'delete_feedback'),(32,'Can view feedback',8,'view_feedback'),(33,'Can add hints',9,'add_hints'),(34,'Can change hints',9,'change_hints'),(35,'Can delete hints',9,'delete_hints'),(36,'Can view hints',9,'view_hints'),(37,'Can add pretest question',10,'add_pretestquestion'),(38,'Can change pretest question',10,'change_pretestquestion'),(39,'Can delete pretest question',10,'delete_pretestquestion'),(40,'Can view pretest question',10,'view_pretestquestion'),(41,'Can add quiz',11,'add_quiz'),(42,'Can change quiz',11,'change_quiz'),(43,'Can delete quiz',11,'delete_quiz'),(44,'Can view quiz',11,'view_quiz'),(45,'Can add quiz question',12,'add_quizquestion'),(46,'Can change quiz question',12,'change_quizquestion'),(47,'Can delete quiz question',12,'delete_quizquestion'),(48,'Can view quiz question',12,'view_quizquestion'),(49,'Can add quiz response',13,'add_quizresponse'),(50,'Can change quiz response',13,'change_quizresponse'),(51,'Can delete quiz response',13,'delete_quizresponse'),(52,'Can view quiz response',13,'view_quizresponse'),(53,'Can add pretest response',14,'add_pretestresponse'),(54,'Can change pretest response',14,'change_pretestresponse'),(55,'Can delete pretest response',14,'delete_pretestresponse'),(56,'Can view pretest response',14,'view_pretestresponse'),(57,'Can add pretest',15,'add_pretest'),(58,'Can change pretest',15,'change_pretest'),(59,'Can delete pretest',15,'delete_pretest'),(60,'Can view pretest',15,'view_pretest'),(61,'Can add module',16,'add_module'),(62,'Can change module',16,'change_module'),(63,'Can delete module',16,'delete_module'),(64,'Can view module',16,'view_module'),(65,'Can add enrollment',17,'add_enrollment'),(66,'Can change enrollment',17,'change_enrollment'),(67,'Can delete enrollment',17,'delete_enrollment'),(68,'Can view enrollment',17,'view_enrollment'),(69,'Can add profiling archetype',18,'add_profilingarchetype'),(70,'Can change profiling archetype',18,'change_profilingarchetype'),(71,'Can delete profiling archetype',18,'delete_profilingarchetype'),(72,'Can view profiling archetype',18,'view_profilingarchetype'),(73,'Can add pedagogy level',19,'add_pedagogylevel'),(74,'Can change pedagogy level',19,'change_pedagogylevel'),(75,'Can delete pedagogy level',19,'delete_pedagogylevel'),(76,'Can view pedagogy level',19,'view_pedagogylevel'),(77,'Can add Student Class',20,'add_studentclass'),(78,'Can change Student Class',20,'change_studentclass'),(79,'Can delete Student Class',20,'delete_studentclass'),(80,'Can view Student Class',20,'view_studentclass'),(81,'Can add material',21,'add_material'),(82,'Can change material',21,'change_material'),(83,'Can delete material',21,'delete_material'),(84,'Can view material',21,'view_material'),(85,'Can add Quiz Result',22,'add_quizresult'),(86,'Can change Quiz Result',22,'change_quizresult'),(87,'Can delete Quiz Result',22,'delete_quizresult'),(88,'Can view Quiz Result',22,'view_quizresult');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_course`
--

DROP TABLE IF EXISTS `core_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_course` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` longtext NOT NULL,
  `metadata` longtext DEFAULT NULL,
  `thumbnail` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_course`
--

LOCK TABLES `core_course` WRITE;
/*!40000 ALTER TABLE `core_course` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_enrollment`
--

DROP TABLE IF EXISTS `core_enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_enrollment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `progress` double NOT NULL,
  `course_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `enrolled_at` datetime(6) NOT NULL,
  `quiz_completed` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_enrollment_user_id_course_id_0fb0d47c_uniq` (`user_id`,`course_id`),
  KEY `core_enrollment_course_id_fe1f9f12_fk_core_course_id` (`course_id`),
  CONSTRAINT `core_enrollment_course_id_fe1f9f12_fk_core_course_id` FOREIGN KEY (`course_id`) REFERENCES `core_course` (`id`),
  CONSTRAINT `core_enrollment_user_id_676c05fa_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_enrollment`
--

LOCK TABLES `core_enrollment` WRITE;
/*!40000 ALTER TABLE `core_enrollment` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_enrollment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_feedback`
--

DROP TABLE IF EXISTS `core_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_feedback` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `feedback` longtext NOT NULL,
  `quiz_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_feedback_quiz_id_f1a00d75_fk_core_quiz_id` (`quiz_id`),
  CONSTRAINT `core_feedback_quiz_id_f1a00d75_fk_core_quiz_id` FOREIGN KEY (`quiz_id`) REFERENCES `core_quiz` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_feedback`
--

LOCK TABLES `core_feedback` WRITE;
/*!40000 ALTER TABLE `core_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_hints`
--

DROP TABLE IF EXISTS `core_hints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_hints` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `hintText` longtext NOT NULL,
  `quiz_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_hints_quiz_id_63ab8c7f_fk_core_quiz_id` (`quiz_id`),
  CONSTRAINT `core_hints_quiz_id_63ab8c7f_fk_core_quiz_id` FOREIGN KEY (`quiz_id`) REFERENCES `core_quiz` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_hints`
--

LOCK TABLES `core_hints` WRITE;
/*!40000 ALTER TABLE `core_hints` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_hints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_material`
--

DROP TABLE IF EXISTS `core_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_material` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `week` int(11) NOT NULL,
  `file` varchar(100) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `course_id` bigint(20) NOT NULL,
  `description` longtext DEFAULT NULL,
  `file_type` varchar(10) NOT NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_material_course_id_ebfa24e2_fk_core_course_id` (`course_id`),
  CONSTRAINT `core_material_course_id_ebfa24e2_fk_core_course_id` FOREIGN KEY (`course_id`) REFERENCES `core_course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_material`
--

LOCK TABLES `core_material` WRITE;
/*!40000 ALTER TABLE `core_material` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_module`
--

DROP TABLE IF EXISTS `core_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_module` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `content` varchar(100) DEFAULT NULL,
  `course_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_module_course_id_2aa5c263_fk_core_course_id` (`course_id`),
  CONSTRAINT `core_module_course_id_2aa5c263_fk_core_course_id` FOREIGN KEY (`course_id`) REFERENCES `core_course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_module`
--

LOCK TABLES `core_module` WRITE;
/*!40000 ALTER TABLE `core_module` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_pedagogylevel`
--

DROP TABLE IF EXISTS `core_pedagogylevel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_pedagogylevel` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `level` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_pedagogylevel`
--

LOCK TABLES `core_pedagogylevel` WRITE;
/*!40000 ALTER TABLE `core_pedagogylevel` DISABLE KEYS */;
INSERT INTO `core_pedagogylevel` VALUES (1,1,'Clear learning intention'),(2,2,'Connect learning'),(3,3,'Chunk and sequence learning'),(4,4,'Check for understanding'),(5,5,'Affirmative and corrective feedback'),(6,6,'Opportunity to practise & review');
/*!40000 ALTER TABLE `core_pedagogylevel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_pretest`
--

DROP TABLE IF EXISTS `core_pretest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_pretest` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `score` double NOT NULL,
  `result` varchar(100) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_pretest_user_id_841170d5_fk_core_user_id` (`user_id`),
  CONSTRAINT `core_pretest_user_id_841170d5_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_pretest`
--

LOCK TABLES `core_pretest` WRITE;
/*!40000 ALTER TABLE `core_pretest` DISABLE KEYS */;
INSERT INTO `core_pretest` VALUES (9,0,'Profiling In Progress',5),(10,6,'6PAR',5);
/*!40000 ALTER TABLE `core_pretest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_pretestquestion`
--

DROP TABLE IF EXISTS `core_pretestquestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_pretestquestion` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `question` longtext NOT NULL,
  `type` varchar(30) NOT NULL,
  `score` double NOT NULL,
  `result` varchar(100) DEFAULT NULL,
  `option` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`option`)),
  `correctAns` longtext NOT NULL,
  `scaleMin` int(11) NOT NULL,
  `scaleMax` int(11) NOT NULL,
  `category` varchar(30) NOT NULL,
  `level` int(11) NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  `weight_abstraction` double NOT NULL,
  `weight_algorithm` double NOT NULL,
  `weight_decomposition` double NOT NULL,
  `weight_pattern` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_pretestquestion`
--

LOCK TABLES `core_pretestquestion` WRITE;
/*!40000 ALTER TABLE `core_pretestquestion` DISABLE KEYS */;
INSERT INTO `core_pretestquestion` VALUES (31,'Sebuah keluarga ingin mengemas apel sesuai aturan sebagai berikut: \\n\n1. Apel ditaruh di kantong. Setiap kantong diisi dengan 8 apel. Jika tersisa kurang dari 8 apel, apel dibiarkan tidak dikemas. \\n\n2. Kantong akan dimasukkan ke kardus, Setiap kardus berisi 8 kantong. Jika tersisa kurang dari 8 kantong, kantong yang tersisa tidak dimasukkan ke kardus. \\n\nApabila mereka panen 275 apel. \\n Ada berapa banyak apel yang tidak dimasukkan ke kantong?','multiple_choice',1,NULL,'[\"6\", \"1\", \"7\", \"3\"]','3',0,10,'PROFILING_PEDAGOGY',1,'',0.3,0.4,0.1,0.2),(32,'Terdapat 12 spot parkir dengan kode 1 hingga 12 dengan ketentuan spot yang terisi sebagai berikut:\\n\nSenin -> 1 - 3 - 6 - 9 - 11\\n\nSelasa -> 1 - 4 -10 - 11 - 12\\n\nBerapa jumlah spot parkir yang tidak terisi pada hari senin dan selasa?','multiple_choice',1,NULL,'[\"3\", \"6\", \"4\", \"5\"]','4',0,10,'PROFILING_PEDAGOGY',1,'',0.1,0.3,0.4,0.2),(33,'Apabila terdapat 4 kaleng cat dengan warna sebagai berikut:\\n\nMerah (M) -> Cukup untuk 5 pagar\\n\nHijau (H) -> Cukup untuk 3 pagar\\n\nKuning (K) -> Cukup untuk 7 pagar\\n\nBiru (B) -> Cukup untuk 2 pagar.\\n\nUrutan pengecatan -> M-H-K-B-dst\\n\nBerapa pagar yang dapat dicat apabila tidak boleh ada pagar berdampingan dengan warna yang sama?','multiple_choice',1,NULL,'[\"8\", \"17\", \"15\", \"5\"]','15',0,10,'PROFILING_PEDAGOGY',1,'',0.25,0.4,0.1,0.25),(34,'','multiple_choice',1,NULL,'[\"Apakah lengan panjang\", \"Apakah ada kancingnya\", \"Apakah ada resletingnya\", \"Apakah ada sakunya\"]','Apakah ada kancingnya',0,10,'PROFILING_PEDAGOGY',1,'questions/4.png',0.25,0.25,0.15,0.35),(35,'','multiple_choice',1,NULL,'[\"2\", \"3\", \"5\", \"Tidak mungkin mengunjungi semua petak\"]','3',0,10,'PROFILING_PEDAGOGY',1,'questions/5.png',0.15,0.3,0.25,0.3),(36,'Bella mempunyai banyak balon. Ia selalu menaruh balonnya dalam posisi sebuah barisan sehingga urutan warnanya sama jika dilihat dari ujung kiri ke kanan, maupun dari ujung kanan ke kiri. Sayangnya, ia hanya bisa melihat 4 warna berbeda yaitu hijau (G), kuning (Y), merah (R) and biru (B). Bagi Bella, ungu (P) tampak sama dengan kuning (Y). \\n Barisan balon manakah yang urutannya terlihat sama di mata bella?','multiple_choice',1,NULL,'[\"YPBGBYP\", \"GRYPYPG\", \"BGRYPGB\", \"PGGGBGY\"]','YPBGBYP',0,10,'PROFILING_PEDAGOGY',2,'',0.15,0.5,0.25,0.1),(37,'','multiple_choice',1,NULL,'[\"7_a.png\", \"7_b.png\", \"7_c.png\", \"7_d.png\"]','15',0,10,'PROFILING_PEDAGOGY',2,'questions/7.png',0.2,0.3,0.2,0.3),(38,'Ali mengumpulkan sejumlah batang kayu dengan panjang 10m dan ingin memberikan batang kayu dengan jumlah sesedikit mungkin kepada Joni.\\n\nApabila Joni membutuhkan 7 batang kayu dengan panjang 4m dan 7 batang kayu dengan panjang 3m, berapa banyak kayu paling sedikit yang perlu dikumpulkan oleh Ali?','multiple_choice',1,NULL,'[\"5\", \"6\", \"7\", \"8\"]','6',0,10,'PROFILING_PEDAGOGY',2,'',0.1,0.5,0.25,0.15),(39,'','multiple_choice',1,NULL,'[\"A\", \"B\", \"C\", \"D\"]','B',0,10,'PROFILING_PEDAGOGY',2,'questions/9.png',0.25,0.25,0.25,0.25),(40,'','multiple_choice_image',1,NULL,'[\"10_a.png\", \"10_b.png\", \"10_c.png\", \"10_d.png\"]','10_c.png',0,10,'PROFILING_PEDAGOGY',2,'questions/10.png',0.2,0.3,0.2,0.3),(41,'Apabila terdapat 3 baris bunga dengan urutan sebagai berikut:\\n\n1. pagar - A - B - C - D \\n\n2. pagar - A - C - B - A \\n\n3. pagar - D - B - A - C \\n\nManakah urutan bunga yang sesuai apabila bunga B harus berada lebih dekat dengan pagar dibandingkan bunga C','multiple_choice',1,NULL,'[\"Baris 1\", \"Baris 1 dan 2\", \"Baris 1 dan 3\", \"Semua baris\"]','Baris 1 dan 3',0,10,'PROFILING_PEDAGOGY',2,'',0.25,0.15,0.15,0.45),(42,'Terdapat sebuah kata dengan contoh penulisan sebagai berikut:\\n\n1. A\\n\n2. B\\n\n3. C\\n\n4. ABA\\n\n5. CBC\\n\nManakah dari opsi jawaban berikut yang tidak sesuai dengan contoh penulisan yang ada?','multiple_choice',1,NULL,'[\"BBBABBBB\", \"AAA\", \"CBAABC\", \"BCABBACB\"]','BBBABBBB',0,10,'PROFILING_PEDAGOGY',2,'',0.3,0.1,0.1,0.5),(43,'Sebuah toko bunga memiliki 4 jenis bunga dengan kode A, B, C, dan D serta 3 warna dengan kode 1, 2, 3. Apabila terdapat pembeli dengan keinginan sebagai berikut:\\n\n1. Setiap warna muncul 2 kali\\n\n2. Tidak boleh ada bunga berjenis sama dengan warna yang sama\\n\n3. Paling banyak hanya 2 bunga untuk tiap jenisnya pada satu rangkaian\\n\nOpsi rangkaian mana yang sesuai dengan keinginan pembeli tersebut?','multiple_choice',1,NULL,'[\"A1 - B2 - B1 - C3 - D2 - C1\", \"A2 - B2- A3 - B1 - D3 - A1\", \"A1 - B2 - D3 - D3 - B1 - C2\", \"A1 - B2 - C3 - D3 - B1 - D2\"]','A1 - B2 - C3 - D3 - B1 - D2',0,10,'PROFILING_PEDAGOGY',2,'',0.15,0.35,0.25,0.25),(44,'Beba ingin memakan permen loli sebanyak mungkin. Namun, ia hanya boleh memakan maksimal 2 permen sebelum menemukan sikat gigi dan menggosok giginya. Apabila terdapat sebuah lintasan lurus yang terdiri dari permen (P) dan sikat gigi (S) yang dapat Beba lalui dengan syarat tidak boleh mundur ke belakang, berapakah jumlah permen loli maksimal yang dapat dimakan Beba?\\n\nLintasan:\\n\nmulai - P - S - P - P - S - S - P - P - P - S - P - selesai','multiple_choice',1,NULL,'[\"3\", \"5\", \"6\", \"7\"]','6',0,10,'PROFILING_PEDAGOGY',2,'',0.15,0.3,0.25,0.3),(45,'','multiple_choice',1,NULL,'[\"3\", \"4\", \"6\", \"7\"]','3',0,10,'PROFILING_PEDAGOGY',2,'questions/15.png',0.25,0.15,0.15,0.45),(46,'','multiple_choice',1,NULL,'[\"INFORMATION IS COOL\", \"INFORMATICS IS COOL\", \"MATHEMATICS IS COOL\", \"INFORMATION SECRET\"]','INFORMATICS IS COOL',0,10,'PROFILING_PEDAGOGY',2,'questions/16.png',0.25,0.2,0.2,0.35),(47,'','multiple_choice',1,NULL,'[\"1 batu putih\", \"2 batu putih\", \"3 batu putih\", \"tidak peduli berapapun batu\"]','3 batu putih',0,10,'PROFILING_PEDAGOGY',2,'questions/17.png',0.2,0.3,0.25,0.25),(48,'','multiple_choice_image',1,NULL,'[\"18_a.png\", \"18_b.png\", \"18_c.png\", \"18_d.png\"]','18_c.png',0,10,'PROFILING_PEDAGOGY',2,'questions/18.png',0.15,0.2,0.2,0.45),(49,'','multiple_choice_image',1,NULL,'[\"19_a.png\", \"19_b.png\", \"19_c.png\", \"19_d.png\"]','19_b.png',0,10,'PROFILING_PEDAGOGY',2,'questions/19.png',0.15,0.25,0.15,0.45),(50,'','multiple_choice_image',1,NULL,'[\"20_a.png\", \"20_b.png\", \"20_c.png\", \"20_d.png\"]','20_b.png',0,10,'PROFILING_PEDAGOGY',2,'questions/20.png',0.2,0.2,0.2,0.4),(51,'','multiple_choice',1,NULL,'[\"4\", \"5\", \"6\", \"7\", \"8\"]','7',0,10,'PROFILING_PEDAGOGY',2,'questions/21.png',0.15,0.35,0.2,0.3),(52,'','multiple_choice',1,NULL,'[\"Start\\nUlangi 4{\\n  Ulangi 4{Tanam;Maju(2)}\\n  KeKanan(90)\\n}\\nStop\", \"Start\\nUlangi 4{\\n  Ulangi 4{Tanam;Maju(2)}\\n  KeKiri(90)\\n}\\nStop\", \"Start\\nUlangi 4{\\n  Ulangi 4{Maju(2);Tanam}\\n  KeKiri(90)\\n}\\nStop\", \"Start\\nUlangi 4{\\n  Ulangi 4{Maju(1);Tanam}\\n  KeKanan(90)\\n}\\nStop\"]','Start       \nUlangi 4{            \nUlangi 4{Tanam; Maju(2)},           \nKeKanan(90)}  \nStop',0,10,'PROFILING_PEDAGOGY',2,'questions/22.png',0.25,0.2,0.15,0.4),(53,'','multiple_choice_image',1,NULL,'[\"24_a.png\", \"24_b.png\", \"24_c.png\", \"24_d.png\"]','24_b.png',0,10,'PROFILING_PEDAGOGY',2,'questions/24.png',0.25,0.25,0.2,0.3),(54,'','multiple_choice_image',1,NULL,'[\"25_a.png\", \"25_b.png\", \"25_c.png\", \"25_d.png\"]','25_b.png',0,10,'PROFILING_PEDAGOGY',2,'questions/25.png',0.15,0.3,0.25,0.3),(55,'','multiple_choice',1,NULL,'[\"Wira-Wiri\", \"Biasa\", \"Cepat\", \"Express\"]','Wara-Wiri',0,10,'PROFILING_PEDAGOGY',2,'questions/26.png',0.25,0.25,0.15,0.35),(56,'','multiple_choice_image',1,NULL,'[\"27_a.png\", \"27_b.png\", \"27_c.png\", \"27_d.png\"]','27_b.png',0,10,'PROFILING_PEDAGOGY',2,'questions/27.png',0.3,0.2,0.15,0.35),(57,'','multiple_choice',1,NULL,'[\"Bob, Vino, Desi\", \"Vino, Ari, Rosa\", \"Ari, Kati, Vino\", \"Ari, Vino, Bob\"]','Ari, Kati, Vino',0,10,'PROFILING_PEDAGOGY',2,'questions/28.png',0.25,0.25,0.15,0.35),(58,'Pada suatu hari yang cerah, Maya, David, Iva, dan Marko bermain sepak bola. Malangnya, salah satu melempar bola dan memecahkan kaca kelas. Bu Guru ingin tahu siapa yang menyebabkan kaca jendela tsb pecah. Bu Guru mengenal dengan baik bahwa tiga di antara anak tersebut tidak pernah bohong. Tapi ia tidak yakin siapa yang bersalah.\\n\nAnak-anak tersebut berkata secara berurutan :\\n\n Marko: Bukan saya yang memecahkan kaca\\n\n Iva: Marko atau David yang memecahkan kaca\\n\n Maya: David yang memecahkan kaca\\n\n David: bukan saya, Maya bohong!\\n\nTantangan:\\n\nSiapa yang memecahkan kaca jendela?','multiple_choice',1,NULL,'[\"David\", \"Marko\", \"Maya\", \"Iva\"]','David',0,10,'PROFILING_PEDAGOGY',2,'',0.3,0.2,0.1,0.4),(59,'','multiple_choice',1,NULL,'[\"A1 B1 B2 B3 C3 D3 D4 D5 D6 E6 F6\", \"A1 B1 B2 B3 C3 D3 E3 E4 F4 F5 F6\", \"A1 B1 B2 B3 C3 D3 E3 F3 F4 F5 F6\", \"A1 B1 B2 B3 B4 C4 D4 D5 D6 E6 F6\"]','A1 B1 B2 B3 C3 D3 E3 F3 F4 F5 F6',0,10,'PROFILING_PEDAGOGY',2,'questions/30.png',0.2,0.3,0.25,0.25),(60,'','multiple_choice',1,NULL,'[\"1\", \"2\", \"3\", \"4\", \"5\", \"6\"]','3',0,10,'PROFILING_PEDAGOGY',3,'questions/31.png',0.3,0.2,0.1,0.4),(61,'','multiple_choice',1,NULL,'[\"Harus dicat warna merah\", \"Harus dicat warna biru\", \"Harus dicat warna hijau\", \"Boleh memilih biru atau hijau\"]','Harus dicat warna biru',0,10,'PROFILING_PEDAGOGY',3,'questions/32.png',0.15,0.25,0.25,0.35),(62,'','multiple_choice',1,NULL,'[\"6\", \"7\", \"8\", \"9\", \"10\", \"11\"]','8',0,10,'PROFILING_PEDAGOGY',4,'questions/33.png',0.25,0.25,0.2,0.3),(63,'','multiple_choice',1,NULL,'[\"OUT(H2)-IN(C2);OUT(H9)-IN(C9);OUT(C9)-IN(C2);OUT(H9)-IN(C2)\", \"OUT(C2)-IN(H9);OUT(H2)-IN(C9);OUT(C2)-IN(H2);OUT(C9)-IN(H9)\", \"OUT(H9)-IN(C9);OUT(H9)-IN(H2);OUT(C2)-IN(H2);OUT(C9)-IN(H2)\", \"OUT(C2)-IN(C9);OUT(H2)-IN(H9);OUT(C2)-IN(H2);OUT(C9)-IN(H9)\"]','OUT(C2)-IN(H9);OUT(H2)-IN(C9);OUT(C2)-IN(H2);OUT(C9)-IN(H9)',0,10,'PROFILING_PEDAGOGY',4,'questions/34.png',0.2,0.35,0.25,0.2),(64,'Terdapat sebuah pesan yang diubah menjadi kode sebagai berikut:\\n\nMEET\\n\nB I LL\\n\nYBEA\\n\nVERA\\n\nT6XX\\n\nMEETBILLYBEAVERAT6 -> MBYVTEIBE6ELERXTLAAX\\n\nApabila terdapat sebuah kode sebagai berikut, OIERKLTEILH!WBEX. Apa pesan asli yang ingin disampaikan?\\n','multiple_choice',1,NULL,'[\"OKWHERETOMEET!\", \"OKIWILLBETHERE!\", \"WILLYOUBETHERETOO?\", \"OKIWILLMEETHIM!\"]','OKIWILLBETHERE!',0,10,'PROFILING_PEDAGOGY',5,'',0.2,0.3,0.2,0.3),(65,'','multiple_choice_image',1,NULL,'[\"36_a.png\", \"36_b.png\", \"36_c.png\", \"36_d.png\"]','36_c.png',0,10,'PROFILING_PEDAGOGY',5,'questions/36.png',0.25,0.25,0.25,0.25),(66,'Terdapat kumpulan bantal dengan berbagai huruf sebagai berikut:\\n\nC A B A F\\n\nD F C E C\\n\nB A F A\\n\nC E B C A\\n\nApabil sebuah tim hanya dapat dibentuk dari 3 pemain dengan huruf bantal yang sama. Maka berapakah total tim yang dapat dibentuk dan total bantal yang tidak digunakan?','multiple_choice',1,NULL,'[\"1 tim, 13 bantal\", \"2 tim, 10 bantal\", \"3 tim, 10 bantal\", \"4 tim, 7 bantal\"]','4 tim, 7 bantal',0,10,'PROFILING_PEDAGOGY',5,'',0.2,0.3,0.25,0.25),(67,'Terdapat sebuah lintasan lingkaran dengan panjang 15 posisi melangkah. Kode posisi dimulai dari angka 0 dan diakhiri dengan angka 14. Pada lintasan tersebut, terdapat 3 hewan yang ingin berkompetisi dengan panjang langkah sebagai berikut:\\n\nA -> maju 5 posisi tiap 1 tiupan peluit\\n\nB -> maju 3 posisi tiap 1 tiupan peluit\\n\nC -> maju 2 posisi tiap 1 tiupan peluit\\n\nApabila salah satu hewan telah mencapai posisi 14, maka ia akan kembali ke posisi 0 pada langkah berikutnya dan akan berulang hingga pertandingan selesai. Seluruh posisi awal hewan adalah di posisi 0, apabila pertandingan dilaksanakan dengan 4 tiupan peluit, maka dimanakan posisi tiap hewan yang bertanding?','multiple_choice',1,NULL,'[\"A-3, B-5, C-9\", \"A-5, B-12, C-8\", \"A-9, B-1, C-4\", \"A-20, B-12, C-8\"]','A-5, B-12, C-8',0,10,'PROFILING_PEDAGOGY',5,'',0.2,0.35,0.15,0.3),(68,'','multiple_choice',1,NULL,'[\"4\", \"3\", \"2\", \"1\"]','4',0,10,'PROFILING_PEDAGOGY',5,'questions/39.png',0.2,0.3,0.25,0.25),(69,'','multiple_choice',1,NULL,'[\"1\", \"2\", \"3\", \"4\"]','3',0,10,'PROFILING_PEDAGOGY',5,'questions/40.png',0.1,0.3,0.3,0.3),(70,'','multiple_choice',1,NULL,'[\"41_a.png\", \"41_b.png\", \"41_c.png\", \"41_d.png\"]','41_c.png',0,10,'PROFILING_PEDAGOGY',5,'questions/41.png',0.25,0.3,0.2,0.25),(71,'','short_answer',1,NULL,'[]','41',0,10,'PROFILING_PEDAGOGY',5,'questions/42.png',0.2,0.35,0.25,0.2),(72,'','short_answer',1,NULL,'[]','23',0,10,'PROFILING_PEDAGOGY',5,'questions/43.png',0.2,0.3,0.2,0.3),(73,'','short_answer',1,NULL,'[]','2',0,10,'PROFILING_PEDAGOGY',5,'questions/44.png',0.25,0.25,0.15,0.35),(74,'Terdapat mainan dengan berbagai ukuran sebagai berikut:\\n\n1. 20x20\\n\n2. 25x30\\n\n3. 40x40\\n\n4. 10x10\\n\n5. 50x35\\n\n6. 35x45\\n\nApabila mainan yang lebih kecil dapat dimasukkan ke mainan yang lebih besar, berikan urutan nomor mainan dari yang terluar hingga terdalam! (Pilih kemungkinan dengan jumlah mainan terbanyak)\\n\nNote: Tidak semua mainan dapat dimasukkan','multiple_choice',1,NULL,'[\"5-6-2-4-1-3\", \"5-2-1-4\", \"6-5-3-2-1-4\", \"3-5-2-1-4\"]','5-2-1-4',0,10,'PROFILING_PEDAGOGY',6,'',0.15,0.25,0.25,0.35),(75,'Terdapat 5 warna mobil berbeda dengan jumlah mobil sebagai berikut:\\n\nPutih -> Biru - 7\\n\nMerah -> 24\\n\nHitam -> Biru + 5\\n\nBiru -> Merah - 9\\n\nHijau -> Hitam - 7\\n\nApabila terdapat diagram batang terurut dengan posisi mobil merah di paling kanan. Mobil apakah yang terletak pada diagram batang ke-3 dari kiri?','multiple_choice',1,NULL,'[\"Putih\", \"Hijau\", \"Hitam\", \"Biru\"]','Biru',0,10,'PROFILING_PEDAGOGY',6,'',0.2,0.3,0.15,0.35),(76,'Apabila terdapat 3 ketentuan sebagai berikut:\\n\n1. A dapat berubah menjadi A A\\n\n2. A dapat berubah menjadi C B\\n\n3. B dapat berubah menjadi B\\n\nContoh: \\n\nketentuan 1 - ketentuan 2 - ketentuan 3 - ketentuan 1\\n\nA -> A A -> A C B -> A C B B -> A A C B B\\n\nManakah diantara opsi jawaban yang tidak menerapkan 3 ketentuan yang tersedia?','multiple_choice',1,NULL,'[\"A C B B B\", \"C B C\", \"A A A A\", \"C B B B C B B B\"]','C B C',0,10,'PROFILING_PEDAGOGY',6,'',0.15,0.5,0.25,0.1),(77,'Toko donat di desa Bebras dapat membuat 1 donat setiap 2 menit. Ada antrian di depan toko, pelanggan dilayani satu persatu. Setiap pelanggan ingin membeli sejumlah donat. Saking larisnya, setiap orang hanya boleh membeli 3 donat pada satu saat. Jika ingin membeli lebih, harus antri lagi ke belakang. Toko donat buka dan mulai membuat donat pada pukul 7 pagi, dan sudah ada 3 bebras yang antri: yang pertama adalah Ali ingin membeli 7 donat, kedua adalah Bilgin ingin membeli 3 donat, dan yang ketiga Yasemin ingin membeli 5 donat.\\n Berapa menit setelah toko buka, Yasemin akan dilayani dan mendapat semua donat yang ingin dibelinya?','multiple_choice',1,NULL,'[\"12\", \"10\", \"26\", \"28\"]','26',0,10,'PROFILING_PEDAGOGY',6,'',0.1,0.4,0.3,0.2),(78,'','multiple_choice_image',1,NULL,'[\"49_a.png\", \"49_b.png\", \"49_c.png\", \"49_d.png\"]','49_d.png',0,10,'PROFILING_PEDAGOGY',6,'questions/49.png',0.2,0.3,0.25,0.25),(79,'','multiple_choice',1,NULL,'[\"DGE\", \"GGE\", \"AGE\", \"DBC\"]','DGE',0,10,'PROFILING_PEDAGOGY',6,'questions/50.png',0.2,0.35,0.2,0.25),(80,'','multiple_choice',1,NULL,'[\"12\", \"15\", \"18\", \"20\"]','18',0,10,'PROFILING_PEDAGOGY',6,'questions/51.png',0.25,0.25,0.3,0.2),(81,'','multiple_choice',1,NULL,'[\"KELINCI\", \"BERANG BERANG\", \"BERUANG\", \"KUCING\"]','BERUANG',0,10,'PROFILING_PEDAGOGY',6,'questions/52.png',0.2,0.25,0.25,0.3),(82,'','multiple_choice',1,NULL,'[\"Mobil B\", \"Mobil C\", \"Mobil F\", \"Mobil G\", \"Mobil H\", \"Mobil I\", \"Mobil K\", \"Mobil J\"]','Mobil I',0,10,'PROFILING_PEDAGOGY',6,'questions/53.png',0.2,0.3,0.25,0.25),(83,'Sekolah Bebras akan mengadakan pertunjukan menari, dengan penari berpasangan. Ada 6 penari yaitu : \nAna, Budi, Cinta, Dori, Evi, Fani. \\n\nMereka akan menari berpasangan : \\n\n1. Ana - Budi \\n\n2. Evi - Dori \\n\n3. Ana - Evi \\n\n4. Budi - Cinta \\n\n5. Dori - Ana \\n\n6. Fani - Budi \\n\n7. Cinta - Evi \\n\n8. Budi – Dori \\n\n9. Dori - Fani \\n\n10. Fani - Evi \\n\nPelatih ingin menjadwalkan gladi resik untuk suatu tarian berantai. Dalam sebuah tarian berantai, urutan \ntarian ditentukan sedemikian rupa sehingga dari satu tarian ke tarian berikutnya, salah satu dari pasangan \npenari akan tetap tinggal di panggung untuk pertunjukan berikutnya. Selain itu, ada aturan bahwa \nseorang penari tak boleh dijdwal menari 3 kali berturut-turut, sebab akan kelelahan. \\n\nContoh: saat Ana dan Evi menari, salah satu alternatif berikutnya adalah Cinta dan Evi. Setelah itu, Evi \ntidak dapat menari lagi. \\n\nPertanyaan: \\n\nPenari mana yang tak boleh dijadwalkan pada tarian pertama karena akan menyebabkan tidak mungkin \nmembuat pertunjukan tarian berantai?','multiple_choice',1,NULL,'[\"Ana\", \"Cinta\", \"Evi\", \"Dori\", \"Budi\", \"Fani\"]','Cinta',0,10,'PROFILING_PEDAGOGY',6,'',0.2,0.3,0.25,0.25),(84,'','multiple_choice',1,NULL,'[\"8\", \"17\", \"15\", \"5\"]','8',0,10,'PROFILING_PEDAGOGY',6,'questions/55.png',0.2,0.25,0.3,0.25),(85,'','multi_select',1,NULL,'[\"1\", \"2\", \"3\", \"4\", \"5\"]','5 | 2',0,10,'PROFILING_PEDAGOGY',6,'questions/56.png',0.2,0.3,0.25,0.25),(86,'Sebuah alat untuk melakukan diagnosa harus menggoncang spesimen secara berulang-ulang. Alat ini\nbekerja berdasarkan sebuah program komputer, yang ditulis dalam beberapa baris yang diberi nomor.\nAlat membaca program baris demi baris, dan mengeksekusinya segera setelah membaca.\nJika baris mengandung perintah go to X, maka alat akan langsung ke baris X dan meneruskan membaca\nserta mengeksekusinya\\n\nProgram mampu untuk:\\n\n- menyimpan sebuah nilai bilangan dalam lokasi A dengan instruksi “set”,\\n\n- menambahkan 1 pada nilai yang disimpan pada lokasi A dengan instruksi “add”,\\n\n- dan membandingkan nilai A dengan sebuah bilangan lain (=, <, ≤, >, ≥, ≠).\\n\nTantangan: Berapa kali alat akan menggoncang spesimen jika prosedurnya ditulis dengan program\nsebagai berikut:\\n\n1. set A to 0\\n\n2. add 1 to A\\n\n3. go to 6\\n\n4. jika A = 60 go to 8\\n\n5. set A to 0\\n\n6. add 1 to A\\n\n7. go to 2\\n\n8. ulangi A kali menggoncang spesimen\\n\n9. stop','multiple_choice',1,NULL,'[\"Spesimen digoncang dua kali\", \"Spesimen digoncang satu kali\", \"Spesimen digoncang 60 kali\", \"Prosedur tidak akan pernah berhenti dan tidak pernah mengguncang spesimen.\"]','Prosedur tidak akan pernah berhenti dan tidak pernah mengguncang spesimen',0,10,'PROFILING_PEDAGOGY',6,'',0.15,0.3,0.3,0.25),(87,'','short_answer',1,NULL,'[]','534',0,10,'PROFILING_PEDAGOGY',6,'questions/59.png',0.15,0.35,0.25,0.25),(88,'','multiple_choice_image',1,NULL,'[\"60_a.png\", \"60_b.png\", \"60_c.png\", \"60_d.png\"]','60_c.png',0,10,'PROFILING_PEDAGOGY',6,'questions/60.png',0.2,0.3,0.2,0.3),(89,'Diagram membuat saya lebih cepat paham alur dibandingkan hanya dalam bentuk tulisan','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_TP',0,'',0,0,0,0),(90,'Membaca penjelasan dalam bentuk tulisan terkadang membuat saya bingung','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_TP',0,'',0,0,0,0),(91,'Catatan yang saya buat kurang lengkap apabila tidak ada diagram atau gambar','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_TP',0,'',0,0,0,0),(92,'Menghafal gambar atau pola lebih mudah dibandingkan tulisan','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_TP',0,'',0,0,0,0),(93,'Soal dengan teks yang panjang membuat saya tidak fokus','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_TP',0,'',0,0,0,0),(94,'Memahami sebuah konsep tidak cukup apabila hanya melihat gambaran besarnya','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_IR',0,'',0,0,0,0),(95,'Lebih mudah mengerjakan soal ketika perintahnya detail','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_IR',0,'',0,0,0,0),(96,'Sebuah konsep yang tidak terstruktur terkadang menyulitkan saya','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_IR',0,'',0,0,0,0),(97,'Saya cenderung menyelesaikan satu permasalahan dulu sebelum pindah ke yang lain','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_IR',0,'',0,0,0,0),(98,'Saya lebih suka menjelaskan rincian langkah solusi dibandingkan gambaran umum solusi','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_IR',0,'',0,0,0,0),(99,'Lebih seru mengerjakan soal dengan terstruktur','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_GA',0,'',0,0,0,0),(100,'Sebuah keputusan harus ditentukan dengan tepat dan penuh pertimbangan','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_GA',0,'',0,0,0,0),(101,'Saya menimbang beberapa opsi sebelum mengeksekusi','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_GA',0,'',0,0,0,0),(102,'Intuisi tidak menjadi opsi dalam menentukan sebuah pilihan','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_GA',0,'',0,0,0,0),(103,'Saya cukup teliti dalam berbagai hal','scale',1,NULL,'[]','',0,10,'PROFILING_COGNITIVE_GA',0,'',0,0,0,0);
/*!40000 ALTER TABLE `core_pretestquestion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_pretestresponse`
--

DROP TABLE IF EXISTS `core_pretestresponse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_pretestresponse` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `response_value` varchar(255) DEFAULT NULL,
  `answer` tinyint(1) NOT NULL,
  `question_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_pretestresponse_question_id_86a0ec69_fk_core_pret` (`question_id`),
  KEY `core_pretestresponse_user_id_9c543ca4_fk_core_user_id` (`user_id`),
  CONSTRAINT `core_pretestresponse_question_id_86a0ec69_fk_core_pret` FOREIGN KEY (`question_id`) REFERENCES `core_pretestquestion` (`id`),
  CONSTRAINT `core_pretestresponse_user_id_9c543ca4_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_pretestresponse`
--

LOCK TABLES `core_pretestresponse` WRITE;
/*!40000 ALTER TABLE `core_pretestresponse` DISABLE KEYS */;
INSERT INTO `core_pretestresponse` VALUES (57,'4',1,103,5),(58,'3',1,94,5),(59,'5',1,96,5),(60,'4',1,91,5),(61,'6',1,100,5),(62,'6',1,101,5),(63,'5',1,90,5),(64,'3',1,102,5),(65,'5',1,99,5),(66,'6',1,97,5),(67,'4',1,98,5),(68,'6',1,93,5),(69,'6',1,89,5),(70,'6',1,92,5),(71,'6',1,95,5),(72,'3',1,31,5),(73,'3 batu putih',1,47,5),(74,'Harus dicat warna biru',1,61,5),(75,'OUT(C2)-IN(H9);OUT(H2)-IN(C9);OUT(C2)-IN(H2);OUT(C9)-IN(H9)',1,63,5),(76,'OKIWILLBETHERE!',1,64,5),(77,'49_d.png',1,78,5);
/*!40000 ALTER TABLE `core_pretestresponse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_profilingarchetype`
--

DROP TABLE IF EXISTS `core_profilingarchetype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_profilingarchetype` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `archetype_name` varchar(50) NOT NULL,
  `description` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_profilingarchetype`
--

LOCK TABLES `core_profilingarchetype` WRITE;
/*!40000 ALTER TABLE `core_profilingarchetype` DISABLE KEYS */;
INSERT INTO `core_profilingarchetype` VALUES (1,'PAR','Architect','Sees the tiny details in every picture and builds a plan with careful precision'),(2,'PAI','Creator','Loves visual tools and jumps straight into building by learning through quick and hands-on trial'),(3,'TAR','Scholar','Dives deep into the fine print and takes time to process every word before moving forward'),(4,'PGR','Explorer','Looks at the big picture through charts and maps, preferring to observe the whole landscape first'),(5,'PGI','Artist','Grasps the vibe and the overall visual goal instantly, reacting quickly to what they see'),(6,'TAI','Editor','Skims the text for specific facts and makes rapid-fire decisions based on the details'),(7,'TGI','Scout','Scans the headlines for the main idea and moves fast, focusing on the \"what\" rather than the \"how\"'),(8,'TGR','Strategist','Reads between the lines to understand the big picture, weighing all options before taking a step');
/*!40000 ALTER TABLE `core_profilingarchetype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_quiz`
--

DROP TABLE IF EXISTS `core_quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_quiz` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `createdDate` datetime(6) NOT NULL,
  `course_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_id` (`course_id`),
  CONSTRAINT `core_quiz_course_id_1674850c_fk_core_course_id` FOREIGN KEY (`course_id`) REFERENCES `core_course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_quiz`
--

LOCK TABLES `core_quiz` WRITE;
/*!40000 ALTER TABLE `core_quiz` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_quiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_quizquestion`
--

DROP TABLE IF EXISTS `core_quizquestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_quizquestion` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `question` longtext NOT NULL,
  `solution` longtext DEFAULT NULL,
  `quiz_id` bigint(20) NOT NULL,
  `category` varchar(30) NOT NULL,
  `correctAns` longtext NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  `level` int(11) NOT NULL,
  `option` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`option`)),
  `result` varchar(100) DEFAULT NULL,
  `score` double NOT NULL,
  `type` varchar(30) NOT NULL,
  `weight_abstraction` double NOT NULL,
  `weight_algorithm` double NOT NULL,
  `weight_decomposition` double NOT NULL,
  `weight_pattern` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_quizquestion_quiz_id_11e7f3b6_fk_core_quiz_id` (`quiz_id`),
  CONSTRAINT `core_quizquestion_quiz_id_11e7f3b6_fk_core_quiz_id` FOREIGN KEY (`quiz_id`) REFERENCES `core_quiz` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_quizquestion`
--

LOCK TABLES `core_quizquestion` WRITE;
/*!40000 ALTER TABLE `core_quizquestion` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_quizquestion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_quizresponse`
--

DROP TABLE IF EXISTS `core_quizresponse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_quizresponse` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userAns` longtext DEFAULT NULL,
  `timestamp` datetime(6) NOT NULL,
  `feedback_id` bigint(20) DEFAULT NULL,
  `hint_id` bigint(20) DEFAULT NULL,
  `question_id` bigint(20) NOT NULL,
  `quiz_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_quizresponse_feedback_id_81ea79db_fk_core_feedback_id` (`feedback_id`),
  KEY `core_quizresponse_hint_id_f3a067d9_fk_core_hints_id` (`hint_id`),
  KEY `core_quizresponse_question_id_6b05de02_fk_core_quizquestion_id` (`question_id`),
  KEY `core_quizresponse_quiz_id_3184d8f7_fk_core_quiz_id` (`quiz_id`),
  KEY `core_quizresponse_user_id_3040673f_fk_core_user_id` (`user_id`),
  CONSTRAINT `core_quizresponse_feedback_id_81ea79db_fk_core_feedback_id` FOREIGN KEY (`feedback_id`) REFERENCES `core_feedback` (`id`),
  CONSTRAINT `core_quizresponse_hint_id_f3a067d9_fk_core_hints_id` FOREIGN KEY (`hint_id`) REFERENCES `core_hints` (`id`),
  CONSTRAINT `core_quizresponse_question_id_6b05de02_fk_core_quizquestion_id` FOREIGN KEY (`question_id`) REFERENCES `core_quizquestion` (`id`),
  CONSTRAINT `core_quizresponse_quiz_id_3184d8f7_fk_core_quiz_id` FOREIGN KEY (`quiz_id`) REFERENCES `core_quiz` (`id`),
  CONSTRAINT `core_quizresponse_user_id_3040673f_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_quizresponse`
--

LOCK TABLES `core_quizresponse` WRITE;
/*!40000 ALTER TABLE `core_quizresponse` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_quizresponse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_quizresult`
--

DROP TABLE IF EXISTS `core_quizresult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_quizresult` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `score` double NOT NULL,
  `total_score` double NOT NULL,
  `percentage` double NOT NULL,
  `passed` tinyint(1) NOT NULL,
  `completed_at` datetime(6) NOT NULL,
  `quiz_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_quizresult_user_id_quiz_id_105e8de1_uniq` (`user_id`,`quiz_id`),
  KEY `core_quizresult_quiz_id_7e4ae110_fk_core_quiz_id` (`quiz_id`),
  CONSTRAINT `core_quizresult_quiz_id_7e4ae110_fk_core_quiz_id` FOREIGN KEY (`quiz_id`) REFERENCES `core_quiz` (`id`),
  CONSTRAINT `core_quizresult_user_id_19e5f737_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_quizresult`
--

LOCK TABLES `core_quizresult` WRITE;
/*!40000 ALTER TABLE `core_quizresult` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_quizresult` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_studentclass`
--

DROP TABLE IF EXISTS `core_studentclass`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_studentclass` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `class_type` varchar(10) NOT NULL,
  `class_number` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_studentclass_class_type_class_number_aed47ee8_uniq` (`class_type`,`class_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_studentclass`
--

LOCK TABLES `core_studentclass` WRITE;
/*!40000 ALTER TABLE `core_studentclass` DISABLE KEYS */;
INSERT INTO `core_studentclass` VALUES (1,'INTSE',1),(2,'INTSS',1),(3,'INTST',1),(4,'SE',1),(5,'SE',2),(6,'SE',3),(7,'SE',4),(8,'SE',5),(9,'SE',6),(10,'SE',7),(11,'SS',1),(12,'SS',2),(13,'SS',3),(14,'SS',4),(15,'SS',5),(16,'SS',6),(17,'SS',7),(18,'SS',8),(19,'SS',9),(20,'SS',10),(21,'SS',11),(22,'SS',12),(23,'SS',13),(24,'SS',14),(25,'SS',15),(26,'SS',16),(27,'SS',17),(28,'SS',18),(29,'SS',19),(30,'SS',20),(31,'SS',21),(32,'SS',22),(33,'SS',23),(34,'SS',24),(35,'ST',1),(36,'ST',2),(37,'ST',3),(38,'ST',4),(39,'ST',5),(40,'ST',6),(41,'ST',7),(42,'ST',8),(43,'ST',9),(44,'ST',10),(45,'ST',11),(46,'ST',12),(47,'ST',13),(48,'ST',14),(49,'ST',15),(50,'ST',16),(51,'ST',17),(52,'ST',18),(53,'ST',19),(54,'ST',20),(55,'ST',21),(56,'ST',22),(57,'ST',23),(58,'ST',24);
/*!40000 ALTER TABLE `core_studentclass` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_user`
--

DROP TABLE IF EXISTS `core_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `profilePicture` varchar(200) DEFAULT NULL,
  `preferences` longtext DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `otp_created_at` datetime(6) DEFAULT NULL,
  `is_profiled` tinyint(1) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `student_class` varchar(50) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `ct_abstraction` double NOT NULL,
  `ct_algorithm` double NOT NULL,
  `ct_decomposition` double NOT NULL,
  `ct_pattern` double NOT NULL,
  `cog_ga_value` double NOT NULL,
  `cog_ir_value` double NOT NULL,
  `cog_tp_value` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_user`
--

LOCK TABLES `core_user` WRITE;
/*!40000 ALTER TABLE `core_user` DISABLE KEYS */;
INSERT INTO `core_user` VALUES (5,'Rio Alvein','alveinrio@gmail.com','','student','https://lh3.googleusercontent.com/a/ACg8ocLqIaMuGArkinu_WPnKYncLSLIpSoYOUV7NVPmCQlS2f4tc6Q=s96-c','6PAR',1,0,0,NULL,'2026-02-19 22:04:02.682736','2026-02-19 22:14:15.202415',NULL,NULL,1,'2004-09-28','Rio','Male','Alvein','ST-23','G6401221042',20.83,31.67,21.67,25.83,75,75,87.5);
/*!40000 ALTER TABLE `core_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_user_groups`
--

DROP TABLE IF EXISTS `core_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_user_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_user_groups_user_id_group_id_c82fcad1_uniq` (`user_id`,`group_id`),
  KEY `core_user_groups_group_id_fe8c697f_fk_auth_group_id` (`group_id`),
  CONSTRAINT `core_user_groups_group_id_fe8c697f_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `core_user_groups_user_id_70b4d9b8_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_user_groups`
--

LOCK TABLES `core_user_groups` WRITE;
/*!40000 ALTER TABLE `core_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_user_user_permissions`
--

DROP TABLE IF EXISTS `core_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_user_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_user_user_permissions_user_id_permission_id_73ea0daa_uniq` (`user_id`,`permission_id`),
  KEY `core_user_user_permi_permission_id_35ccf601_fk_auth_perm` (`permission_id`),
  CONSTRAINT `core_user_user_permi_permission_id_35ccf601_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `core_user_user_permissions_user_id_085123d3_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_user_user_permissions`
--

LOCK TABLES `core_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `core_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_core_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'contenttypes','contenttype'),(7,'core','course'),(17,'core','enrollment'),(8,'core','feedback'),(9,'core','hints'),(21,'core','material'),(16,'core','module'),(19,'core','pedagogylevel'),(15,'core','pretest'),(10,'core','pretestquestion'),(14,'core','pretestresponse'),(18,'core','profilingarchetype'),(11,'core','quiz'),(12,'core','quizquestion'),(13,'core','quizresponse'),(22,'core','quizresult'),(20,'core','studentclass'),(6,'core','user'),(5,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'core','0001_initial','2026-02-19 10:03:32.165251'),(2,'contenttypes','0001_initial','2026-02-19 10:03:32.276117'),(3,'admin','0001_initial','2026-02-19 10:03:32.636672'),(4,'admin','0002_logentry_remove_auto_add','2026-02-19 10:03:32.674142'),(5,'admin','0003_logentry_add_action_flag_choices','2026-02-19 10:03:32.706054'),(6,'contenttypes','0002_remove_content_type_name','2026-02-19 10:03:32.947894'),(7,'auth','0001_initial','2026-02-19 10:03:33.685863'),(8,'auth','0002_alter_permission_name_max_length','2026-02-19 10:03:33.863678'),(9,'auth','0003_alter_user_email_max_length','2026-02-19 10:03:33.889286'),(10,'auth','0004_alter_user_username_opts','2026-02-19 10:03:33.910590'),(11,'auth','0005_alter_user_last_login_null','2026-02-19 10:03:33.940623'),(12,'auth','0006_require_contenttypes_0002','2026-02-19 10:03:33.955634'),(13,'auth','0007_alter_validators_add_error_messages','2026-02-19 10:03:33.990221'),(14,'auth','0008_alter_user_username_max_length','2026-02-19 10:03:34.017461'),(15,'auth','0009_alter_user_last_name_max_length','2026-02-19 10:03:34.038527'),(16,'auth','0010_alter_group_name_max_length','2026-02-19 10:03:34.107462'),(17,'auth','0011_update_proxy_permissions','2026-02-19 10:03:34.172438'),(18,'auth','0012_alter_user_first_name_max_length','2026-02-19 10:03:34.199057'),(19,'core','0002_user_otp_user_otp_created_at','2026-02-19 10:03:34.278042'),(20,'core','0003_pretestquestion_category_pretestquestion_level_and_more','2026-02-19 10:03:34.421431'),(21,'core','0004_pretestquestion_image','2026-02-19 10:03:34.449221'),(22,'core','0005_user_groups_user_user_permissions_and_more','2026-02-19 10:03:35.690686'),(23,'core','0006_alter_pretestquestion_type','2026-02-19 10:03:35.714085'),(24,'core','0007_user_birth_date_user_first_name_user_gender_and_more','2026-02-19 10:03:36.063219'),(25,'core','0008_alter_pretestquestion_type','2026-02-19 10:03:36.109114'),(26,'core','0009_alter_pretestquestion_type','2026-02-19 10:03:36.133903'),(27,'core','0010_profilingarchetype','2026-02-19 10:03:36.253186'),(28,'core','0011_seed_archetypes','2026-02-19 10:03:36.437314'),(29,'core','0012_pedagogylevel','2026-02-19 10:03:36.530418'),(30,'core','0013_seed_pedagogy_levels','2026-02-19 10:03:36.682655'),(31,'core','0014_pretestquestion_weight_abstraction_and_more','2026-02-19 10:03:37.045505'),(32,'core','0015_studentclass','2026-02-19 10:03:37.179645'),(33,'sessions','0001_initial','2026-02-19 10:03:37.272579'),(34,'core','0016_user_cog_ga_value_user_cog_ir_value_and_more','2026-02-19 16:24:59.656694'),(35,'core','0017_alter_pretestresponse_response_value','2026-02-19 17:11:47.670938'),(36,'core','0016_seed_student_classes','2026-02-19 22:00:09.334497'),(37,'core','0018_merge_20260220_0459','2026-02-19 22:00:09.339350'),(38,'core','0019_material','2026-02-21 09:34:26.459852'),(39,'core','0020_quizquestion_category_quizquestion_correctans_and_more','2026-02-21 09:34:26.740808'),(40,'core','0021_material_course','2026-02-21 09:34:26.895982'),(41,'core','0022_quizresult','2026-02-21 09:34:27.144998'),(42,'core','0023_alter_material_options_course_thumbnail_and_more','2026-02-21 09:34:27.413589');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-21 17:09:51
