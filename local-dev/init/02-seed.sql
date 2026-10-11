-- =====================================================================
-- Seed the local mirror with the same demo records the frontend ships.
-- Ids are stable and identical to the app's in-browser seed() data.
-- =====================================================================

INSERT INTO programs (id, name, age, timing, fee, capacity, img, status, description) VALUES
  ('p1','Infant Care','6 mo – 2 yrs','8:00 AM – 6:00 PM',14000,12,'/assets/artwork.jpg','Active','A gentle, nurturing nest focused on sensory play, secure attachment and early milestones.'),
  ('p2','Toddlers','2 – 3 yrs','9:00 AM – 1:00 PM',9500,18,'/assets/artwork.jpg','Active','Joyful exploration that builds independence, language and fine-motor confidence.'),
  ('p3','Preschool','3 – 4 yrs','9:00 AM – 1:00 PM',9500,24,'/assets/artwork.jpg','Active','Play-based foundations in phonics, numbers, creativity and social-emotional skills.'),
  ('p4','Pre-K & Kindergarten','4 – 6 yrs','9:00 AM – 2:00 PM',11000,24,'/assets/artwork.jpg','Active','School-readiness with reading, early math, STEM projects and confident communication.'),
  ('p5','Full-Day Daycare','1.5 – 8 yrs','8:00 AM – 7:00 PM',16000,30,'/assets/room.jpg','Active','Flexible, home-like care with fresh meals, nap time and enriching afternoon activities.'),
  ('p6','After-School Club','5 – 10 yrs','2:00 PM – 7:00 PM',7000,20,'/assets/artwork.jpg','Active','Homework help, art, music, coding play and outdoor games in a caring space.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, pass, role, name, program, student_id) VALUES
  ('u1','admin@littleaarodiv.com','admin123','admin','Meera Krishnan',NULL,NULL),
  ('u2','teacher@littleaarodiv.com','teacher123','teacher','Ananya Bose','Preschool',NULL),
  ('u3','parent@littleaarodiv.com','parent123','parent','Priya Sharma',NULL,'s1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id, name, tagline, phone, email, address, hours, ratio, session) VALUES
  (1,'Little Aarodiv','Tiny Hands, Endless Possibilities','+91 98765 43210','hello@littleaarodiv.com','Plot 24, Road No. 12, Banjara Hills, Hyderabad 500034','Mon – Sat · 8:00 AM – 7:00 PM','1 : 6','2026 – 27')
ON CONFLICT (id) DO NOTHING;