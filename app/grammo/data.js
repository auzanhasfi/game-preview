/* ============================================================
   Grammo — materi grammar bahasa Inggris (dwibahasa ID / EN)
   Setiap teks penjelasan berbentuk { id: '...', en: '...' }.
   Kalimat contoh selalu bahasa Inggris + terjemahan Indonesia.
   Penanda dalam rumus/contoh:  *kata*  -> disorot hijau
   ============================================================ */

const KATEGORI = {
  tenses: { id: 'Tenses', en: 'Tenses', warna: 'lime' },
  kata:   { id: 'Jenis Kata', en: 'Word Types', warna: 'pink' },
  kalimat:{ id: 'Kalimat', en: 'Sentences', warna: 'mint' }
};

const TOPIK = [
  {
    id: 'parts', kat: 'kata', level: 'Dasar', ikon: 'blok', no: 1,
    judul: { en: 'Parts of Speech', id: 'Jenis-jenis Kata' },
    ringkas: { en: 'The 8 word types that build every English sentence.', id: '8 jenis kata yang membangun setiap kalimat bahasa Inggris.' },
    penjelasan: {
      en: 'Every English word has a job. A noun names a thing, a verb shows an action, an adjective describes a noun, and an adverb describes a verb. When you know the job of each word, you can build sentences like Lego blocks.',
      id: 'Setiap kata bahasa Inggris punya tugas. Noun memberi nama benda, verb menunjukkan tindakan, adjective menjelaskan noun, dan adverb menjelaskan verb. Kalau kamu tahu tugas setiap kata, kamu bisa menyusun kalimat seperti balok Lego.'
    },
    rumus: [
      ['Noun', 'kata benda', '*cat*, *school*, *Rina*'],
      ['Verb', 'kata kerja', '*run*, *eat*, *is*'],
      ['Adjective', 'kata sifat', '*big*, *happy*, *red*'],
      ['Adverb', 'kata keterangan', '*quickly*, *always*, *very*'],
      ['Pronoun', 'kata ganti', '*I*, *she*, *them*'],
      ['Preposition', 'kata depan', '*in*, *on*, *under*'],
      ['Conjunction', 'kata sambung', '*and*, *but*, *because*'],
      ['Interjection', 'kata seru', '*Wow!*, *Oops!*']
    ],
    guna: [
      { en: 'Adjectives usually come BEFORE the noun: a *red* bag.', id: 'Adjective biasanya diletakkan SEBELUM noun: a *red* bag (tas merah). Urutannya terbalik dari bahasa Indonesia!' },
      { en: 'Many adverbs end in -ly: quick → *quickly*.', id: 'Banyak adverb berakhiran -ly: quick → *quickly* (dengan cepat).' },
      { en: 'One word can change its job: a *run* (noun) / I *run* (verb).', id: 'Satu kata bisa berganti tugas: a *run* (noun, lari pagi) / I *run* (verb, saya berlari).' }
    ],
    sinyal: ['the / a + noun', '-ly = adverb', '-ful, -ous = adjective', '-tion, -ness = noun'],
    contoh: [
      ['The *small* cat *sleeps* *quietly*.', 'Kucing kecil itu tidur dengan tenang.', 'Adj · Verb · Adv'],
      ['*She* reads *in* the library.', 'Dia membaca di perpustakaan.', 'Pronoun · Prep'],
      ['I like tea, *but* he likes coffee.', 'Saya suka teh, tapi dia suka kopi.', 'Conjunction'],
      ['*Wow!* That is a *beautiful* garden.', 'Wah! Itu taman yang indah.', 'Interjection · Adj']
    ],
    salah: [
      ['a bag red', 'a red bag', { en: 'Adjective goes before the noun.', id: 'Adjective ditaruh sebelum noun.' }],
      ['She runs quick.', 'She runs quickly.', { en: 'Use an adverb to describe a verb.', id: 'Untuk menjelaskan verb, pakai adverb (-ly).' }]
    ],
    kuiz: [
      { s: 'My brother is very ___ .', p: ['tall', 'tallly', 'tallness', 'talls'], j: 0, why: { en: 'After "is" we need an adjective.', id: 'Setelah "is" kita butuh adjective (kata sifat).' } },
      { s: 'He drives ___ .', p: ['careful', 'carefully', 'care', 'careness'], j: 1, why: { en: '"Carefully" is an adverb describing "drives".', id: '"Carefully" adalah adverb yang menjelaskan "drives".' } },
      { s: 'Which word is a NOUN?', p: ['quickly', 'happy', 'teacher', 'swim'], j: 2, why: { en: '"Teacher" names a person.', id: '"Teacher" adalah nama orang/profesi, jadi noun.' } },
      { s: 'The book is ___ the table.', p: ['and', 'on', 'very', 'she'], j: 1, why: { en: '"On" is a preposition of place.', id: '"On" adalah preposition (kata depan) tempat: di atas.' } },
      { s: 'I was tired, ___ I went to bed early.', p: ['so', 'under', 'quickly', 'wow'], j: 0, why: { en: '"So" is a conjunction that joins two ideas.', id: '"So" adalah conjunction yang menyambung dua ide (jadi/maka).' } }
    ]
  },
  {
    id: 'present', kat: 'tenses', level: 'Dasar', ikon: 'jam', no: 2,
    judul: { en: 'Simple Present', id: 'Simple Present Tense' },
    ringkas: { en: 'Habits, facts and daily routines.', id: 'Kebiasaan, fakta, dan rutinitas harian.' },
    penjelasan: {
      en: 'Use the simple present for things that are always true or happen regularly. The verb stays in its base form, but with he, she and it you add -s or -es. For negatives and questions, use the helper do or does.',
      id: 'Gunakan simple present untuk hal yang selalu benar atau terjadi berulang. Kata kerjanya bentuk dasar (V1), tetapi untuk he, she, dan it ditambah -s atau -es. Untuk kalimat negatif dan tanya, pakai kata bantu do atau does.'
    },
    rumus: [
      ['(+)', 'Positif', 'S + V1 (*-s/-es*) + O'],
      ['(−)', 'Negatif', 'S + *do/does not* + V1 + O'],
      ['(?)', 'Tanya', '*Do/Does* + S + V1 + O?']
    ],
    guna: [
      { en: 'Habits and routines: I *wake up* at 5.', id: 'Kebiasaan & rutinitas: I *wake up* at 5 (Saya bangun jam 5).' },
      { en: 'General facts: Water *boils* at 100°C.', id: 'Fakta umum: Water *boils* at 100°C (Air mendidih pada 100°C).' },
      { en: 'Schedules: The bus *leaves* at 7.', id: 'Jadwal: The bus *leaves* at 7 (Bus berangkat jam 7).' }
    ],
    sinyal: ['always', 'usually', 'often', 'sometimes', 'never', 'every day'],
    contoh: [
      ['She *goes* to school by bike.', 'Dia pergi ke sekolah naik sepeda.', 'he/she/it + -es'],
      ['We *don\'t eat* meat.', 'Kami tidak makan daging.', 'Negatif'],
      ['*Does* he *play* football?', 'Apakah dia bermain sepak bola?', 'Tanya'],
      ['The sun *rises* in the east.', 'Matahari terbit di timur.', 'Fakta'],
      ['My mother *watches* TV every night.', 'Ibu saya menonton TV setiap malam.', 'watch → watches']
    ],
    salah: [
      ['He go to school.', 'He goes to school.', { en: 'He/she/it needs -s/-es.', id: 'Subjek he/she/it wajib pakai -s/-es.' }],
      ['She doesn\'t likes milk.', 'She doesn\'t like milk.', { en: 'After does/doesn\'t, the verb goes back to base form.', id: 'Setelah does/doesn\'t, verb kembali ke bentuk dasar (tanpa -s).' }]
    ],
    kuiz: [
      { s: 'My cat ___ fish every day.', p: ['eat', 'eats', 'eating', 'ate'], j: 1, why: { en: '"My cat" = it, so add -s.', id: '"My cat" = it, jadi verb ditambah -s.' } },
      { s: '___ you like ice cream?', p: ['Does', 'Is', 'Do', 'Are'], j: 2, why: { en: 'Use "Do" with you.', id: 'Untuk subjek "you" pakai "Do".' } },
      { s: 'He ___ coffee.', p: ['don\'t drink', 'doesn\'t drink', 'doesn\'t drinks', 'not drink'], j: 1, why: { en: 'He + doesn\'t + base verb.', id: 'He + doesn\'t + V1 (tanpa -s).' } },
      { s: 'The shop ___ at 9 a.m.', p: ['opens', 'open', 'opening', 'is open to'], j: 0, why: { en: 'A schedule with "the shop" (it) → opens.', id: 'Jadwal, subjek "the shop" (it) → opens.' } },
      { s: 'Rina ___ her homework every evening.', p: ['do', 'dos', 'does', 'doing'], j: 2, why: { en: 'do → does for she.', id: 'do berubah menjadi does untuk she.' } }
    ]
  },
  {
    id: 'continuous', kat: 'tenses', level: 'Dasar', ikon: 'putar', no: 3,
    judul: { en: 'Present Continuous', id: 'Present Continuous Tense' },
    ringkas: { en: 'Actions happening right now.', id: 'Kegiatan yang sedang terjadi sekarang.' },
    penjelasan: {
      en: 'Use the present continuous for actions in progress at this moment. You need two parts: am/is/are plus the verb with -ing. Think of it as a photo of what is happening now.',
      id: 'Gunakan present continuous untuk kegiatan yang sedang berlangsung saat ini. Kamu butuh dua bagian: am/is/are ditambah verb berakhiran -ing. Bayangkan seperti foto dari kejadian yang sedang terjadi.'
    },
    rumus: [
      ['(+)', 'Positif', 'S + *am/is/are* + V-*ing*'],
      ['(−)', 'Negatif', 'S + *am/is/are not* + V-ing'],
      ['(?)', 'Tanya', '*Am/Is/Are* + S + V-ing?']
    ],
    guna: [
      { en: 'Happening now: I *am reading*.', id: 'Sedang terjadi sekarang: I *am reading* (Saya sedang membaca).' },
      { en: 'Temporary situations: She *is staying* with her aunt this week.', id: 'Situasi sementara: She *is staying* with her aunt this week (Dia menginap di rumah bibinya minggu ini).' },
      { en: 'Fixed future plans: We *are visiting* Bali tomorrow.', id: 'Rencana pasti: We *are visiting* Bali tomorrow (Kami akan ke Bali besok).' }
    ],
    sinyal: ['now', 'right now', 'at the moment', 'Look!', 'Listen!'],
    contoh: [
      ['Look! The baby *is sleeping*.', 'Lihat! Bayinya sedang tidur.', 'is + V-ing'],
      ['They *are playing* badminton now.', 'Mereka sedang bermain bulu tangkis.', 'are + V-ing'],
      ['I *am not watching* TV.', 'Saya tidak sedang menonton TV.', 'Negatif'],
      ['*Are* you *listening* to me?', 'Apakah kamu mendengarkan saya?', 'Tanya']
    ],
    salah: [
      ['She cooking now.', 'She is cooking now.', { en: 'Do not forget am/is/are.', id: 'Jangan lupa am/is/are.' }],
      ['I am swiming.', 'I am swimming.', { en: 'Short vowel + consonant: double the last letter.', id: 'Vokal pendek + konsonan: huruf terakhir digandakan (swim → swimming).' }]
    ],
    kuiz: [
      { s: 'Listen! Someone ___ the piano.', p: ['play', 'plays', 'is playing', 'are playing'], j: 2, why: { en: '"Listen!" shows it is happening now; someone = is.', id: '"Listen!" menandakan sedang terjadi; someone memakai is.' } },
      { s: 'We ___ for the bus at the moment.', p: ['are waiting', 'is waiting', 'waiting', 'wait'], j: 0, why: { en: 'We + are + V-ing.', id: 'We + are + V-ing.' } },
      { s: 'The children ___ (not) sleeping.', p: ['is not', 'are not', 'am not', 'do not'], j: 1, why: { en: 'Children is plural → are not.', id: 'Children itu jamak → are not.' } },
      { s: 'Correct spelling: run → ___', p: ['runing', 'runeing', 'running', 'runnig'], j: 2, why: { en: 'Double the n: running.', id: 'Huruf n digandakan: running.' } },
      { s: '___ she writing a letter?', p: ['Do', 'Is', 'Are', 'Does'], j: 1, why: { en: 'She → Is.', id: 'Subjek she → Is.' } }
    ]
  },
  {
    id: 'past', kat: 'tenses', level: 'Dasar', ikon: 'mundur', no: 4,
    judul: { en: 'Simple Past', id: 'Simple Past Tense' },
    ringkas: { en: 'Finished actions in the past.', id: 'Kegiatan yang sudah selesai di masa lalu.' },
    penjelasan: {
      en: 'Use the simple past for actions that started and finished in the past. Regular verbs add -ed. Irregular verbs change form (go → went). For negatives and questions use did, and the verb returns to its base form.',
      id: 'Gunakan simple past untuk kegiatan yang dimulai dan selesai di masa lalu. Verb beraturan ditambah -ed. Verb tidak beraturan berubah bentuk (go → went). Untuk negatif dan tanya pakai did, lalu verb kembali ke bentuk dasar.'
    },
    rumus: [
      ['(+)', 'Positif', 'S + *V2* (-ed / irregular) + O'],
      ['(−)', 'Negatif', 'S + *did not* + V1 + O'],
      ['(?)', 'Tanya', '*Did* + S + V1 + O?']
    ],
    guna: [
      { en: 'A finished action: I *visited* Grandma yesterday.', id: 'Kegiatan selesai: I *visited* Grandma yesterday (Saya mengunjungi Nenek kemarin).' },
      { en: 'A series of past actions: He *woke up*, *ate* and *left*.', id: 'Rangkaian kejadian lampau: He *woke up*, *ate* and *left* (Dia bangun, makan, lalu pergi).' },
      { en: 'Past habits: We *played* outside every afternoon.', id: 'Kebiasaan masa lalu: We *played* outside every afternoon.' }
    ],
    sinyal: ['yesterday', 'last week', 'ago', 'in 2020', 'this morning'],
    contoh: [
      ['We *went* to the beach last Sunday.', 'Kami pergi ke pantai hari Minggu lalu.', 'go → went'],
      ['She *cleaned* her room.', 'Dia membersihkan kamarnya.', 'regular -ed'],
      ['I *didn\'t see* the movie.', 'Saya tidak menonton film itu.', 'Negatif'],
      ['*Did* you *finish* your homework?', 'Apakah kamu sudah menyelesaikan PR-mu?', 'Tanya'],
      ['He *bought* a new phone two days ago.', 'Dia membeli ponsel baru dua hari lalu.', 'buy → bought']
    ],
    salah: [
      ['I didn\'t went home.', 'I didn\'t go home.', { en: 'After did/didn\'t use the base verb.', id: 'Setelah did/didn\'t pakai V1.' }],
      ['She buyed a cake.', 'She bought a cake.', { en: '"Buy" is irregular.', id: '"Buy" adalah irregular verb: bought.' }]
    ],
    kuiz: [
      { s: 'Yesterday I ___ a cat in the park.', p: ['see', 'seed', 'saw', 'seen'], j: 2, why: { en: 'see → saw (irregular).', id: 'see → saw (irregular, V2).' } },
      { s: 'They ___ football last week.', p: ['play', 'played', 'plays', 'playing'], j: 1, why: { en: '"Last week" → simple past: played.', id: '"Last week" → simple past: played.' } },
      { s: '___ you call me last night?', p: ['Do', 'Did', 'Does', 'Were'], j: 1, why: { en: 'Past question → Did.', id: 'Pertanyaan masa lalu → Did.' } },
      { s: 'She didn\'t ___ breakfast.', p: ['ate', 'eats', 'eat', 'eaten'], j: 2, why: { en: 'didn\'t + base verb.', id: 'didn\'t + V1.' } },
      { s: 'We ___ to Bandung in 2022.', p: ['go', 'gone', 'goes', 'went'], j: 3, why: { en: 'go → went.', id: 'go → went (V2).' } }
    ]
  },
  {
    id: 'pastcont', kat: 'tenses', level: 'Menengah', ikon: 'putar', no: 5,
    judul: { en: 'Past Continuous', id: 'Past Continuous Tense' },
    ringkas: { en: 'What was happening at a moment in the past.', id: 'Apa yang sedang terjadi pada suatu saat di masa lalu.' },
    penjelasan: {
      en: 'Use the past continuous for an action that was in progress at a certain time in the past. It is often interrupted by a shorter action in the simple past, connected with when or while.',
      id: 'Gunakan past continuous untuk kegiatan yang sedang berlangsung pada waktu tertentu di masa lalu. Sering kali kegiatan itu disela oleh kejadian singkat dalam simple past, dihubungkan dengan when atau while.'
    },
    rumus: [
      ['(+)', 'Positif', 'S + *was/were* + V-*ing*'],
      ['(−)', 'Negatif', 'S + *was/were not* + V-ing'],
      ['(?)', 'Tanya', '*Was/Were* + S + V-ing?']
    ],
    guna: [
      { en: 'At a time in the past: At 8 p.m. I *was studying*.', id: 'Pada jam tertentu: At 8 p.m. I *was studying* (Jam 8 malam saya sedang belajar).' },
      { en: 'Interrupted action: I *was sleeping* when the phone *rang*.', id: 'Kegiatan yang disela: I *was sleeping* when the phone *rang* (Saya sedang tidur ketika telepon berdering).' },
      { en: 'Two actions at the same time: While she *was cooking*, he *was reading*.', id: 'Dua kegiatan bersamaan: While she *was cooking*, he *was reading*.' }
    ],
    sinyal: ['when', 'while', 'at 7 o\'clock yesterday', 'all night'],
    contoh: [
      ['It *was raining* when we arrived.', 'Hujan sedang turun ketika kami tiba.', 'was + V-ing'],
      ['They *were watching* TV at 9 p.m.', 'Mereka sedang menonton TV jam 9 malam.', 'were + V-ing'],
      ['I *wasn\'t listening*.', 'Saya tidak sedang mendengarkan.', 'Negatif'],
      ['*Were* you *sleeping*?', 'Apakah kamu sedang tidur?', 'Tanya']
    ],
    salah: [
      ['They was playing.', 'They were playing.', { en: 'They/we/you → were.', id: 'They/we/you → were.' }],
      ['When I was arriving, he left.', 'When I arrived, he was leaving.', { en: 'The short action uses simple past.', id: 'Kejadian singkat pakai simple past.' }]
    ],
    kuiz: [
      { s: 'I ___ dinner when you called.', p: ['was having', 'were having', 'am having', 'had having'], j: 0, why: { en: 'I + was + V-ing; interrupted by "called".', id: 'I + was + V-ing; disela oleh "called".' } },
      { s: 'While we ___ , the lights went out.', p: ['was studying', 'were studying', 'studied', 'study'], j: 1, why: { en: 'We + were.', id: 'We memakai were.' } },
      { s: 'What ___ you doing at 10 last night?', p: ['was', 'did', 'were', 'are'], j: 2, why: { en: 'You → were.', id: 'You → were.' } },
      { s: 'She was walking home when it ___ to rain.', p: ['started', 'was starting', 'starts', 'start'], j: 0, why: { en: 'The short, interrupting action → simple past.', id: 'Kejadian singkat yang menyela → simple past.' } },
      { s: 'He ___ (not) sleeping at midnight.', p: ['weren\'t', 'wasn\'t', 'didn\'t', 'isn\'t'], j: 1, why: { en: 'He → wasn\'t.', id: 'He → wasn\'t.' } }
    ]
  },
  {
    id: 'perfect', kat: 'tenses', level: 'Menengah', ikon: 'centang', no: 6,
    judul: { en: 'Present Perfect', id: 'Present Perfect Tense' },
    ringkas: { en: 'Past actions connected to now.', id: 'Kejadian lampau yang masih berhubungan dengan sekarang.' },
    penjelasan: {
      en: 'Use the present perfect when the time is not important or when a past action still matters now. Use have/has plus the past participle (V3). Do not use it with a finished time like yesterday.',
      id: 'Gunakan present perfect saat waktunya tidak penting atau kejadian lampau masih berpengaruh sekarang. Rumusnya have/has + V3. Jangan dipakai bersama waktu yang sudah selesai seperti yesterday.'
    },
    rumus: [
      ['(+)', 'Positif', 'S + *have/has* + *V3*'],
      ['(−)', 'Negatif', 'S + *have/has not* + V3'],
      ['(?)', 'Tanya', '*Have/Has* + S + V3?']
    ],
    guna: [
      { en: 'Experience: I *have visited* Lombok.', id: 'Pengalaman: I *have visited* Lombok (Saya pernah ke Lombok).' },
      { en: 'Result now: She *has lost* her key.', id: 'Hasilnya terasa sekarang: She *has lost* her key (Kuncinya hilang, belum ketemu).' },
      { en: 'Since / for: We *have lived* here *since* 2019.', id: 'Dengan since/for: We *have lived* here *since* 2019 (sampai sekarang masih tinggal).' }
    ],
    sinyal: ['already', 'yet', 'ever', 'never', 'just', 'since', 'for'],
    contoh: [
      ['I *have finished* my homework.', 'Saya sudah menyelesaikan PR saya.', 'have + V3'],
      ['He *has* never *eaten* durian.', 'Dia belum pernah makan durian.', 'has + V3'],
      ['*Have* you *seen* my bag?', 'Apakah kamu melihat tasku?', 'Tanya'],
      ['They *haven\'t arrived* yet.', 'Mereka belum tiba.', 'Negatif'],
      ['We *have known* her *for* five years.', 'Kami sudah mengenalnya selama lima tahun.', 'for']
    ],
    salah: [
      ['I have seen him yesterday.', 'I saw him yesterday.', { en: 'Finished time → simple past.', id: 'Waktu yang sudah selesai (yesterday) → simple past.' }],
      ['She have gone.', 'She has gone.', { en: 'He/she/it → has.', id: 'He/she/it → has.' }]
    ],
    kuiz: [
      { s: 'I ___ never ___ snow.', p: ['have / see', 'has / seen', 'have / seen', 'did / see'], j: 2, why: { en: 'I + have + V3 (seen).', id: 'I + have + V3 (seen).' } },
      { s: 'She ___ just finished her test.', p: ['have', 'has', 'is', 'did'], j: 1, why: { en: 'She → has.', id: 'She → has.' } },
      { s: 'We have lived here ___ 2018.', p: ['for', 'ago', 'since', 'yet'], j: 2, why: { en: 'A starting point → since.', id: 'Titik awal waktu → since.' } },
      { s: '___ you ever been to Bali?', p: ['Did', 'Have', 'Has', 'Are'], j: 1, why: { en: 'You → Have.', id: 'You → Have.' } },
      { s: 'They have known me ___ three years.', p: ['since', 'for', 'ago', 'already'], j: 1, why: { en: 'A length of time → for.', id: 'Lamanya waktu → for.' } }
    ]
  },
  {
    id: 'future', kat: 'tenses', level: 'Dasar', ikon: 'maju', no: 7,
    judul: { en: 'Simple Future', id: 'Simple Future Tense' },
    ringkas: { en: 'Will vs be going to.', id: 'Perbedaan will dan be going to.' },
    penjelasan: {
      en: 'Use will for quick decisions, promises and predictions without evidence. Use be going to for plans you already made and predictions you can see coming. After will, the verb is always the base form.',
      id: 'Gunakan will untuk keputusan spontan, janji, dan perkiraan tanpa bukti. Gunakan be going to untuk rencana yang sudah dibuat dan perkiraan yang ada buktinya. Setelah will, verb selalu bentuk dasar.'
    },
    rumus: [
      ['(+)', 'Will', 'S + *will* + V1'],
      ['(+)', 'Going to', 'S + *am/is/are going to* + V1'],
      ['(−)', 'Negatif', 'S + *won\'t* + V1']
    ],
    guna: [
      { en: 'Quick decision: I\'m thirsty. I *will buy* a drink.', id: 'Keputusan spontan: I\'m thirsty. I *will buy* a drink.' },
      { en: 'Plan: We *are going to visit* Yogya next month.', id: 'Rencana: We *are going to visit* Yogya next month.' },
      { en: 'Prediction with evidence: Look at the clouds! It *is going to rain*.', id: 'Perkiraan dengan bukti: Lihat awannya! It *is going to rain*.' }
    ],
    sinyal: ['tomorrow', 'next week', 'soon', 'later', 'in 2030'],
    contoh: [
      ['I *will help* you.', 'Saya akan membantumu.', 'janji'],
      ['She *is going to study* medicine.', 'Dia akan kuliah kedokteran.', 'rencana'],
      ['They *won\'t come* tonight.', 'Mereka tidak akan datang malam ini.', 'won\'t = will not'],
      ['*Will* it *be* sunny tomorrow?', 'Apakah besok akan cerah?', 'Tanya']
    ],
    salah: [
      ['I will to go.', 'I will go.', { en: 'No "to" after will.', id: 'Tidak ada "to" setelah will.' }],
      ['She going to cook.', 'She is going to cook.', { en: 'Don\'t forget am/is/are.', id: 'Jangan lupa am/is/are.' }]
    ],
    kuiz: [
      { s: 'The phone is ringing. I ___ answer it.', p: ['am going to', 'will', 'was', 'did'], j: 1, why: { en: 'A quick decision → will.', id: 'Keputusan spontan → will.' } },
      { s: 'Look at that car! It ___ crash!', p: ['will to', 'is going to', 'goes to', 'won\'t'], j: 1, why: { en: 'You can see it coming → going to.', id: 'Ada bukti di depan mata → going to.' } },
      { s: 'I will ___ you tomorrow.', p: ['calls', 'called', 'call', 'to call'], j: 2, why: { en: 'will + base verb.', id: 'will + V1.' } },
      { s: 'We ___ going to watch a movie tonight.', p: ['is', 'am', 'are', 'will'], j: 2, why: { en: 'We + are.', id: 'We + are.' } },
      { s: 'Don\'t worry, I ___ tell anyone.', p: ['won\'t', 'don\'t', 'didn\'t', 'am not'], j: 0, why: { en: 'A promise → won\'t.', id: 'Janji → won\'t (will not).' } }
    ]
  },
  {
    id: 'articles', kat: 'kata', level: 'Dasar', ikon: 'huruf', no: 8,
    judul: { en: 'Articles: a, an, the', id: 'Artikel: a, an, the' },
    ringkas: { en: 'When to use a, an or the.', id: 'Kapan memakai a, an, atau the.' },
    penjelasan: {
      en: 'A and an mean "one" and are used with singular things that are not specific. Choose by SOUND: an before a vowel sound (an hour), a before a consonant sound (a university). The is for something specific that both people know.',
      id: 'A dan an berarti "satu", dipakai untuk benda tunggal yang belum spesifik. Pilihnya berdasarkan BUNYI: an sebelum bunyi vokal (an hour), a sebelum bunyi konsonan (a university). The dipakai untuk benda tertentu yang sudah sama-sama diketahui.'
    },
    rumus: [
      ['a', 'bunyi konsonan', '*a* book, *a* uniform'],
      ['an', 'bunyi vokal', '*an* apple, *an* hour'],
      ['the', 'benda tertentu', '*the* sun, *the* book on the desk']
    ],
    guna: [
      { en: 'First mention → a/an, second mention → the.', id: 'Disebut pertama → a/an, disebut lagi → the: I saw *a* dog. *The* dog was cute.' },
      { en: 'Only one in the world → the: *the* moon.', id: 'Hanya ada satu di dunia → the: *the* moon (bulan).' },
      { en: 'No article with general plural or uncountable nouns: I like *cats*.', id: 'Tanpa artikel untuk jamak umum atau benda tak terhitung: I like *cats*. Water is important.' }
    ],
    sinyal: ['bunyi a-i-u-e-o', 'h tidak dibaca', 'u dibaca "yu"', 'sudah disebut'],
    contoh: [
      ['She is *an* honest girl.', 'Dia gadis yang jujur.', 'h tidak dibaca'],
      ['He studies at *a* university.', 'Dia kuliah di sebuah universitas.', 'u = "yu"'],
      ['Please close *the* door.', 'Tolong tutup pintunya.', 'pintu tertentu'],
      ['I need *an* umbrella.', 'Saya butuh sebuah payung.', 'bunyi vokal']
    ],
    salah: [
      ['a apple', 'an apple', { en: 'Vowel sound → an.', id: 'Bunyi vokal → an.' }],
      ['I play the football.', 'I play football.', { en: 'No article with sports.', id: 'Olahraga tidak memakai artikel.' }]
    ],
    kuiz: [
      { s: 'I ate ___ orange.', p: ['a', 'an', 'the', '—'], j: 1, why: { en: '"Orange" starts with a vowel sound.', id: '"Orange" diawali bunyi vokal → an.' } },
      { s: 'She waited for ___ hour.', p: ['a', 'an', 'the', '—'], j: 1, why: { en: 'The h is silent: "our".', id: 'Huruf h tidak dibaca ("aur") → an.' } },
      { s: '___ moon is bright tonight.', p: ['A', 'An', 'The', '—'], j: 2, why: { en: 'There is only one moon.', id: 'Bulan hanya ada satu → the.' } },
      { s: 'My father is ___ engineer.', p: ['a', 'an', 'the', '—'], j: 1, why: { en: 'Vowel sound → an.', id: 'Bunyi vokal → an.' } },
      { s: 'He wears ___ uniform.', p: ['a', 'an', 'the', '—'], j: 0, why: { en: '"Uniform" sounds like "yu".', id: '"Uniform" dibaca "yu" (bunyi konsonan) → a.' } }
    ]
  },
  {
    id: 'pronouns', kat: 'kata', level: 'Dasar', ikon: 'orang', no: 9,
    judul: { en: 'Pronouns', id: 'Kata Ganti (Pronoun)' },
    ringkas: { en: 'I, me, my, mine: which one when?', id: 'I, me, my, mine: kapan dipakai?' },
    penjelasan: {
      en: 'Pronouns replace nouns. Subject pronouns do the action (I, she). Object pronouns receive it (me, her). Possessive adjectives come before a noun (my book), and possessive pronouns stand alone (it is mine).',
      id: 'Pronoun menggantikan noun. Subject pronoun melakukan tindakan (I, she). Object pronoun menerima tindakan (me, her). Possessive adjective diikuti noun (my book), sedangkan possessive pronoun berdiri sendiri (it is mine).'
    },
    rumus: [
      ['Subjek', 'pelaku', '*I · you · he · she · it · we · they*'],
      ['Objek', 'penerima', '*me · you · him · her · it · us · them*'],
      ['Milik + noun', 'adjective', '*my · your · his · her · its · our · their*'],
      ['Milik sendiri', 'pronoun', '*mine · yours · his · hers · ours · theirs*']
    ],
    guna: [
      { en: 'Subject before the verb: *She* sings.', id: 'Subjek sebelum verb: *She* sings (Dia bernyanyi).' },
      { en: 'Object after the verb or preposition: Call *me*. Sit with *us*.', id: 'Objek setelah verb atau preposition: Call *me*. Sit with *us*.' },
      { en: 'Possessive pronoun replaces "my + noun": This pen is *mine*.', id: 'Possessive pronoun menggantikan "my + noun": This pen is *mine* (Pena ini milikku).' }
    ],
    sinyal: ['sebelum verb = subjek', 'setelah verb = objek', '+ noun = my/your', 'berdiri sendiri = mine'],
    contoh: [
      ['*They* invited *us* to the party.', 'Mereka mengundang kami ke pesta.', 'subjek · objek'],
      ['Is this *your* bag?', 'Apakah ini tasmu?', 'your + noun'],
      ['No, it is *hers*.', 'Bukan, itu miliknya (perempuan).', 'hers'],
      ['The cat licked *its* paw.', 'Kucing itu menjilat kakinya.', 'its (tanpa \')']
    ],
    salah: [
      ['Me and Andi play.', 'Andi and I play.', { en: 'Subject position → I.', id: 'Posisi subjek → I (sebut orang lain dulu).' }],
      ['The dog wagged it\'s tail.', 'The dog wagged its tail.', { en: 'It\'s = it is. Possessive is "its".', id: 'It\'s = it is. Kepemilikan ditulis "its".' }]
    ],
    kuiz: [
      { s: 'Please give ___ the ball.', p: ['I', 'me', 'my', 'mine'], j: 1, why: { en: 'After a verb → object pronoun.', id: 'Setelah verb → object pronoun (me).' } },
      { s: '___ are my best friends.', p: ['Them', 'Their', 'They', 'Theirs'], j: 2, why: { en: 'Subject → They.', id: 'Posisi subjek → They.' } },
      { s: 'This is Sinta. ___ mother is a nurse.', p: ['She', 'Her', 'Hers', 'His'], j: 1, why: { en: 'Before a noun → her.', id: 'Diikuti noun (mother) → her.' } },
      { s: 'That book isn\'t yours. It\'s ___ .', p: ['my', 'me', 'mine', 'I'], j: 2, why: { en: 'Standing alone → mine.', id: 'Berdiri sendiri → mine.' } },
      { s: 'We love ___ school.', p: ['our', 'ours', 'us', 'we'], j: 0, why: { en: 'Before a noun → our.', id: 'Diikuti noun → our.' } }
    ]
  },
  {
    id: 'compare', kat: 'kata', level: 'Menengah', ikon: 'naik', no: 10,
    judul: { en: 'Comparatives & Superlatives', id: 'Perbandingan (Comparative & Superlative)' },
    ringkas: { en: 'Taller, the tallest, more beautiful.', id: 'Lebih tinggi, paling tinggi, lebih indah.' },
    penjelasan: {
      en: 'Compare two things with the comparative (-er + than, or more + adjective). Compare three or more with the superlative (the + -est, or the most + adjective). Short adjectives take -er/-est; long ones take more/most.',
      id: 'Bandingkan dua hal dengan comparative (-er + than, atau more + adjective). Bandingkan tiga hal atau lebih dengan superlative (the + -est, atau the most + adjective). Adjective pendek pakai -er/-est; yang panjang pakai more/most.'
    },
    rumus: [
      ['Pendek', 'comparative', 'adj + *-er* + than'],
      ['Panjang', 'comparative', '*more* + adj + than'],
      ['Pendek', 'superlative', '*the* + adj + *-est*'],
      ['Panjang', 'superlative', '*the most* + adj']
    ],
    guna: [
      { en: 'Two things: Budi is *taller than* Andi.', id: 'Dua hal: Budi is *taller than* Andi (Budi lebih tinggi dari Andi).' },
      { en: 'Three or more: Budi is *the tallest* in class.', id: 'Tiga atau lebih: Budi is *the tallest* in class (paling tinggi di kelas).' },
      { en: 'Irregular: good → *better* → *the best*; bad → *worse* → *the worst*.', id: 'Tidak beraturan: good → *better* → *the best*; bad → *worse* → *the worst*.' }
    ],
    sinyal: ['than', 'the ... in/of', 'more', 'most'],
    contoh: [
      ['An elephant is *bigger than* a horse.', 'Gajah lebih besar dari kuda.', 'big → bigger'],
      ['This book is *more interesting than* that one.', 'Buku ini lebih menarik dari yang itu.', 'more'],
      ['Mount Everest is *the highest* mountain.', 'Everest adalah gunung tertinggi.', 'the -est'],
      ['She is *the best* singer in school.', 'Dia penyanyi terbaik di sekolah.', 'good → best']
    ],
    salah: [
      ['more bigger', 'bigger', { en: 'Do not use more and -er together.', id: 'Jangan pakai more dan -er sekaligus.' }],
      ['gooder', 'better', { en: '"Good" is irregular.', id: '"Good" tidak beraturan → better.' }]
    ],
    kuiz: [
      { s: 'A plane is ___ than a car.', p: ['fast', 'faster', 'fastest', 'more fast'], j: 1, why: { en: 'Two things, short adjective → faster.', id: 'Dua hal, adjective pendek → faster.' } },
      { s: 'This is ___ day of my life!', p: ['the happiest', 'happier', 'the most happy', 'happiest'], j: 0, why: { en: 'happy → the happiest (y → i).', id: 'happy → the happiest (y berubah jadi i).' } },
      { s: 'Math is ___ difficult than art for me.', p: ['most', 'the most', 'more', 'much'], j: 2, why: { en: 'Long adjective + than → more.', id: 'Adjective panjang + than → more.' } },
      { s: 'My score is ___ than yours.', p: ['gooder', 'better', 'best', 'more good'], j: 1, why: { en: 'good → better.', id: 'good → better.' } },
      { s: 'Jakarta is ___ city in Indonesia.', p: ['the biggest', 'bigger', 'the most big', 'biggest than'], j: 0, why: { en: 'Superlative of big → the biggest.', id: 'Superlative dari big → the biggest (g digandakan).' } }
    ]
  },
  {
    id: 'modals', kat: 'kalimat', level: 'Menengah', ikon: 'kunci', no: 11,
    judul: { en: 'Modal Verbs', id: 'Modal: can, must, should' },
    ringkas: { en: 'Ability, obligation and advice.', id: 'Kemampuan, kewajiban, dan saran.' },
    penjelasan: {
      en: 'Modal verbs add meaning to the main verb. Can shows ability or permission, must shows strong obligation, and should gives advice. After a modal, always use the base verb. Modals never take -s.',
      id: 'Modal menambah makna pada verb utama. Can menunjukkan kemampuan atau izin, must menunjukkan kewajiban kuat, dan should memberi saran. Setelah modal selalu pakai V1. Modal tidak pernah ditambah -s.'
    },
    rumus: [
      ['(+)', 'Positif', 'S + *modal* + V1'],
      ['(−)', 'Negatif', 'S + *modal + not* + V1'],
      ['(?)', 'Tanya', '*Modal* + S + V1?']
    ],
    guna: [
      { en: 'can = ability/permission: I *can swim*. *Can* I *go* out?', id: 'can = bisa/boleh: I *can swim*. *Can* I *go* out? (Boleh saya keluar?)' },
      { en: 'must = obligation: You *must wear* a helmet.', id: 'must = harus: You *must wear* a helmet.' },
      { en: 'should = advice: You *should sleep* early.', id: 'should = sebaiknya: You *should sleep* early.' }
    ],
    sinyal: ['can / could', 'must / mustn\'t', 'should', 'may'],
    contoh: [
      ['She *can speak* three languages.', 'Dia bisa berbicara tiga bahasa.', 'can'],
      ['Students *must not run* in the lab.', 'Siswa dilarang berlari di laboratorium.', 'mustn\'t'],
      ['You *should drink* more water.', 'Sebaiknya kamu minum lebih banyak air.', 'should'],
      ['*Can* you *help* me?', 'Bisakah kamu membantuku?', 'Tanya']
    ],
    salah: [
      ['He cans swim.', 'He can swim.', { en: 'No -s on modals.', id: 'Modal tidak pernah ditambah -s.' }],
      ['You must to study.', 'You must study.', { en: 'No "to" after must.', id: 'Tidak ada "to" setelah must.' }]
    ],
    kuiz: [
      { s: 'Birds ___ fly.', p: ['can', 'cans', 'must to', 'should to'], j: 0, why: { en: 'Ability → can.', id: 'Kemampuan → can.' } },
      { s: 'You look tired. You ___ rest.', p: ['can\'t', 'should', 'mustn\'t', 'shoulds'], j: 1, why: { en: 'Advice → should.', id: 'Saran → should.' } },
      { s: 'You ___ smoke here. It\'s a hospital.', p: ['must', 'should', 'mustn\'t', 'can'], j: 2, why: { en: 'Prohibition → mustn\'t.', id: 'Larangan → mustn\'t.' } },
      { s: 'She can ___ the guitar well.', p: ['plays', 'playing', 'play', 'to play'], j: 2, why: { en: 'Modal + base verb.', id: 'Modal + V1.' } },
      { s: '___ I borrow your pencil?', p: ['Must', 'Can', 'Should', 'Do'], j: 1, why: { en: 'Asking permission → Can.', id: 'Meminta izin → Can.' } }
    ]
  },
  {
    id: 'passive', kat: 'kalimat', level: 'Lanjut', ikon: 'tukar', no: 12,
    judul: { en: 'Passive Voice', id: 'Kalimat Pasif' },
    ringkas: { en: 'When the action matters more than who did it.', id: 'Saat tindakannya lebih penting dari pelakunya.' },
    penjelasan: {
      en: 'In the passive voice, the object becomes the subject. Use to be in the right tense plus the past participle (V3). Add "by" only if the doer is important.',
      id: 'Dalam kalimat pasif, objek berpindah menjadi subjek. Gunakan to be sesuai tense ditambah V3. Tambahkan "by" hanya jika pelakunya penting.'
    },
    rumus: [
      ['Present', 'pasif', 'S + *am/is/are* + *V3*'],
      ['Past', 'pasif', 'S + *was/were* + *V3*'],
      ['Future', 'pasif', 'S + *will be* + *V3*']
    ],
    guna: [
      { en: 'Unknown doer: My bike *was stolen*.', id: 'Pelaku tidak diketahui: My bike *was stolen* (Sepedaku dicuri).' },
      { en: 'Facts & processes: Rice *is grown* in Java.', id: 'Fakta & proses: Rice *is grown* in Java (Padi ditanam di Jawa).' },
      { en: 'Important doer with by: The song *was written by* Rina.', id: 'Pelaku penting pakai by: The song *was written by* Rina.' }
    ],
    sinyal: ['by ...', 'di- (dalam bahasa Indonesia)', 'to be + V3'],
    contoh: [
      ['English *is spoken* all over the world.', 'Bahasa Inggris digunakan di seluruh dunia.', 'is + V3'],
      ['The window *was broken* yesterday.', 'Jendela itu dipecahkan kemarin.', 'was + V3'],
      ['The results *will be announced* tomorrow.', 'Hasilnya akan diumumkan besok.', 'will be + V3'],
      ['These cakes *were made by* my mom.', 'Kue-kue ini dibuat oleh ibuku.', 'by']
    ],
    salah: [
      ['The letter was write.', 'The letter was written.', { en: 'Passive needs V3.', id: 'Pasif wajib memakai V3.' }],
      ['The house built in 1990.', 'The house was built in 1990.', { en: 'Don\'t forget to be.', id: 'Jangan lupa to be (was).' }]
    ],
    kuiz: [
      { s: 'The cake ___ by my sister.', p: ['made', 'was made', 'was make', 'is making'], j: 1, why: { en: 'Past passive: was + V3.', id: 'Pasif lampau: was + V3.' } },
      { s: 'Coffee ___ in Aceh.', p: ['grows', 'is grown', 'is grow', 'grown'], j: 1, why: { en: 'A fact → is + V3.', id: 'Fakta → is + V3.' } },
      { s: 'The new school ___ next year.', p: ['will build', 'will be built', 'is build', 'built'], j: 1, why: { en: 'Future passive: will be + V3.', id: 'Pasif masa depan: will be + V3.' } },
      { s: 'Active: "Tono cleans the room." Passive: The room ___ by Tono.', p: ['is cleaned', 'cleaned', 'was clean', 'is clean'], j: 0, why: { en: 'Present → is + V3.', id: 'Present → is + V3.' } },
      { s: 'These photos ___ in Bali last year.', p: ['was taken', 'were taken', 'are taken', 'took'], j: 1, why: { en: 'Plural + past → were + V3.', id: 'Jamak + lampau → were + V3.' } }
    ]
  }
];

