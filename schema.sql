BEGIN;


--------------------------------------------------------------------------------
-- Settings
--------------------------------------------------------------------------------
CREATE TABLE settings (
	setting			text	PRIMARY KEY,
	value			jsonb	NOT NULL,
	default_value	jsonb	NOT NULL,
	type			text	NOT NULL,
	description		text	NOT NULL
);

--------------------------------------------------------------------------------
-- Base
--------------------------------------------------------------------------------

-- The FDF medlems IDs of everyone the system should know about.
CREATE TABLE fdfids (
	fdfid	integer	PRIMARY KEY,
	navn	text	NOT NULL
);


--------------------------------------------------------------------------------
-- Login
--------------------------------------------------------------------------------

-- A simple table of all the users that may login
-- Rember to clear both login_permissions and session_tokens to log someone out.
CREATE TABLE login_permissions (
	fdfid	integer REFERENCES fdfids UNIQUE
);

-- The tokens are used for login.
CREATE TABLE login_tokens (
	fdfid			integer		REFERENCES fdfids UNIQUE,
	login_token		text		NOT NULL UNIQUE,
	used			boolean		NOT NULL,
	expires_at		timestamptz	NOT NULL,
	created_at		timestamptz NOT NULL
);

-- We keep the old tokens around after expiry / logout, this is to prevent a new token from having the same value as a previous one, thus keeping you logged in.
-- They can / should be cleared out periodically
CREATE TABLE session_tokens (
	fdfid			integer		REFERENCES fdfids,
	session_token	text		NOT NULL,
	expires_at		timestamptz, -- Null means expired
	created_at		timestamptz,
	UNIQUE(fdfid, session_token)
);


--------------------------------------------------------------------------------
-- Permissions
--------------------------------------------------------------------------------
CREATE TABLE Permissions (
	permission	text	PRIMARY KEY,
	beskrivelse	text	NOT NULL
);

CREATE TABLE user_permissions (
	fdfid		integer			REFERENCES fdfids,
	permission	text			REFERENCES Permissions,
	automatic	boolean			NOT NULL, -- Has this permission been granted automatically by the system
	UNIQUE(fdfid, permission, automatic)
);



--------------------------------------------------------------------------------
--
--------------------------------------------------------------------------------

CREATE TYPE Stab AS ENUM (
	'Resten',
	'Indestab',
	'Piltestab',
	'Væbnerstab'
);

CREATE TYPE Patrulje AS ENUM (
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

CREATE TYPE Tilstede AS ENUM (
	'Ja',
	'Nej',
	'Måske',
	'Delvist'
);

CREATE TYPE Transport AS ENUM (
	'Fælles',
	'Egen',
	'Samkørsel'
);


CREATE TABLE deltagere (
	fdfid				integer		REFERENCES fdfids,
	row					jsonb		NOT NULL,
	tilmeldt_dato		timestamptz	NOT NULL,
	sidst_ændret_dato	timestamptz	NOT NULL,
	problemer			text[]		NOT NULL,
	navn				text		NOT NULL,
	gammelt_medlemsnummer	int,
	fødselsdato			date		NOT NULL,
	adresse				text		NOT NULL,
	telefon				text		NOT NULL,
	pårørende			jsonb		NOT NULL,
	er_voksen			boolean		NOT NULL,
	stab				Stab		NOT NULL,
	patrulje			Patrulje	NOT NULL,
	bordhold_uge1		integer,
	bordhold_uge2		integer,
	uge1				boolean		NOT NULL,
	uge2				boolean		NOT NULL,
	dage				Tilstede[]	NOT NULL,
	dage_x				Tilstede[],
	upræcis_periode		boolean		NOT NULL,
	ankomst_type		Transport	NOT NULL,
	ankomst_dato		date,
	ankomst_tidspunkt	int,
	afrejse_type		Transport	NOT NULL,
	afrejse_dato		date,
	afrejse_tidspunkt	int
);


--------------------------------------------------------------------------------
--
--------------------------------------------------------------------------------

CREATE TYPE Gruppe_type AS ENUM (
	'Funktion', -- Your primary function during the camp, you typically only have one
	'Job', -- An additional role you have
	'Udvalg',
	'Stabsopgave', -- Any udvalg / job specific to the stab
	'Event', -- A grouping specific to some event during the camp
	'Auto' -- Groups that people are put into automatically.
);

CREATE TABLE grupper (
	gruppe	text		PRIMARY KEY,
	type	Gruppe_type	NOT NULL,
	beskrivelse	text	NOT NULL,
	minimum_antal	integer, -- null means no limit
	maximum_antal	integer  -- null means no limit
);

CREATE TABLE gruppe_medlemmer (
	gruppe		text	REFERENCES grupper,
	fdfid		int		REFERENCES fdfids,
	tovholder	boolean	NOT NULL DEFAULT false,
	UNIQUE(gruppe, fdfid)
);







-- CREATE TABLE tasks (
-- 	task_type		text			PRIMARY KEY,
-- 	scheduled_to	timestamptz,
-- 	started_at		timestamptz,
-- );
-- CREATE TABLE task_log (
-- 	task_type		text		PRIMARY KEY,
-- 	scheduled_to	timestamptz	NOT NULL,
-- 	started_at		timestamptz	NOT NULL,
-- 	finished_at		timestamptz	NOT NULL,
-- 	success			boolean		NOT NULL,
-- 	message			text		NOT NULL,
-- )



--------------------------------------------------------------------------------
-- Livgrupper
--------------------------------------------------------------------------------

CREATE TABLE grupper_med_minus (
	gruppe	text	REFERENCES grupper,
	UNIQUE(gruppe)
);

CREATE TABLE arbejdsbyrde_besvarelser (
	id			SERIAL	PRIMARY KEY,
	grupper		json	NOT NULL,
	vægtning	int
);

CREATE TABLE arbejdsbyrde_custom_scores (
	gruppe	text				REFERENCES grupper,
	score	double precision	NOT NULL,
	UNIQUE(gruppe)
);



COMMIT;
