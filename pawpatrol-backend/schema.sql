CREATE DATABASE IF NOT EXISTS PawPatrol;
USE PawPatrol;

-- TABLES

CREATE TABLE Users (
    user_id    INT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  CHECK (role IN ('user', 'shop_owner', 'ngo')) NOT NULL,
    phone      VARCHAR(20),
    location   VARCHAR(100),
    created_at DATETIME DEFAULT NOW()
);

CREATE TABLE Categories (
    category_id INT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL
);

CREATE TABLE PetListings (
    pet_id      INT PRIMARY KEY,
    pet_name    VARCHAR(100),
    breed       VARCHAR(100),
    age         INT,
    description TEXT,
    location    VARCHAR(100),
    status      VARCHAR(20) CHECK (status IN ('available', 'adopted')) DEFAULT 'available',
    created_at  DATETIME DEFAULT NOW(),
    owner_id    INT,
    category_id INT,
    FOREIGN KEY (owner_id)    REFERENCES Users(user_id)          ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
);

CREATE TABLE AdoptionRequests (
    request_id   INT PRIMARY KEY,
    status       VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    request_date DATETIME DEFAULT NOW(),
    user_id INT,
    pet_id  INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)      ON DELETE NO ACTION,
    FOREIGN KEY (pet_id)  REFERENCES PetListings(pet_id) ON DELETE CASCADE
);

CREATE TABLE AbuseReports (
    report_id   INT PRIMARY KEY,
    description TEXT NOT NULL,
    location    VARCHAR(100),
    status      VARCHAR(30) CHECK (status IN ('pending', 'under_investigation', 'resolved')) DEFAULT 'pending',
    created_at  DATETIME DEFAULT NOW(),
    reported_by INT,
    handled_by  INT,
    FOREIGN KEY (reported_by) REFERENCES Users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (handled_by)  REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE Favorites (
    favorite_id INT PRIMARY KEY,
    user_id     INT,
    pet_id      INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)      ON DELETE NO ACTION,
    FOREIGN KEY (pet_id)  REFERENCES PetListings(pet_id) ON DELETE CASCADE,
    CONSTRAINT unique_favorite UNIQUE (user_id, pet_id)
);

-- SEED DATA

INSERT INTO Users (user_id, name, email, password, role, phone, location) VALUES
(1, 'Ali Khan',           'ali@example.com',       '1234', 'user',       '03001234567', 'Lahore'),
(2, 'Sara Ahmed',         'sara@example.com',       '1234', 'user',       '03111234567', 'Karachi'),
(3, 'Pet Zone',           'petzone@example.com',    '1234', 'shop_owner', '03211234567', 'Lahore'),
(4, 'Happy Pets Shop',    'happypets@example.com',  '1234', 'shop_owner', '03331234567', 'Islamabad'),
(5, 'Helping Paws NGO',   'ngo1@example.com',       '1234', 'ngo',        '03441234567', 'Lahore'),
(6, 'Rescue Animals NGO', 'ngo2@example.com',       '1234', 'ngo',        '03551234567', 'Karachi');

INSERT INTO Categories (category_id, name) VALUES
(1, 'Dog'), (2, 'Cat'), (3, 'Bird');

INSERT INTO PetListings (pet_id, pet_name, breed, age, description, location, status, owner_id, category_id) VALUES
(1, 'Buddy', 'Golden Retriever', 2, 'Friendly and energetic dog', 'Lahore',    'available', 3, 1),
(2, 'Max',   'German Shepherd',  3, 'Trained guard dog',          'Lahore',    'available', 3, 1),
(3, 'Milo',  'Persian Cat',      1, 'Calm indoor cat',            'Karachi',   'available', 4, 2),
(4, 'Luna',  'Siamese Cat',      2, 'Playful and affectionate',   'Islamabad', 'adopted',   4, 2),
(5, 'Coco',  'Parrot',           1, 'Talkative bird',             'Lahore',    'available', 3, 3);

INSERT INTO AdoptionRequests (request_id, status, user_id, pet_id) VALUES
(1, 'pending',  1, 1),
(2, 'accepted', 2, 3),
(3, 'rejected', 1, 4);

INSERT INTO AbuseReports (report_id, description, location, status, reported_by, handled_by) VALUES
(1, 'Injured stray dog found on street',  'Lahore',    'under_investigation', 1, 5),
(2, 'Abandoned kitten in poor condition', 'Karachi',   'pending',             2, NULL),
(3, 'Bird kept in unsafe cage',           'Islamabad', 'resolved',            1, 6);

INSERT INTO Favorites (favorite_id, user_id, pet_id) VALUES
(1, 1, 1), (2, 1, 3), (3, 2, 2);