/* kamus mini verb tidak beraturan untuk layar "Kamus" */
const IRREGULAR = [
  ['be', 'was/were', 'been', 'adalah'], ['begin', 'began', 'begun', 'mulai'], ['break', 'broke', 'broken', 'memecahkan'],
  ['bring', 'brought', 'brought', 'membawa'], ['buy', 'bought', 'bought', 'membeli'], ['come', 'came', 'come', 'datang'],
  ['do', 'did', 'done', 'melakukan'], ['drink', 'drank', 'drunk', 'minum'], ['eat', 'ate', 'eaten', 'makan'],
  ['find', 'found', 'found', 'menemukan'], ['get', 'got', 'got/gotten', 'mendapat'], ['give', 'gave', 'given', 'memberi'],
  ['go', 'went', 'gone', 'pergi'], ['have', 'had', 'had', 'punya'], ['know', 'knew', 'known', 'tahu'],
  ['make', 'made', 'made', 'membuat'], ['read', 'read', 'read', 'membaca'], ['run', 'ran', 'run', 'berlari'],
  ['say', 'said', 'said', 'berkata'], ['see', 'saw', 'seen', 'melihat'], ['speak', 'spoke', 'spoken', 'berbicara'],
  ['swim', 'swam', 'swum', 'berenang'], ['take', 'took', 'taken', 'mengambil'], ['teach', 'taught', 'taught', 'mengajar'],
  ['write', 'wrote', 'written', 'menulis']
];

