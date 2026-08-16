INSERT INTO platforms (id,name,description,color,upload_by,position) VALUES
('originals','Cinora Originals','Des histoires créées exclusivement pour CINORA.','#e5092b','Équipe CINORA',1),
('north','Studio North','Polars atmosphériques et drames contemporains.','#376bff','Studio North',2),
('atlas','Atlas','Voyages, aventures et récits du bout du monde.','#e5a833','Atlas',3),
('vector','Vector','Science-fiction et nouvelles technologies.','#8d5cff','Vector',4)
ON CONFLICT (id) DO UPDATE SET name=excluded.name,description=excluded.description,color=excluded.color;

INSERT INTO subjects (id,slug,subject_type,title,description,release_date,duration_seconds,genres,cover_url,backdrop_url,country_name,rating,rating_count,subtitles,corner,quality,has_resource,popularity,featured) VALUES
('c01','eclipse-protocol',1,'Eclipse Protocol','À la lisière du système solaire, une astronaute capte un signal qui semble connaître chacun de ses souvenirs.','2026-04-12',7920,ARRAY['Science-fiction','Thriller'],'/images/poster-signal.jpg','/images/hero-eclipse.jpg','France',8.7,18420,ARRAY['Français','English'],'13+','4K HDR',true,100,true),
('c02','black-harbor',1,'Black Harbor','Une inspectrice revient dans le port de son enfance pour élucider une disparition que toute la ville veut oublier.','2025-10-03',7080,ARRAY['Policier','Drame'],'/images/poster-harbor.jpg','/images/poster-harbor.jpg','Belgique',8.2,11340,ARRAY['Français','English'],'16+','4K',true,88,false),
('c03','astra',1,'Astra','Perdue au-dessus d’un océan extraterrestre, une pilote doit décider si le retour sur Terre est encore ce qu’elle désire.','2026-06-21',7560,ARRAY['Science-fiction','Drame'],'/images/poster-astra.jpg','/images/poster-astra.jpg','France',9.1,25100,ARRAY['Français','English'],'10+','4K HDR',true,98,true),
('c04','kingdom-of-embers',1,'Kingdom of Embers','Dans un royaume bâti sur les cendres, une cavalière porte le dernier message capable d’empêcher une guerre.','2024-11-08',8640,ARRAY['Aventure','Drame'],'/images/poster-ember.jpg','/images/poster-ember.jpg','Royaume-Uni',7.9,9520,ARRAY['Français','English'],'13+','4K',true,76,false),
('c05','room-17',1,'Room 17','Chaque nuit à 3 h 17, une porte apparaît au bout du couloir.','2025-03-14',6240,ARRAY['Mystère','Thriller'],'/images/poster-room.jpg','/images/poster-room.jpg','Canada',7.7,7210,ARRAY['Français','English'],'16+','HD',true,70,false),
('c06','neon-district',2,'Neon District','Une messagère clandestine traverse la mégalopole pour livrer une preuve qui peut renverser le système.','2026-02-01',3240,ARRAY['Science-fiction','Policier'],'/images/poster-city.jpg','/images/poster-city.jpg','Corée du Sud',8.5,19760,ARRAY['Français','English','한국어'],'16+','4K HDR',true,94,true),
('c07','northbound',2,'Northbound','Trois inconnus s’engagent dans une traversée polaire dont aucun itinéraire ne mentionne la véritable destination.','2023-12-02',2820,ARRAY['Aventure','Mystère'],'/images/poster-wild.jpg','/images/poster-wild.jpg','Norvège',8.0,10200,ARRAY['Français','English'],'13+','4K',true,82,false),
('c08','ghost-circuit',2,'Ghost Circuit','Un ingénieur découvre qu’une intelligence disparue continue de modifier le réseau.','2025-08-17',3060,ARRAY['Thriller','Science-fiction'],'/images/poster-circuit.jpg','/images/poster-circuit.jpg','États-Unis',8.4,16550,ARRAY['Français','English'],'13+','4K HDR',true,90,false),
('c09','after-the-last-train',1,'After the Last Train','Deux voyageurs se croisent chaque nuit sur un quai désert sans jamais monter dans le même train.','2024-05-23',6540,ARRAY['Romance','Drame'],'/images/poster-after.jpg','/images/poster-after.jpg','Italie',7.8,6300,ARRAY['Français','Italiano'],'Tous','4K',true,69,false),
('c10','red-signal',2,'Red Signal','Un phénomène radio réveille une petite ville du désert et révèle les secrets enfouis sous ses antennes.','2022-09-10',2760,ARRAY['Mystère','Drame'],'/images/poster-signal.jpg','/images/poster-signal.jpg','États-Unis',7.6,8400,ARRAY['Français','English'],'13+','HD',true,67,false),
('c11','silent-waters',1,'Silent Waters','Un village côtier garde le silence après le retour d’un bateau disparu depuis vingt ans.','2021-04-16',6840,ARRAY['Mystère','Policier'],'/images/poster-harbor.jpg','/images/poster-harbor.jpg','Irlande',7.5,5900,ARRAY['Français','English'],'13+','HD',true,61,false),
('c12','the-far-side',1,'The Far Side','Une cartographe découvre une vallée absente de toutes les images satellites et choisit d’y entrer seule.','2027-02-12',7260,ARRAY['Aventure','Science-fiction'],'/images/poster-wild.jpg','/images/poster-wild.jpg','Nouvelle-Zélande',8.3,0,ARRAY['Français','English'],'10+','4K',false,85,false)
ON CONFLICT (id) DO UPDATE SET title=excluded.title,description=excluded.description,popularity=excluded.popularity;

