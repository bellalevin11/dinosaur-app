--
-- PostgreSQL database dump
--

\restrict zxpN9kihXKr3ZUYaETpBEJRLD22Ybb3J5Lu1MLjOcLmXf4ejf1jV5zaVYKweXXz

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dinosaurs; Type: TABLE; Schema: public; Owner: blevin22
--

CREATE TABLE public.dinosaurs (
    id integer NOT NULL,
    name character varying(50),
    description text,
    points_required integer,
    clue text,
    model_path text,
    image_url text,
    model_scale double precision DEFAULT 1,
    model_y_offset double precision DEFAULT 0,
    diet character varying(50),
    period character varying(50),
    length character varying(50),
    habitat text,
    fun_fact text,
    image_path text,
    silhouette_path text,
    model_rotation_y double precision DEFAULT 0
);


ALTER TABLE public.dinosaurs OWNER TO blevin22;

--
-- Name: dinosaurs_id_seq; Type: SEQUENCE; Schema: public; Owner: blevin22
--

CREATE SEQUENCE public.dinosaurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dinosaurs_id_seq OWNER TO blevin22;

--
-- Name: dinosaurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blevin22
--

ALTER SEQUENCE public.dinosaurs_id_seq OWNED BY public.dinosaurs.id;


--
-- Name: unlocked_dinosaurs; Type: TABLE; Schema: public; Owner: blevin22
--

CREATE TABLE public.unlocked_dinosaurs (
    id integer NOT NULL,
    user_id integer,
    dinosaur_id integer
);


ALTER TABLE public.unlocked_dinosaurs OWNER TO blevin22;

--
-- Name: unlocked_dinosaurs_id_seq; Type: SEQUENCE; Schema: public; Owner: blevin22
--

CREATE SEQUENCE public.unlocked_dinosaurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.unlocked_dinosaurs_id_seq OWNER TO blevin22;

--
-- Name: unlocked_dinosaurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blevin22
--

ALTER SEQUENCE public.unlocked_dinosaurs_id_seq OWNED BY public.unlocked_dinosaurs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: blevin22
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50),
    password character varying(100),
    points integer DEFAULT 0
);


ALTER TABLE public.users OWNER TO blevin22;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: blevin22
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO blevin22;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blevin22
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: dinosaurs id; Type: DEFAULT; Schema: public; Owner: blevin22
--

ALTER TABLE ONLY public.dinosaurs ALTER COLUMN id SET DEFAULT nextval('public.dinosaurs_id_seq'::regclass);


--
-- Name: unlocked_dinosaurs id; Type: DEFAULT; Schema: public; Owner: blevin22
--