/* teks antarmuka: [Indonesia, English] */
const UI = {
  tagline: ['Grammar jadi gampang', 'Grammar made easy'],
  masuk: ['Masuk', 'Log in'], daftar: ['Daftar', 'Sign up'], lewati: ['Lewati', 'Skip'],
  halo: ['Halo lagi!', 'We Say Hello!'],
  haloSub: ['Selamat datang kembali. Masukkan nama dan kata sandi untuk masuk.', 'Welcome back. Use your name and password to log in.'],
  daftarSub: ['Buat akun gratis untuk menyimpan progres belajarmu.', 'Create a free account to save your learning progress.'],
  lupa: ['Lupa kata sandi?', 'Forgot password?'], atau: ['Atau masuk dengan', 'Or log in with'],
  belumAkun: ['Belum punya akun?', 'Don\'t have an account?'], sudahAkun: ['Sudah punya akun?', 'Already have an account?'],
  cari: ['Cari topik grammar…', 'Search grammar topics…'],
  bannerJ: ['Semua Grammar, Satu Tempat', 'All Grammar, One Place'],
  bannerS: ['12 topik dari tenses sampai kalimat pasif, lengkap dengan rumus, contoh, dan latihan.', '12 topics from tenses to passive voice, with formulas, examples and practice.'],
  pelajari: ['Pelajari', 'Learn More'],
  lanjutkan: ['Lanjutkan Belajar', 'Continue Learning'], terakhir: ['TERAKHIR DIBUKA', 'LAST OPENED'],
  topik: ['Topik', 'Topics'], semua: ['Semua', 'All'], selesai: ['Selesai', 'Completed'], belum: ['Belum', 'To do'],
  lihatSemua: ['Lihat Semua', 'View All'],
  materi: ['Materi', 'Lesson'], contoh: ['Contoh', 'Examples'], latihan: ['Latihan', 'Practice'],
  penjelasan: ['Penjelasan', 'Explanation'], rumus: ['Rumus', 'Formula'], kegunaan: ['Kapan dipakai', 'When to use'],
  kataKunci: ['Kata kunci', 'Signal words'], kesalahan: ['Kesalahan umum', 'Common mistakes'],
  mulaiLatihan: ['Mulai Latihan', 'Start Practice'], soal: ['Soal', 'Questions'], level: ['Level', 'Level'],
  cek: ['Cek jawaban', 'Check answer'], lanjut: ['Lanjut', 'Continue'], benar: ['Benar!', 'Correct!'], salah: ['Belum tepat', 'Not quite'],
  selesaiJ: ['KAMU MAKIN JAGO', 'IT ALL ADDS UP'], oke: ['Selesai', 'Done'],
  beranda: ['Beranda', 'Home'], progres: ['Progres', 'Progress'], profil: ['Profil', 'Profile'], kamus: ['Kamus', 'Dictionary'],
  poin: ['Total poin XP', 'Total XP points'], notifikasi: ['Notifikasi', 'Notifications'], hariIni: ['Hari ini', 'Today'],
  tentang: ['Tentang', 'About'], lencana: ['Lencana', 'Badges'], riwayat: ['Riwayat', 'History'], editAkun: ['Edit Akun', 'Edit Account'],
  bahasa: ['Bahasa', 'Language'], simpan: ['Simpan', 'Save'], keluar: ['Keluar', 'Log out']
};
