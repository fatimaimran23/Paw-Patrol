-- ============================================================
--  PawPatrol Database  –  Complete Script  (FIXED)
--  Includes: Tables, Inserts, Views, Stored Procedures,
--            Triggers, and Transactions
--
--  FIX: The two conflicting INSTEAD OF INSERT triggers on
--  AdoptionRequests have been merged into one
--  (trg_ValidateAdoptionInsert) because SQL Server only allows
--  a single INSTEAD OF trigger per DML action per table.
-- ============================================================

CREATE DATABASE PawPatrol;
GO
USE PawPatrol;
GO

-- ============================================================
-- SECTION 1 : TABLES
-- ============================================================

CREATE TABLE Users (
    user_id    INT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  CHECK (role IN ('user', 'shop_owner', 'ngo')) NOT NULL,
    phone      VARCHAR(20),
    location   VARCHAR(100),
    created_at DATETIME DEFAULT GETDATE()
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
    created_at  DATETIME DEFAULT GETDATE(),

    owner_id    INT,
    category_id INT,

    FOREIGN KEY (owner_id)    REFERENCES Users(user_id)          ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
);

CREATE TABLE AdoptionRequests (
    request_id   INT PRIMARY KEY,
    status       VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    request_date DATETIME DEFAULT GETDATE(),

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
    created_at  DATETIME DEFAULT GETDATE(),

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
GO

-- ============================================================
-- SECTION 2 : SEED DATA
-- ============================================================

INSERT INTO Users (user_id, name, email, password, role, phone, location) VALUES
(1, 'Ali Khan',          'ali@example.com',       '1234', 'user',       '03001234567', 'Lahore'),
(2, 'Sara Ahmed',        'sara@example.com',       '1234', 'user',       '03111234567', 'Karachi'),
(3, 'Pet Zone',          'petzone@example.com',    '1234', 'shop_owner', '03211234567', 'Lahore'),
(4, 'Happy Pets Shop',   'happypets@example.com',  '1234', 'shop_owner', '03331234567', 'Islamabad'),
(5, 'Helping Paws NGO',  'ngo1@example.com',       '1234', 'ngo',        '03441234567', 'Lahore'),
(6, 'Rescue Animals NGO','ngo2@example.com',       '1234', 'ngo',        '03551234567', 'Karachi');

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
GO

-- ============================================================
-- SECTION 3 : VIEWS
-- ============================================================

-- View 1: All available pets with owner and category details
CREATE VIEW vw_AvailablePets AS
    SELECT
        pl.pet_id,
        pl.pet_name,
        pl.breed,
        pl.age,
        pl.description,
        pl.location,
        c.name         AS category,
        u.name         AS owner_name,
        u.role         AS owner_type,
        u.phone        AS owner_phone
    FROM  PetListings pl
    JOIN  Users      u  ON pl.owner_id    = u.user_id
    JOIN  Categories c  ON pl.category_id = c.category_id
    WHERE pl.status = 'available';
GO

-- View 2: Full adoption request details (pet + adopter info)
CREATE VIEW vw_AdoptionDetails AS
    SELECT
        ar.request_id,
        ar.status           AS request_status,
        ar.request_date,
        u.name              AS adopter_name,
        u.email             AS adopter_email,
        u.phone             AS adopter_phone,
        pl.pet_name,
        pl.breed,
        pl.location         AS pet_location,
        c.name              AS category
    FROM  AdoptionRequests ar
    JOIN  Users            u   ON ar.user_id      = u.user_id
    JOIN  PetListings      pl  ON ar.pet_id        = pl.pet_id
    JOIN  Categories       c   ON pl.category_id   = c.category_id;
GO

-- View 3: Abuse reports with reporter and handler names
CREATE VIEW vw_AbuseReportDetails AS
    SELECT
        ab.report_id,
        ab.description,
        ab.location,
        ab.status,
        ab.created_at,
        r.name   AS reported_by_name,
        r.email  AS reported_by_email,
        h.name   AS handled_by_name     -- NULL if unassigned
    FROM  AbuseReports ab
    JOIN  Users r  ON ab.reported_by = r.user_id
    LEFT JOIN Users h  ON ab.handled_by  = h.user_id;
GO

-- View 4: Each user's favourite pets (with pet details)
CREATE VIEW vw_UserFavorites AS
    SELECT
        u.user_id,
        u.name      AS user_name,
        pl.pet_id,
        pl.pet_name,
        pl.breed,
        pl.status   AS pet_status,
        c.name      AS category
    FROM  Favorites    f
    JOIN  Users        u   ON f.user_id      = u.user_id
    JOIN  PetListings  pl  ON f.pet_id        = pl.pet_id
    JOIN  Categories   c   ON pl.category_id  = c.category_id;
GO

-- View 5: Summary stats per owner (how many pets listed / adopted)
CREATE VIEW vw_OwnerPetSummary AS
    SELECT
        u.user_id,
        u.name                                                        AS owner_name,
        u.role,
        COUNT(pl.pet_id)                                              AS total_listed,
        SUM(CASE WHEN pl.status = 'adopted'   THEN 1 ELSE 0 END)     AS total_adopted,
        SUM(CASE WHEN pl.status = 'available' THEN 1 ELSE 0 END)     AS total_available
    FROM  Users       u
    LEFT JOIN PetListings pl ON u.user_id = pl.owner_id
    WHERE u.role IN ('shop_owner', 'ngo')
    GROUP BY u.user_id, u.name, u.role;
GO

-- ============================================================
-- SECTION 4 : STORED PROCEDURES
-- ============================================================

-- SP 1: Register a new user
CREATE PROCEDURE sp_RegisterUser
    @user_id  INT,
    @name     VARCHAR(100),
    @email    VARCHAR(100),
    @password VARCHAR(255),
    @role     VARCHAR(20),
    @phone    VARCHAR(20)    = NULL,
    @location VARCHAR(100)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Users WHERE email = @email)
    BEGIN
        RAISERROR('A user with this email already exists.', 16, 1);
        RETURN;
    END

    INSERT INTO Users (user_id, name, email, password, role, phone, location)
    VALUES (@user_id, @name, @email, @password, @role, @phone, @location);

    PRINT 'User registered successfully.';