INSERT INTO staff (id,slug,name,biography,avatar_url,country_name) VALUES
('s01','mila-arden','Mila Arden','Actrice et productrice franco-canadienne.','/images/poster-astra.jpg','France'),
('s02','jonas-reed','Jonas Reed','Acteur britannique reconnu pour ses rôles de science-fiction.','/images/poster-signal.jpg','Royaume-Uni'),
('s03','nora-bell','Nora Bell','Actrice belge de cinéma et de théâtre.','/images/poster-harbor.jpg','Belgique'),
('s04','ari-chen','Ari Chen','Actrice et cascadeuse sud-coréenne.','/images/poster-city.jpg','Corée du Sud'),
('s05','leo-march','Leo March','Explorateur et acteur norvégien.','/images/poster-wild.jpg','Norvège')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subject_staff(subject_id,staff_id,character_name,credit_order) VALUES
('c01','s01','Mara Venn',1),('c01','s02','Elias Roe',2),('c02','s03','Inspectrice Hale',1),('c06','s04','Jin',1),('c07','s05','Erik',1),('c03','s01','Aya',1)
ON CONFLICT DO NOTHING;

INSERT INTO subject_platforms(subject_id,platform_id) VALUES
('c01','originals'),('c03','originals'),('c06','originals'),('c02','north'),('c11','north'),('c04','atlas'),('c07','atlas'),('c12','atlas'),('c08','vector'),('c10','vector')
ON CONFLICT DO NOTHING;

INSERT INTO home_sections(id,section_type,title,position,metadata) VALUES
('hero','BANNER','À la une',1,'{}'),('popular','SUBJECTS_MOVIE','Les plus regardés',2,'{}'),('new','SUBJECTS_MOVIE','Nouveautés',3,'{}'),('scifi','SUBJECTS_MOVIE','Aux frontières du réel',4,'{}'),('upcoming','APPOINTMENT_LIST','Prochainement',5,'{}')
ON CONFLICT (id) DO UPDATE SET title=excluded.title,position=excluded.position;
INSERT INTO home_section_items(section_id,subject_id,position) VALUES
('hero','c01',1),('popular','c01',1),('popular','c03',2),('popular','c06',3),('popular','c08',4),('popular','c02',5),('new','c03',1),('new','c06',2),('new','c01',3),('scifi','c01',1),('scifi','c03',2),('scifi','c06',3),('scifi','c08',4),('upcoming','c12',1)
ON CONFLICT DO NOTHING;

INSERT INTO seasons(subject_id,season_number,title) VALUES
('c06',1,'Saison 1'),('c06',2,'Saison 2'),('c07',1,'Saison 1'),('c08',1,'Saison 1'),('c10',1,'Saison 1')
ON CONFLICT DO NOTHING;
INSERT INTO episodes(id,season_id,episode_number,title,description,duration_seconds,thumbnail_url,release_date)
SELECT 'c06-s1-e1',id,1,'Le premier écho','Une transmission impossible traverse le silence.',2880,'/images/hero-eclipse.jpg','2026-02-01' FROM seasons WHERE subject_id='c06' AND season_number=1
ON CONFLICT DO NOTHING;
INSERT INTO episodes(id,season_id,episode_number,title,description,duration_seconds,thumbnail_url,release_date)
SELECT 'c06-s1-e2',id,2,'Point aveugle','Une anomalie apparaît dans les archives.',3120,'/images/poster-circuit.jpg','2026-02-08' FROM seasons WHERE subject_id='c06' AND season_number=1
ON CONFLICT DO NOTHING;
INSERT INTO episodes(id,season_id,episode_number,title,description,duration_seconds,thumbnail_url,release_date)
SELECT 'c06-s1-e3',id,3,'La chambre rouge','Le protocole ne suffit plus.',3000,'/images/poster-room.jpg','2026-02-15' FROM seasons WHERE subject_id='c06' AND season_number=1
ON CONFLICT DO NOTHING;

INSERT INTO rankings(id,slug,title,description,position) VALUES
('daily','top-du-jour','Top du jour','Les titres les plus regardés aujourd’hui.',1),('critics','choix-de-la-redaction','Choix de la rédaction','Notre sélection éditoriale.',2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO ranking_items(ranking_id,subject_id,position) VALUES
('daily','c01',1),('daily','c03',2),('daily','c06',3),('daily','c08',4),('daily','c02',5),('critics','c03',1),('critics','c02',2),('critics','c09',3)
ON CONFLICT DO NOTHING;

INSERT INTO blog_posts(id,slug,title,excerpt,content,cover_url,author_name,published,published_at) VALUES
('b01','bienvenue-sur-cinora','Bienvenue sur CINORA','Découvrez comment nous sélectionnons les histoires présentées sur la plateforme.','CINORA rassemble un catalogue éditorial de films et séries autorisés. Chaque sélection est organisée par genre, disponibilité et intérêt éditorial.','/images/hero-eclipse.jpg','Équipe CINORA',true,now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO custom_pages(id,page_key,title,layout,content) VALUES
('about','about','À propos de CINORA','editorial','{"headline":"Le cinéma vous appartient.","body":"Une plateforme locale, configurable et respectueuse des droits."}')
ON CONFLICT (site_key,page_key) DO NOTHING;

INSERT INTO seo_pages(path,title,description,keywords,h1,image_url,indexable) VALUES
('/','CINORA — Le cinéma vous appartient','Films et séries sélectionnés pour vous.','films,séries,cinéma','Votre prochaine histoire','/images/hero-eclipse.jpg',true),
('/browse','Explorer le catalogue','Parcourez les films et séries disponibles.','catalogue,films,séries','Explorer', '/images/hero-eclipse.jpg',true)
ON CONFLICT (path) DO UPDATE SET title=excluded.title,description=excluded.description;
