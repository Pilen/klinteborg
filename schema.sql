BEGIN;

-- Deltager FDF Medlems IDs
CREATE TABLE fdfids (
	fdfid	integer	PRIMARY KEY,
	navn	text	NOT NULL
);

CREATE TABLE login_tokens (
	fdfid			integer		REFERENCES fdfids UNIQUE,
	login_token		text		NOT NULL UNIQUE,
	expires_at		timestamptz	NOT NULL
);

CREATE TABLE session_tokens (
	fdfid			integer		REFERENCES fdfids,
	session_token	text		NOT NULL,
	expires_at		timestamptz, -- Null means expired
    UNIQUE(fdfid, session_token)
);

CREATE TYPE Stab as ENUM (
	'Resten',
	'Indestab',
	'Piltestab',
	'Væbnerstab'
);

CREATE TYPE Patrulje as ENUM (
	'Numlinge',
	'1. Puslinge',
	'2. Puslinge',
	'1. Tumlinge',
	'2. Tumlinge',
	'1. Pilte',
	'2. Pilte',
	'1. Væbnere',
	'2. Væbnere',
	'1. Seniorvæbnere',
	'2. Seniorvæbnere',
    'Senior',
	'?',
	'Ingen'
);

CREATE TYPE Tilstede as ENUM (
	'Ja',
	'Nej',
	'Måske',
	'Delvist'
);

CREATE TYPE Transport as ENUM (
	'Fælles',
	'Egen',
	'Samkørsel'
);


CREATE TABLE deltagere (
	fdfid		integer		REFERENCES fdfids,
	row			jsonb		NOT NULL,
    tilmeldt_dato		timestamptz	NOT NULL,
    sidst_ændret_dato	timestamptz	NOT NULL,
	problemer	text[]		NOT NULL,
	navn		text		NOT NULL,
	gammelt_medlemsnummer	int,
	fødselsdato	date		NOT NULL,
	adresse		text		NOT NULL,
	telefon		text		NOT NULL,
	pårørende	jsonb		NOT NULL,
	er_voksen	boolean		NOT NULL,
	stab		Stab		NOT NULL,
	patrulje	Patrulje	NOT NULL,
	uge1		boolean		NOT NULL,
	uge2		boolean		NOT NULL,
	dage		Tilstede[]	NOT NULL,
	dage_x		Tilstede[],
	upræcis_periode		boolean		NOT NULL,
	ankomst_type		Transport	NOT NULL,
	ankomst_dato		date,
	ankomst_tidspunkt	int,
	afrejse_type		Transport	NOT NULL,
	afrejse_dato		date,
	afrejse_tidspunkt	int
);



-- CREATE TABLE Permissions {
-- 	permission	text	PRIMARY KEY,
-- 	beskrivelse	text NOT NULL,
-- );

-- CREATE TABLE User_permissions (
-- 	fdfid		integer	REFERENCES fdfids,
--     permission	text	REFERENCES Permissions,
--     reason		Permission_reason	NOT NULL,
-- )


-- CREATE TYPE Permission_reason (
-- 	'Auto',
--     'Manual',
-- );
-- CREATE TYPE Gruppe_type (
-- 	'Udvalg',
-- 	'Job',
-- 	'Gruppe',
-- );

-- CREATE TABLE grupper (
-- 	gruppe	text		PRIMARY KEY,
-- 	type	Gruppe_type	NOT NULL,
-- 	beskrivelse	text	NOT NULL,
-- 	minimum_antal	integer,
-- 	maximum_antal	integer
-- );

-- CREATE TABLE gruppe_medlemer (
-- 	gruppe	text	REFERENCES grupper,
--     fdfid	int		REFERENCES fdfids,
--     primær  boolean	NOT NULL DEFAULT false
-- );


COMMIT;
