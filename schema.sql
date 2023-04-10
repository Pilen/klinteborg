BEGIN;

-- Deltager FDF Medlems IDs
CREATE TABLE fdfids (
	fdfid	integer	PRIMARY KEY,
	navn	text	NOT NULL
);

CREATE TABLE login_tokens (
	fdfid			integer	REFERENCES fdfids,
	login_token		text	NOT NULL UNIQUE,
	session_token	text	NOT NULL UNIQUE
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
	problemer	text[]		NOT NULL,
	navn		text		NOT NULL,
	er_voksen	boolean		NOT NULL,
	stab		Stab		NOT NULL,
	patrulje	Patrulje	NOT NULL,
	uge1		boolean		NOT NULL,
	uge2		boolean		NOT NULL,
	dage		Tilstede[]	NOT NULL,
	dage_x		Tilstede[],
	ankomst_type		Transport	NOT NULL,
	ankomst_dato		date		NOT NULL,
	ankomst_tidspunkt	int,
	afrejse_type		Transport	NOT NULL,
	afrejse_dato		date		NOT NULL,
	afrejse_tidspunkt	int
);



COMMIT;