END;
GO

-- SP 2: Add a new pet listing
CREATE PROCEDURE sp_AddPetListing
    @pet_id      INT,
    @pet_name    VARCHAR(100),
    @breed       VARCHAR(100),
    @age         INT,
    @description TEXT,
    @location    VARCHAR(100),
    @owner_id    INT,
    @category_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = @owner_id AND role IN ('shop_owner','ngo'))
    BEGIN
        RAISERROR('Only shop owners or NGOs can list pets.', 16, 1);
        RETURN;
    END

    INSERT INTO PetListings (pet_id, pet_name, breed, age, description, location, owner_id, category_id)
    VALUES (@pet_id, @pet_name, @breed, @age, @description, @location, @owner_id, @category_id);

    PRINT 'Pet listed successfully.';
END;
GO

-- SP 3: Submit an adoption request
CREATE PROCEDURE sp_SubmitAdoptionRequest
    @request_id INT,
    @user_id    INT,
    @pet_id     INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PetListings WHERE pet_id = @pet_id AND status = 'available')
    BEGIN
        RAISERROR('This pet is not available for adoption.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1 FROM AdoptionRequests
        WHERE user_id = @user_id AND pet_id = @pet_id AND status = 'pending'
    )
    BEGIN
        RAISERROR('You already have a pending request for this pet.', 16, 1);
        RETURN;
    END

    INSERT INTO AdoptionRequests (request_id, user_id, pet_id)
    VALUES (@request_id, @user_id, @pet_id);

    PRINT 'Adoption request submitted successfully.';
END;
GO

-- SP 4: Accept or reject an adoption request
CREATE PROCEDURE sp_UpdateAdoptionStatus
    @request_id INT,
    @new_status VARCHAR(20)   -- 'accepted' or 'rejected'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @pet_id         INT;
        DECLARE @current_status VARCHAR(20);

        SELECT @pet_id = pet_id, @current_status = status
        FROM   AdoptionRequests
        WHERE  request_id = @request_id;

        IF @pet_id IS NULL
        BEGIN
            RAISERROR('Adoption request not found.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @current_status <> 'pending'
        BEGIN
            RAISERROR('Only pending requests can be updated.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE AdoptionRequests
        SET    status = @new_status
        WHERE  request_id = @request_id;

        IF @new_status = 'accepted'
        BEGIN
            UPDATE PetListings
            SET    status = 'adopted'
            WHERE  pet_id = @pet_id;

            UPDATE AdoptionRequests
            SET    status = 'rejected'
            WHERE  pet_id     = @pet_id
              AND  request_id <> @request_id
              AND  status = 'pending';
        END

        COMMIT TRANSACTION;
        PRINT 'Adoption request updated successfully.';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- SP 5: File an abuse report
CREATE PROCEDURE sp_FileAbuseReport
    @report_id   INT,
    @description TEXT,
    @location    VARCHAR(100),
    @reported_by INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = @reported_by)
    BEGIN
        RAISERROR('Reporting user does not exist.', 16, 1);
        RETURN;
    END

    INSERT INTO AbuseReports (report_id, description, location, reported_by)
    VALUES (@report_id, @description, @location, @reported_by);

    PRINT 'Abuse report filed successfully.';
END;
GO

-- SP 6: Assign an NGO handler to an abuse report
CREATE PROCEDURE sp_AssignAbuseReportHandler
    @report_id  INT,
    @handler_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = @handler_id AND role = 'ngo')
    BEGIN
        RAISERROR('Handler must be an NGO user.', 16, 1);
        RETURN;
    END

    UPDATE AbuseReports
    SET    handled_by = @handler_id,
           status     = 'under_investigation'
    WHERE  report_id  = @report_id;

    PRINT 'Handler assigned and report marked as under investigation.';