ALTER TABLE ONLY public.unlocked_dinosaurs ALTER COLUMN id SET DEFAULT nextval('public.unlocked_dinosaurs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: blevin22
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: dinosaurs; Type: TABLE DATA; Schema: public; Owner: blevin22
--

COPY public.dinosaurs (id, name, description, points_required, clue, model_path, image_url, model_scale, model_y_offset, diet, period, length, habitat, fun_fact, image_path, silhouette_path, model_rotation_y) FROM stdin;
4	Tyrannosaurus Rex	Large carnivorous predator	100	Huge carnivore with tiny arms	/models/trex.glb	/images/trex.jpg	1	-2.5	Carnivore	Late Cretaceous	About 40 feet long	Forested river valleys and coastal plains in western North America	Tyrannosaurus had one of the strongest bite forces of any land animal ever discovered.	/images/trex.jpg	\N	-1
3	Stegosaurus	Plated dinosaur with spiked tail	60	Back plates and spiked tail	/models/stegosaurus.glb	/images/stegosaurus.jpg	1	-2	Herbivore	Late Jurassic	About 26 to 30 feet long	Semi-arid plains and fern-rich environments in North America	Stegosaurus had a tiny brain compared to its body and used its spiked tail for protection.	/images/stegosaurus.jpg	\N	-1
6	Brachiosaurus	A massive long-necked dinosaur that could reach high into the trees.	120	A giant dinosaur with a very long neck and longer front legs than back legs	/models/brachiosaurus.glb	\N	0.6	-1	Herbivore	Late Jurassic	About 70 to 85 feet long	Open woodlands and fern-rich environments in North America	Brachiosaurus could browse vegetation much higher than many other dinosaurs.	/images/brachiosaurus.jpg	\N	0
5	Ankylosaurus	A heavily armored herbivore with a powerful club tail.	80	An armored dinosaur with a club at the end of its tail	/models/ankylosaurus.glb	\N	9	-0.8	Herbivore	Late Cretaceous	About 20 to 26 feet long	Wooded floodplains in western North America	Ankylosaurus used its bony tail club as a powerful defense against predators.	/images/ankylosaurus.jpg	\N	-1
2	Triceratops	Three-horned herbivore	40	Three horns and a large frill	/models/triceratops.glb	/images/triceratops.jpg	1.3	-2	Herbivore	Late Cretaceous	About 26 to 30 feet long	Floodplains and forested regions in western North America	Triceratops used its large frill and three horns for defense and display.	/images/triceratops.jpg	\N	-1
1	Velociraptor	Fast and intelligent predator	20	Fast and intelligent predator	/models/velociraptor.glb	/images/velociraptor.jpg	2.5	-2.5	Carnivore	Late Cretaceous	About 6.5 feet long	Dry environments in what is now Mongolia	Velociraptor was much smaller than movies usually show and likely had feathers.	/images/velociraptor.jpg	\N	-1
\.


--
-- Data for Name: unlocked_dinosaurs; Type: TABLE DATA; Schema: public; Owner: blevin22
--

COPY public.unlocked_dinosaurs (id, user_id, dinosaur_id) FROM stdin;
1	10	1
2	10	2
3	10	3
4	10	4
5	11	1
6	11	2
7	11	3
8	11	4
9	13	1
10	15	1
11	15	2
12	15	3
13	18	1
14	18	2
15	18	3
16	18	5
17	18	4
18	18	6
19	21	1
20	21	2
21	21	3
22	21	5
23	21	4
24	21	6
25	25	1
26	25	2
27	25	3
28	25	4
29	25	5
30	26	1
31	26	2
32	26	3
33	26	4
34	26	5
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: blevin22
--

COPY public.users (id, username, password, points) FROM stdin;
26	demo1	$2b$10$mIL9p.GWCuuCR6otBfhzfO7amyCPOhXedUcMVlDoNlpu0w0IWFOcm	105
16		$2b$10$dvwsvv0P6j7TIXOAZrXciu2cpQ1DuHthJlfRCQnSg24/UDcSdg8Qq	0
17	krista	$2b$10$OEMvnNtiJ20kcXLGqXBcvuM3zkE06ifgC5fCWL9WyyGm7t110yHAC	0
15	bella	$2b$10$nEX1FDoq4u1dbVrC.Yet0OHEVzlgLe4MwOJWIX.a.B06mHcsqowr6	60
18	tester	$2b$10$aShCA2EqcR/LGRb8aIgWRubb4IRrTSBxRFw49KFqXq4330MsWZF7S	150
19	bob	$2b$10$o8dCtFUyIlxtJg6J69HaPeT519gTOrVmHRywoBOWJtpCVBa6P1Beu	0
20	Wittsux	$2b$10$woc4jE8lxhOJNAVRGdmcjuqejZGWphFjgHqCvl14CVKCB3QdPRJKC	0
21	wittsux	$2b$10$jftrhyfEcVc8jFwbaLNMpujeiucl3FoT4thLYQEsupmgVnOHBy.wO	125
22	newtest	$2b$10$a6xxS15Pne8GpE6Zi/f51uAsmcPrDtIMsfqBR2NISbm0HiJkZOBGC	0
23	tenzzd	$2b$10$./KEMIcmzLIa04pcLz2dzuot9KWyDyueNOA63WslB5eqyu4Griu/i	0
25	tenzzdd	$2b$10$gm93o0b99EJaj3WCRcWvrOkAVEHR8wXlr7yMtHYVMPaOjHhC5r16e	110
\.


--
-- Name: dinosaurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: blevin22
--

SELECT pg_catalog.setval('public.dinosaurs_id_seq', 6, true);


--
-- Name: unlocked_dinosaurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: blevin22
--

SELECT pg_catalog.setval('public.unlocked_dinosaurs_id_seq', 34, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: blevin22
--

SELECT pg_catalog.setval('public.users_id_seq', 26, true);


--
-- Name: dinosaurs dinosaurs_pkey; Type: CONSTRAINT; Schema: public; Owner: blevin22
--

ALTER TABLE ONLY public.dinosaurs
    ADD CONSTRAINT dinosaurs_pkey PRIMARY KEY (id);


--
-- Name: users unique_username; Type: CONSTRAINT; Schema: public; Owner: blevin22
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- Name: unlocked_dinosaurs unlocked_dinosaurs_pkey; Type: CONSTRAINT; Schema: public; Owner: blevin22
--

ALTER TABLE ONLY public.unlocked_dinosaurs
    ADD CONSTRAINT unlocked_dinosaurs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: blevin22
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict zxpN9kihXKr3ZUYaETpBEJRLD22Ybb3J5Lu1MLjOcLmXf4ejf1jV5zaVYKweXXz

