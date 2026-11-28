-- Dibuat oleh buat_rekomendasi.py. Tempel di Supabase SQL Editor lalu Run.
-- Sumber data: data.csv (22 user, 5 produk)
begin;
delete from public.rekomendasi;
insert into public.rekomendasi (user_id, item_id, peringkat)
select pm.user_id, v.item_id, v.peringkat
from (values
  ('06c56ebf-2e14-41da-a788-427de91c1d9b', 'e83b395c-0248-4ac2-94de-24848ab3b894', 1),
  ('06c56ebf-2e14-41da-a788-427de91c1d9b', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 2),
  ('106c85d7-c98d-4656-bee7-32709948546a', 'e83b395c-0248-4ac2-94de-24848ab3b894', 1),
  ('106c85d7-c98d-4656-bee7-32709948546a', 'bb6c06bb-0c3f-4951-91eb-a52bb1620535', 2),
  ('2756f831-1d4f-4638-84be-0e8130bc0bcb', 'e83b395c-0248-4ac2-94de-24848ab3b894', 1),
  ('435a8825-3c66-4e42-b449-7b6eafdb4913', 'bb6c06bb-0c3f-4951-91eb-a52bb1620535', 1),
  ('435a8825-3c66-4e42-b449-7b6eafdb4913', 'e83b395c-0248-4ac2-94de-24848ab3b894', 2),
  ('4956d999-a56d-4148-9940-f5cb27f529c5', 'bb6c06bb-0c3f-4951-91eb-a52bb1620535', 1),
  ('4f6c7044-0ec0-4e08-b33e-abf721eb6d20', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 1),
  ('4f6c7044-0ec0-4e08-b33e-abf721eb6d20', 'f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 2),
  ('55e27e4f-c92f-4550-8b0a-3b891171d9e0', 'e83b395c-0248-4ac2-94de-24848ab3b894', 1),
  ('5a13d7d2-bb5b-4378-bdb1-7f4c8e4157c9', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 1),
  ('5a13d7d2-bb5b-4378-bdb1-7f4c8e4157c9', 'e83b395c-0248-4ac2-94de-24848ab3b894', 2),
  ('6dc83544-1f0e-4d9f-b7f2-89dd804fc858', 'ba084bae-1a3d-4060-b463-e1ea84249fc4', 1),
  ('6dc83544-1f0e-4d9f-b7f2-89dd804fc858', 'bb6c06bb-0c3f-4951-91eb-a52bb1620535', 2),
  ('8137a719-a047-4521-b37c-da645e5186c7', 'e83b395c-0248-4ac2-94de-24848ab3b894', 1),
  ('8137a719-a047-4521-b37c-da645e5186c7', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 2),
  ('866a150b-d6bc-45de-bd9b-8265c8022665', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 1),
  ('866a150b-d6bc-45de-bd9b-8265c8022665', 'f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 2),
  ('871e71b6-58f2-4d07-808c-3da749b020c7', 'ba084bae-1a3d-4060-b463-e1ea84249fc4', 1),
  ('871e71b6-58f2-4d07-808c-3da749b020c7', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 2),
  ('87ba2731-7d11-4560-86e0-0ace1cb2bd84', 'f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 1),
  ('87ba2731-7d11-4560-86e0-0ace1cb2bd84', 'bb6c06bb-0c3f-4951-91eb-a52bb1620535', 2),
  ('8d873c1e-6978-4731-a8cb-17c93b47ad7e', 'ba084bae-1a3d-4060-b463-e1ea84249fc4', 1),
  ('8d873c1e-6978-4731-a8cb-17c93b47ad7e', 'bb6c06bb-0c3f-4951-91eb-a52bb1620535', 2),
  ('9a81b306-376f-4689-8178-c93cee272568', 'f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 1),
  ('bbbcf5e6-df09-44fa-bb69-689bdddb02b0', 'f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 1),
  ('bbbcf5e6-df09-44fa-bb69-689bdddb02b0', 'bb6c06bb-0c3f-4951-91eb-a52bb1620535', 2),
  ('d6c229b8-6935-49e4-a1ad-5728f5ed16f6', 'f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 1),
  ('d6c229b8-6935-49e4-a1ad-5728f5ed16f6', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 2),
  ('d7bd096b-18d9-4cbe-ba9e-02a2ad292e1b', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 1),
  ('d7bd096b-18d9-4cbe-ba9e-02a2ad292e1b', 'ba084bae-1a3d-4060-b463-e1ea84249fc4', 2),
  ('dd1de4d3-6489-41d8-9dfb-4e5c7d155125', 'e83b395c-0248-4ac2-94de-24848ab3b894', 1),
  ('dd1de4d3-6489-41d8-9dfb-4e5c7d155125', 'bb6c06bb-0c3f-4951-91eb-a52bb1620535', 2),
  ('ec0e667e-28b0-46d8-9f13-6bd666c18084', 'f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 1),
  ('ec0e667e-28b0-46d8-9f13-6bd666c18084', 'ba084bae-1a3d-4060-b463-e1ea84249fc4', 2),
  ('f0d0214e-315d-40b4-8f7e-1b014911e9f5', 'e83b395c-0248-4ac2-94de-24848ab3b894', 1),
  ('f0d0214e-315d-40b4-8f7e-1b014911e9f5', '1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 2),
  ('f85fe187-9066-464b-9b96-8d2f26d1726f', 'ba084bae-1a3d-4060-b463-e1ea84249fc4', 1),
  ('f85fe187-9066-464b-9b96-8d2f26d1726f', 'f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 2)
) as v(kode, item_id, peringkat)
join public.pemetaan_user pm on pm.kode = v.kode;
delete from public.produk_populer;
insert into public.produk_populer (item_id, peringkat, jumlah_user)
values
  ('ba084bae-1a3d-4060-b463-e1ea84249fc4', 1, 16),
  ('bb6c06bb-0c3f-4951-91eb-a52bb1620535', 2, 14),
  ('f269708a-c8ec-43a0-9e16-5ac8f9e62d0f', 3, 14),
  ('1426398a-77ab-4a2b-99e1-54c2f4e47f0e', 4, 13),
  ('e83b395c-0248-4ac2-94de-24848ab3b894', 5, 13);
commit;