END;
GO

-- SP 7: Add a pet to a user's favourites
CREATE PROCEDURE sp_AddFavorite
    @favorite_id INT,
    @user_id     INT,
    @pet_id      INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Favorites WHERE user_id = @user_id AND pet_id = @pet_id)
    BEGIN
        RAISERROR('This pet is already in your favorites.', 16, 1);
        RETURN;
    END

    INSERT INTO Favorites (favorite_id, user_id, pet_id)
    VALUES (@favorite_id, @user_id, @pet_id);

    PRINT 'Pet added to favorites.';
END;
GO

-- SP 8: Remove a pet from a user's favourites
CREATE PROCEDURE sp_RemoveFavorite
    @user_id INT,
    @pet_id  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Favorites WHERE user_id = @user_id AND pet_id = @pet_id)
    BEGIN
        RAISERROR('This pet is not in your favorites.', 16, 1);
        RETURN;
    END

    DELETE FROM Favorites WHERE user_id = @user_id AND pet_id = @pet_id;

    PRINT 'Pet removed from favorites.';
END;
GO

-- SP 9: Search available pets by category and/or location
CREATE PROCEDURE sp_SearchPets
    @category_name VARCHAR(50)  = NULL,
    @location      VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pl.pet_id,
        pl.pet_name,
        pl.breed,
        pl.age,
        pl.description,
        pl.location,
        c.name  AS category,
        u.name  AS owner_name,
        u.phone AS owner_phone
    FROM  PetListings pl
    JOIN  Users      u ON pl.owner_id    = u.user_id
    JOIN  Categories c ON pl.category_id = c.category_id
    WHERE pl.status = 'available'
      AND (@category_name IS NULL OR c.name     LIKE '%' + @category_name + '%')
      AND (@location      IS NULL OR pl.location LIKE '%' + @location      + '%');
END;
GO

-- SP 10: Get adoption history for a specific user
CREATE PROCEDURE sp_GetUserAdoptionHistory
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ar.request_id,
        ar.status      AS request_status,
        ar.request_date,
        pl.pet_name,
        pl.breed,
        c.name         AS category,
        pl.location    AS pet_location
    FROM  AdoptionRequests ar
    JOIN  PetListings      pl ON ar.pet_id        = pl.pet_id
    JOIN  Categories       c  ON pl.category_id   = c.category_id
    WHERE ar.user_id = @user_id
    ORDER BY ar.request_date DESC;
END;
GO

-- ============================================================
-- SECTION 5 : TRIGGERS
-- ============================================================

-- Trigger 1 (FIXED): Merged replacement for the two original INSTEAD OF INSERT
-- triggers that conflicted.  SQL Server allows only ONE INSTEAD OF INSERT
-- trigger per table.  This single trigger performs both validations:
--   • Blocks non-'user' role from submitting adoption requests
--   • Blocks requests for pets that are already adopted
CREATE TRIGGER trg_ValidateAdoptionInsert
ON AdoptionRequests
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Block shop owners / NGOs from adopting
    IF EXISTS (
        SELECT 1
        FROM   inserted i
        JOIN   Users    u ON i.user_id = u.user_id
        WHERE  u.role <> 'user'
    )
    BEGIN
        RAISERROR('Only regular users can submit adoption requests.', 16, 1);
        RETURN;
    END

    -- Block requests for already-adopted pets
    IF EXISTS (
        SELECT 1
        FROM   inserted i
        JOIN   PetListings pl ON i.pet_id = pl.pet_id
        WHERE  pl.status = 'adopted'
    )
    BEGIN
        RAISERROR('Cannot submit an adoption request for a pet that has already been adopted.', 16, 1);
        RETURN;
    END

    -- All checks passed – perform the actual insert
    INSERT INTO AdoptionRequests (request_id, status, request_date, user_id, pet_id)
    SELECT request_id, status, request_date, user_id, pet_id
    FROM   inserted;
END;
GO

-- Trigger 2: When a pet is deleted, also remove it from all Favorites
CREATE TRIGGER trg_CleanupFavoritesOnPetDelete
ON PetListings
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Favorites
    WHERE pet_id IN (SELECT pet_id FROM deleted);
END;
GO

-- Trigger 3: Log abuse report status changes to the console
CREATE TRIGGER trg_AbuseReportStatusChange
ON AbuseReports
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(status)
    BEGIN
        DECLARE @report_id  INT;
        DECLARE @old_status VARCHAR(30);
        DECLARE @new_status VARCHAR(30);

        SELECT @report_id  = i.report_id,
               @old_status = d.status,
               @new_status = i.status
        FROM   inserted i
        JOIN   deleted  d ON i.report_id = d.report_id;

        IF @old_status <> @new_status
            PRINT 'Abuse Report #' + CAST(@report_id AS VARCHAR) +
                  ' status changed from [' + @old_status + '] to [' + @new_status + ']';
    END
END;
GO

-- ============================================================
-- SECTION 6 : TRANSACTIONS  (standalone examples)
-- ============================================================

-- Transaction 1: Accept an adoption request safely
BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @req_id INT = 1;
    DECLARE @p_id   INT;

    SELECT @p_id = pet_id FROM AdoptionRequests WHERE request_id = @req_id;

    UPDATE AdoptionRequests SET status = 'accepted' WHERE request_id = @req_id;
    UPDATE PetListings      SET status = 'adopted'  WHERE pet_id     = @p_id;
    UPDATE AdoptionRequests
    SET    status = 'rejected'
    WHERE  pet_id = @p_id AND request_id <> @req_id AND status = 'pending';

    COMMIT TRANSACTION;
    PRINT 'Transaction 1 committed: Adoption accepted successfully.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Transaction 1 rolled back due to error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- Transaction 2: Register a new user AND immediately add a pet listing
BEGIN TRANSACTION;
BEGIN TRY
    INSERT INTO Users (user_id, name, email, password, role, phone, location)
    VALUES (7, 'New Pet Store', 'newstore@example.com', 'securepass', 'shop_owner', '03661234567', 'Peshawar');

    INSERT INTO PetListings (pet_id, pet_name, breed, age, description, location, owner_id, category_id)
    VALUES (6, 'Rocky', 'Labrador', 1, 'Playful and healthy puppy', 'Peshawar', 7, 1);

    COMMIT TRANSACTION;
    PRINT 'Transaction 2 committed: New user and pet listing created.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Transaction 2 rolled back due to error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- Transaction 3: File an abuse report AND assign an NGO handler atomically
BEGIN TRANSACTION;
BEGIN TRY
    INSERT INTO AbuseReports (report_id, description, location, reported_by)
    VALUES (4, 'Dog chained without food or water', 'Lahore', 2);

    UPDATE AbuseReports
    SET    handled_by = 5, status = 'under_investigation'
    WHERE  report_id  = 4;

    COMMIT TRANSACTION;
    PRINT 'Transaction 3 committed: Abuse report filed and handler assigned.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Transaction 3 rolled back due to error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================================
-- QUICK USAGE REFERENCE
-- ============================================================
--
-- === VIEWS ===
-- SELECT * FROM vw_AvailablePets;
-- SELECT * FROM vw_AdoptionDetails;
-- SELECT * FROM vw_AbuseReportDetails;
-- SELECT * FROM vw_UserFavorites;
-- SELECT * FROM vw_OwnerPetSummary;
--
-- === STORED PROCEDURES ===
-- EXEC sp_RegisterUser              7, 'Test User', 'test@mail.com', 'pass', 'user', '0300000', 'Lahore';
-- EXEC sp_AddPetListing             7, 'Fluffy', 'Poodle', 1, 'Cute dog', 'Lahore', 3, 1;
-- EXEC sp_SubmitAdoptionRequest     4, 1, 2;
-- EXEC sp_UpdateAdoptionStatus      1, 'accepted';
-- EXEC sp_FileAbuseReport           5, 'Stray dog injured', 'Karachi', 2;
-- EXEC sp_AssignAbuseReportHandler  2, 5;
-- EXEC sp_AddFavorite               4, 2, 5;
-- EXEC sp_RemoveFavorite            1, 1;
-- EXEC sp_SearchPets                'Dog', 'Lahore';
-- EXEC sp_GetUserAdoptionHistory    1;
