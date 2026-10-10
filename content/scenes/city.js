/* Veil Protocol content :: the city between chapters.
   Hub, phone, people, work, the pact, the Director, and the endings.
   Hand-written. Loads after chapter1.js and campaign.js. */
(function(){
var VP = window.VP, IMG = '../images/';
function img(f){ return IMG + f; }

/* ------------------------------------------------------------------ people
   start  = where the bond begins (-100 enemy ... 100)
   phone  = when they appear in your phone
   romance.T = the bond needed before anything can start (from Betty's unlock table) */
var GRID_WORK = ['grid_courier','grid_fixer','grid_keeper','grid_supplier'];
var CVD_WORK = ['cvd_field','cvd_suppress','cvd_assess','cvd_cattery','cvd_sigil','cvd_archive'];

VP.people = {
  gin:      {name:'Gin', role:'Your brother. Twenty-eight. CVD field investigator.', img:'char_uedera-gin.png', start:100, tier:'Brother', status:'back late. don’t wait up.', phone:{req:{}}},
  itsuki:   {name:'Kuroda Itsuki', role:'Twenty. Oil painting student at Geidai. A Kuroda. Your best friend since school.', img:'char_kuroda-itsuki.png', start:45, status:'painting oji again. comes out wrong every time. don’t text before noon.', phone:{req:{}}, romance:{T:40}},
  daiki:    {name:'Sasaki Daiki', role:'Seventeen. Your closest friend from school. He knows nothing about any of this.', img:'char_sasaki-daiki.png', start:50, status:'gin’s bro is basically my bro', phone:{req:{}}},
  komatsu:  {name:'Komatsu Shigeru', role:'Seventy-four. The tobacco kiosk on your corner. He has watched you since you were small.', img:'char_komatsu-shigeru.png', start:30, status:'the young ones never listen.', phone:{req:{}}},
  iwata:    {name:'Iwata Kenji', role:'Fifty-eight. Handyman for your building. He has the spare key.', img:'char_iwata-kenji.png', start:20, status:'mind your business and i’ll mind mine.', phone:{req:{}}},
  okada:    {name:'Okada Shizuka', role:'Thirty-two. CVD. Gin asked her to watch for you.', img:'char_okada-shizuka.png', start:16, phone:{req:{any:[{path:'cvd'},{flag:'ch1_done'}]}}, romance:{T:65}},
  aoi:      {name:'Nakamura Aoi', role:'Twenty. CVD trainee, second year. Gin spoke about you to her.', img:'char_nakamura-aoi.png', start:15, status:'karaoke saturday?? someone say yes (´｡• ᵕ •｡`)', phone:{req:{flag:'hasBook'}}, romance:{T:40}},
  kato:     {name:'Kato Ryusei', role:'Twenty-one. CVD trainee and telepath. Email only. Answers fast.', img:'char_kato-ryusei.png', start:0, status:'busy. probably.', phone:{req:{flag:'hasBook'}}, romance:{T:60}},
  hana:     {name:'Choi Hana', role:'Nineteen. Unregistered. She reads grief where it pools.', img:'char_choi-hana.png', start:-20, status:'don’t.', phone:{req:{flag:'hasBook'}}, romance:{T:30}},
  noa:      {name:'Katagiri Noa', role:'Thirty-eight. Senior CVD investigator. Lives above an old vet clinic with too many cats.', img:'char_katagiri-noa.png', start:15, status:'above the clinic. the cats are in charge.', phone:{req:{flag:'hasBook'}}, romance:{T:40}},
  haruki:   {name:'Tsukishiro Haruki', role:'Thirty-one. Investigator from a far branch of the Tsukishiro. Makes very good coffee.', img:'char_tsukishiro-haruki.png', start:0, status:'good coffee, bad memory. come by.', phone:{req:{flag:'hasBook'}}, romance:{T:45}},
  shimizu:  {name:'Shimizu Ren', role:'Twenty-nine. CVD suppression unit. Gin’s partner in the field.', img:'char_shimizu-ren.png', start:15, status:'if it can wait, let it.', phone:{req:{flag:'hasBook'}}, romance:{T:40}},
  tanizaki: {name:'Tanizaki Seiichi', role:'Sixty-one. Grid. Gin’s teacher, and his oldest contact.', img:'char_tanizaki-seiichi.png', start:20, status:'tea’s on. third cup, then we talk.', phone:{req:{flag:'hasBook'}}},
  tendo:    {name:'Tendo Akira', role:'Twenty-eight. CVD Special Cases. Loud about being good at his job, and right about it.', img:'char_tendo-akira.png', start:15, status:'ask me about Nerima sometime. you won’t believe it.', phone:{req:{any:[{career:CVD_WORK},{done:'m_briefing'}]}}, romance:{T:45}},
  moriya:   {name:'Moriya Tatsuki', role:'Thirty-five. CVD Internal Affairs. Two kids. He notes everything.', img:'char_moriya-tatsuki.png', start:0, phone:{req:{done:'m_form'}}, romance:{T:40}},
  kurosawa: {name:'Kurosawa Shou', role:'Thirty-four. Vanguard. He reads bodies. No number. He finds you.', img:'char_kurosawa-shou.png', start:0, status:'No number. He finds you when he finds you.', phone:{req:{done:'m_kurosawa'}}, romance:{T:40}},
  mizuki:   {name:'Hagiwara Mizuki', role:'Fifty-one. Director of the Office of Public Confidence.', img:'char_hagiwara-mizuki.png', start:5, status:'everything is under control :)', phone:{req:{any:[{done:'m_ledger'},{flag:'mizuki_offered'}]}}, romance:{T:40}},
  usami:    {name:'Usami Hinata / Ren', role:'Twenty-four. Vessel Program. A man and a love-register demon who traded minds.', img:'char_usami-hinata-ren.png', start:20, status:'please be gentle today.', phone:{req:{done:'m_trap'}}, romance:{T:60}},
  sei:      {name:'Kuroda Sei', role:'Twenty-two. Itsuki’s older brother. A Kuroda teleportist.', img:'char_kuroda-sei.png', start:-10, phone:{req:{any:[{path:'buddy'},{rel:{itsuki:60}}]}}},
  kaneda:   {name:'Kaneda Tōru', role:'Thirty-five. Bartender. He looks after everyone who sits at his counter.', img:'char_kaneda-t-ru.png', start:0, status:'first one’s on the house.', phone:{req:{any:[{path:'look'},{done:'m_lastweek'}]}}},
  hara:     {name:'Hara Setsu', role:'Seventy-one. Keeps the Tsuru-no-yu bath. She told Gin twice to bring you more often.', img:'char_hara-setsu.png', start:20, status:'favors aren’t free.', phone:{req:{done:'m_archive'}}},
  'switch': {name:'Switch', role:'Grid quartermaster. Runs the Gathering. Never the same place twice.', img:'char_switch.png', start:0, phone:{req:{any:[{path:'grid'},{done:'m_briefing'}]}}},
  majima:   {name:'Majima Kenji', role:'Forty-one. Grid fixer. Vanguard. A dog works beside him.', img:'char_majima-kenji.png', start:0, status:'still here. surprising everyone, me included.', phone:{req:{any:[{career:GRID_WORK},{done:'m_ledger'}]}}},
  yua:      {name:'Yua', role:'Sixteen. A Toyoko kid in Kabukichō. She watches out for you.', img:'npc_yua.png', start:25, status:'not a kid. don’t.', phone:{req:{done:'m_archive'}}},
  mori:     {name:'Mori Haruto', role:'Seventeen. Runs with a school gang. Raises his little sister.', img:'char_mori-haruto.png', start:15, status:'we run this block.', phone:{req:{done:'m_archive'}}}
};

VP.careers = {
  cvd_field:{name:'CVD Field Investigator'}, cvd_suppress:{name:'CVD Suppression Unit'}, cvd_assess:{name:'CVD Assessor'},
  cvd_cattery:{name:'CVD Cat Handler'}, cvd_sigil:{name:'CVD Sealwright'}, cvd_archive:{name:'CVD Archive Clerk'},
  grid_courier:{name:'Grid Courier'}, grid_fixer:{name:'Grid Fixer'}, grid_keeper:{name:'Grid Safe-House Keeper'}, grid_supplier:{name:'Grid Supplier'},
  tower_kuroda:{name:'Ward of the Kuroda House'}, tower_tsukishiro:{name:'Tsukishiro Liaison'},
  power_reach:{name:'The Forbidden Reach'}, street_walk:{name:'The Night Walker'}
};

/* ------------------------------------------------------------------ contact scene builder */
function contact(id, o){
  var p = VP.people[id];
  var meetFx = {rel:{}, once:'meet_'+id}; meetFx.rel[id] = o.meetRel || 7;
  if(o.meetFx) Object.keys(o.meetFx).forEach(function(k){ meetFx[k]=o.meetFx[k]; });
  var ginFx = {ever:'gin_'+id, xp:5, rel:{}}; ginFx.rel[id] = 2;
  if(o.ginFlag) ginFx.flag = o.ginFlag;
  var c0 = [];
  c0.push({x:o.meetX || 'Meet up.', hint:o.meetHint, n:1, av:o.meetAv, req:Object.assign({once:'meet_'+id, onceWhy:'You saw them this chapter. Give it a little time.'}, o.meetReq||{}), fx:meetFx});
  if(o.gin) c0.push({x:o.ginX || 'Ask about Gin.', hint:o.ginHint, n:2, req:Object.assign({ever:'gin_'+id}, o.ginReq||{}), hide:!!o.ginHide, fx:ginFx});
  if(VP.romances && VP.romances[id]) c0.push({romance:id});
  (o.extra||[]).forEach(function(e){ c0.push(e); });
  c0.push({x:o.leaveX || 'Hang up.', scene:'phone', n:0});
  var back = [{x:'Go home.', scene:'city', n:0}, {x:'Open your phone again.', scene:'phone', n:0}];
  VP.scenes['call_'+id] = [
    {img:o.where, imgSrc:img(o.callImg || p.img), t:o.call, c:c0},
    {img:o.meetWhere, imgSrc:img(o.meetImg || p.img), t:o.meet, c:back},
    {img:o.ginWhere || o.where, imgSrc:img(o.ginImg || p.img), t:o.gin || [], c:back}
  ];
}

/* ------------------------------------------------------------------ the hub */
VP.scenes.city = [
  { img:'The flat in Kita-ku, between one night and the next', imgSrc:img('res_apartment.png'), dyn:'hub',
    t:[
      {req:{chMax:0}, p:'You come home with the cold key in your pocket and his book in your bag. The flat is the same flat. Two rooms and a kitchen. His shoes are not in the genkan.'},
      {req:{chMax:0}, p:'You are not going to sleep. You know that already. So you put the kettle on and you think about who to call, and in what order, and what you are allowed to say.'},
      {req:{chMin:1}, p:'Home. The kettle. The second cup on the rack that you do not take down.'},
      {req:{chMin:1, partnerAny:true}, p:'There is a message from {partner} on your phone. It only says that they are thinking of you. You read it twice.'},
      {req:{chMin:1, madMin:50}, p:'The walls are thin tonight. Not the plaster. The other kind. You can hear the city on the other side of them.'},
      {req:{chMin:1, stabBelow:40}, p:'Your hands will not stay still. You notice you have checked the lock three times.'},
      'The story waits for you. So do the people in your phone. So does the city.'
    ],
    c:[
      {x:'Your phone', hint:'Call someone. Meet someone. Some of them were Gin’s people first.', scene:'phone', n:0},
      {x:'Out in the city', hint:'Places, people who need something, and things that will not wait.', scene:'city', n:1},
      {x:'Go to work. CVD Field Operations.', req:{career:'cvd_field'}, hide:true, scene:'shift_cvd_field', n:0},
      {x:'Go to work. The suppression unit.', req:{career:'cvd_suppress'}, hide:true, scene:'shift_cvd_suppress', n:0},
      {x:'Go to work. Assessment and Registry.', req:{career:'cvd_assess'}, hide:true, scene:'shift_cvd_assess', n:0},
      {x:'Go to work. The Cattery.', req:{career:'cvd_cattery'}, hide:true, scene:'shift_cvd_cattery', n:0},
      {x:'Go to work. The Sigil Room.', req:{career:'cvd_sigil'}, hide:true, scene:'shift_cvd_sigil', n:0},
      {x:'Go to work. The Records Archive.', req:{career:'cvd_archive'}, hide:true, scene:'shift_cvd_archive', n:0},
      {x:'Grid work. A drop to carry.', req:{career:'grid_courier'}, hide:true, scene:'shift_grid_courier', n:0},
      {x:'Grid work. A favour to broker.', req:{career:'grid_fixer'}, hide:true, scene:'shift_grid_fixer', n:0},
      {x:'Grid work. The safe house.', req:{career:'grid_keeper'}, hide:true, scene:'shift_grid_keeper', n:0},
      {x:'Grid work. Supplies to move.', req:{career:'grid_supplier'}, hide:true, scene:'shift_grid_supplier', n:0},
      {x:'Nezu. Training with the Kuroda.', req:{career:'tower_kuroda'}, hide:true, scene:'shift_tower_kuroda', n:0},
      {x:'Bunkyō. The Tsukishiro liaison seat.', req:{career:'tower_tsukishiro'}, hide:true, scene:'shift_tower_tsukishiro', n:0},
      {x:'Practise the reach. Alone.', req:{career:'power_reach'}, hide:true, scene:'shift_power_reach', n:0},
      {x:'Walk the night.', req:{career:'street_walk'}, hide:true, scene:'shift_street_walk', n:0},
      {x:'Find work', hint:'The CVD, the Grid, the Tower houses, or none of them.', req:{nocareer:true}, hide:true, scene:'city', n:3},
      {x:'Gin’s number lights up. 3:47 in the morning.', hint:'You know it is not only him.', kind:'story', req:{done:'m_word', noflag:'pact_offered'}, hide:true, scene:'pact', n:0},
      {x:'An errand for the Healer.', hint:'Your agreement. It hunts Kishin. You help.', req:{flag:'pact_yushiro', once:'errand'}, hide:true, scene:'pact', n:1},
      {x:'Break the agreement.', hint:'It will not like it. Neither will what is left of your brother.', req:{flag:'pact_yushiro'}, hide:true, scene:'pact', n:2},
      {x:'A car is waiting outside. The Director would like a word.', kind:'story', req:{done:'m_thinning', noflag:'mizuki_offered', any:[{career:CVD_WORK},{rel:{mizuki:20}},{flag:'known_to_cvd'}]}, hide:true, scene:'mizuki_offer', n:0},
      {x:'Okada says Director Adachi will see you.', hint:'The door to the President.', kind:'story', req:{done:'m_battery', rel:{okada:45}, noflag:'president_door'}, hide:true, scene:'adachi', n:0},
      {x:'Rest.', hint:'Sleep, or something like it. It helps more than you think.', req:{once:'rest', onceWhy:'You rested already. The night will not give you more.'}, scene:'city', n:2, fx:{once:'rest', stab:12, mad:-4}},
      {x:'Change your work.', req:{career:Object.keys(VP.careers)}, hide:true, scene:'city', n:3}
    ]
  },
  { img:'Out in the city', imgSrc:img('map_tokyo.png'),
    t:['Gin’s map of the ward is in the back of his book. Thin spots ringed in red. You know half the streets by heart. Tonight you see the other half.'],
    c:[
      {x:'The animal-medium shop in a Kita backstreet.', hint:'The Broker’s Vacant Mediums. Trained animals waiting for steady hands.', av:'res_animals.png', req:{done:'m_door', notdone:'s_broker'}, hide:true, scene:'s_broker', n:0},
      {x:'The Hozumi fox-shrine in upper Kita.', hint:'The Shrine That Stopped Answering. The basin water stopped reflecting the lanterns.', av:'place_shinto.png', req:{done:'m_lastweek', notdone:'s_shrine'}, hide:true, scene:'s_shrine', n:0},
      {x:'The bookseller in Jūjō.', hint:'The Bookseller’s Locked Shelf. One of the books remembers Gin.', av:'res_bookshop.png', req:{done:'m_after14', notdone:'s_bookseller'}, hide:true, scene:'s_bookseller', n:0},
      {x:'A back room in Shinjuku. Kuroki Tatsuo.', hint:'Kuroki’s Favour. The finding is free. The owing is not.', av:'npc_kuroki.png', req:{done:'m_lucid', notdone:'s_kuroki'}, hide:true, scene:'s_kuroki', n:0},
      {x:'The library. A man in a cardigan two sizes too big.', hint:'The Weakening Holder. The Despair seat is failing.', av:'thirteen_VI_watanabe_jun.png', req:{done:'m_inverted', notdone:'s_weakening'}, hide:true, scene:'s_weakening', n:0},
      {x:'Forty metres from the wound.', hint:'The Rage That Won’t Cool.', av:'thirteen_II_mori_takao.png', req:{done:'m_thinning', notdone:'s_rage'}, hide:true, scene:'s_rage', n:0},
      {x:'A stairwell in a Kita danchi.', hint:'The Fear on the Stairwell. The fear in the concrete is not yours.', av:'thirteen_IV_nakashima_yuna.png', req:{done:'m_thinning', notdone:'s_fear'}, hide:true, scene:'s_fear', n:0},
      {x:'A holder with no address.', hint:'The Hunger With No Address.', av:'thirteen_IX_inoue_satoru.png', req:{done:'m_axis', notdone:'s_hunger'}, hide:true, scene:'s_hunger', n:0},
      {x:'A shrine room behind a Korean restaurant in Shin-Ōkubo.', hint:'The Longing at Shin-Ōkubo.', av:'thirteen_XI_park_junho.png', req:{done:'m_axis', notdone:'s_longing'}, hide:true, scene:'s_longing', n:0},
      {x:'Tsuru-no-yu. A long bath.', hint:'Gin’s one unarmed place. Mrs. Hara keeps it.', av:'place_sento.png', req:{done:'m_archive', once:'bath', onceWhy:'Closed for you tonight. Come back next chapter.'}, scene:'city', n:4, fx:{once:'bath', stab:10, rel:{hara:4}}},
      {x:'The Ōji overpass.', hint:'Where he was last ordinary.', av:'place_underpass.png', req:{once:'overpass', onceWhy:'You stood there already this chapter.'}, scene:'city', n:5, fx:{once:'overpass'}},
      {x:'Go home.', scene:'city', n:0}
    ]
  },
  { img:'Rest', imgSrc:img('res_apartmentreiroom.png'),
    t:['You lie down on the couch with your shoes on. You always do.', 'You sleep. Not long. Long enough. When you wake up the city is still there, and so are you.'],
    c:[{x:'Get up.', scene:'city', n:0}]
  },
  { img:'Finding work', imgSrc:img('cvdroom_the_dispatch_center.png'),
    t:['You are a nineteen-year-old intern who files paper. That is what the CVD sees. It is a good cover. It is also not enough any more.',
       'Work gives you a place, people, a reason to be in rooms. Each kind of work opens some doors and shuts others. You can change your mind later. It will cost you a little with the people you leave.'],
    c:[
      {x:'The CVD. Take a real track inside the Directorate.', hint:'Okada at Assessment and Registry can put you on one.', av:'cvdroom_assessment_registry.png', req:{any:[{path:'cvd'},{flag:'known_to_cvd'},{rel:{okada:30}}], anyWhy:'Walk the CVD road, or get closer to Okada (30)'}, scene:'join_cvd', n:0},
      {x:'The Grid. Ask Tanizaki to vouch for you.', hint:'No ranks. No files. Somebody vouches, and gives you one thing.', av:'place_gridroom.png', req:{any:[{path:'grid'},{flag:'grid_trust'},{rel:{tanizaki:35}}], anyWhy:'Walk the Grid road, or get closer to Tanizaki (35)'}, scene:'join_grid', n:0},
      {x:'The Tower houses.', hint:'The Kuroda through Itsuki, or the Tsukishiro through Haruki.', av:'tower_families.png', req:{any:[{path:'buddy'},{rel:{itsuki:55}},{rel:{haruki:35}}], anyWhy:'Walk Itsuki’s road, or get closer to Itsuki (55) or Haruki (35)'}, scene:'join_tower', n:0},
      {x:'No one. The reach, alone.', hint:'Train the thing your family taught you to bury. Every path you open makes you brighter in a darker room.', av:'prac_clairsent.png', req:{any:[{path:'power'},{mad:20},{clair:4}], anyWhy:'Walk the Reach road, or let the Madness reach 20'}, scene:'join_reach', n:0},
      {x:'No one. The streets, at night.', hint:'The long way. Bars, baths, kiosks, the people who are awake when no one else is.', av:'place_nightcircuit.png', scene:'join_walk', n:0},
      {x:'Leave the work you have.', req:{career:Object.keys(VP.careers)}, hide:true, scene:'city', n:0, fx:{career:'none', stab:-3, journal:'I walked away from the work. Some people will remember that I did.'}},
      {x:'Not now.', scene:'city', n:0}
    ]
  },
  { img:'Tsuru-no-yu, the far tub', imgSrc:img('place_sento.png'),
    t:['Mrs. Hara takes your coins and looks at you the way she looks at weather. “Long bath,” she says. It is not a suggestion.',
       'The far tub is warmer than the others. Nobody sits in it but you. You do not ask why. Gin never did either.',
       'For twenty minutes nothing is looking for you. You did not know how tired you were.'],
    c:[{x:'Go home.', scene:'city', n:0}]
  },
  { img:'The Ōji overpass', imgSrc:img('place_underpass.png'),
    t:['Traffic underneath. Wind on top. The cold patch is gone now, or it moved, or you stopped being able to feel it.',
       'You stand where he stood. You do this sometimes. It does not help. You do it anyway.',
       {req:{ginMin:3}, p:'Tonight, for one second, you are sure he is standing next to you. Then he is not.'}],
    c:[{x:'Go home.', scene:'city', n:0}]
  }
];

VP.scenes.phone = [
  { img:'Your phone', imgSrc:img('agenda_board.png'), dyn:'phone',
    t:['Your contacts. Some are yours. Most came out of the back of Gin’s book.', {req:{noflag:'hasBook'}, p:'You did not take his book. The list is short.'}],
    c:[{x:'Put it away.', scene:'city', n:0}]
  }
];

/* ------------------------------------------------------------------ contacts */
contact('gin', {
  where:'His number', callImg:'char_uedera-gin.png',
  call:[
    {req:{notdone:'m_lucid'}, p:'It rings out. Then his voicemail. His real voice, recorded two years ago, a little impatient. “Leave it short.”'},
    {req:{notdone:'m_lucid'}, p:'You do not leave it short. You do not leave anything. You hang up and you sit very still.'},
    {req:{done:'m_lucid'}, p:'A text comes back before you finish typing. It is his name on the screen. The words are calm. A beat too calm.'},
    {req:{done:'m_lucid'}, p:'<em>let it go, rei. go home. this is not for you.</em>'},
    {req:{done:'m_lucid'}, p:'He never called you by name in a text. Not once in your life.'}
  ],
  meetX:'Write back in your old code. Three taps.', meetHint:'Your childhood shorthand. The thing wearing him would have to fake it.', meetReq:{done:'m_lucid'},
  meetRel:0, meetFx:{gin:1, mad:3},
  meetWhere:'The answer', meetImg:'ext_sojo.png',
  meet:['You send it. Three taps. The old code from when you were small and he was teaching you not to be seen.',
        'For a long minute nothing comes back. Then two taps. Only two.',
        'It is not the full answer. It is him. Some part of him heard you. You keep the phone against your chest until the screen goes dark.'],
  leaveX:'Put the phone down.'
});

contact('itsuki', {
  where:'Itsuki, on the third ring', callImg:'char_kuroda-itsuki.png',
  call:['He picks up on the third ring. That means he was painting.',
        '“rei. you okay. stupid question. you’re not okay.” He texts in lowercase and somehow he talks that way too.',
        {req:{relMin:{itsuki:60}}, p:'He goes quiet for a second. “it’s fine,” he says. Then, “it’s not fine. come over.”'}],
  meetX:'Walk to the arcade with him.', meetHint:'Show up for the boy, never for the Kuroda.',
  meetWhere:'The arcade, late', meetImg:'place_arcade.png',
  meet:['You meet him under the shutters. He has paint on his sleeve and a bleached streak he keeps meaning to redo.',
        'You lose four games in a row to him. He gloats. You let him. For an hour neither of you says your brother’s name.',
        'On the way out he bumps your shoulder with his. It means what it always means. I am still here.'],
  gin:['“I search for him every night,” he says. He says it fast, like a confession. “I built the search for Gin’s archive, remember. I still have the logs.”',
       '“His last tap was the Ōji overpass. One fourteen in the morning.” He looks at his hands. “I didn’t tell anyone. I didn’t want it to be real.”'],
  ginWhere:'What Itsuki has been keeping', ginImg:'char_kuroda-itsuki.png'
});

contact('daiki', {
  where:'Daiki', callImg:'char_sasaki-daiki.png',
  call:['“REI.” Daiki always answers like you have been missing for a year.',
        'He tells you a joke. It is terrible. You laugh anyway, and it surprises you. When Daiki laughs you remember you are still nineteen.'],
  meetX:'Saturday. The riverside. Nowhere in particular.', meetHint:'Your normal life. Keep answering this number.',
  meetWhere:'The riverside, with Daiki', meetImg:'place_schoolyard.png', meetFx:{stab:8},
  meet:['You walk the river with him and buy too much from a vending machine. He talks about a game and his little brother and nothing at all.',
        'He does not ask where you were last night. He notices the lie you were ready to tell. He keeps walking next to you anyway.'],
  gin:['“How’s Gin? Tell him I want his cooking again.” Daiki thinks Gin is the coolest man alive.',
       'You tell him Gin is working late. Daiki looks at you a second too long. Then he says, “Okay.” He does not believe you. He lets you have it.',
       'If something happened to Daiki it would break your whole world. You decide, right there, that he will never know any of this.'],
  ginX:'He asks about Gin.', ginImg:'char_sasaki-daiki.png'
});

contact('komatsu', {
  where:'The kiosk on your corner', callImg:'place_tobacco.png',
  call:['You do not call Komatsu. You go downstairs. He is in his window, as always, and he slides a sweet across the counter like you are eight.',
        '“The young ones never listen,” he says, to no one, about everyone.'],
  meetX:'Stay and talk a while.', meetWhere:'The kiosk, afternoon', meetImg:'place_tobacco.png', meetFx:{stab:5},
  meet:['He tells you who moved out, who is sick, which cat is new on the block. Block news. You let it wash over you.',
        'It is the most normal half hour you have had in days.'],
  gin:['He frowns. “Your brother came by every morning. Then he stopped.”',
       '“That boy looked tired in a way sleep won’t fix.” He says it gently. He has been carrying it. Now you are.'],
  ginImg:'char_komatsu-shigeru.png'
});

contact('iwata', {
  where:'The super’s door, ground floor', callImg:'char_iwata-kenji.png',
  call:['Iwata opens the door with a beer in his hand and the ball game on behind him. “Mind your business and I’ll mind mine,” he says. Then he waits, because you have not left.'],
  meetX:'Help him with a repair.', meetWhere:'The building, a leaking pipe', meetImg:'res_tools.png', meetFx:{stab:3},
  meet:['You hold the torch while he swears at a pipe. He is gruff. He is decent. He says thank you the way some men apologise, too fast and looking away.'],
  gin:['He goes a little grey. “Your flat gives me the creeps,” he says. “I’m sorry. It does.”',
       '“Things move between my visits. Keys. I put them down. They are somewhere else.” He drinks. “I stopped going in.”'],
  ginImg:'res_apartmentempty.png'
});

contact('okada', {
  where:'Okada Shizuka', callImg:'char_okada-shizuka.png',
  call:['She answers on the first ring and says her surname, like a door closing. Then she hears it is you.',
        '“Rei.” Terse. Gruff. Something underneath that she would never say out loud.'],
  meetX:'Saturday. The shrine, then the bakery.', meetHint:'Her one quiet morning.',
  meetWhere:'Ōji Inari, early', meetImg:'place_shinto.png',
  meet:['She is at the shrine at seven. Three notebooks in her bag, even here. She does not pray long.',
        'At the bakery she buys two of everything and gives you one of each without asking. She has a cat she swears is ordinary. You do not believe her. She knows you do not.'],
  gin:['She looks at the window for a long time.',
       '“Four years ago your brother asked me to watch for you,” she says. “Not to watch you. For you. I did not understand the difference then.”',
       {req:{relMin:{okada:60}}, p:'“He told me something once. I never filed it. I am not telling you yet.”'}],
  extra:[{x:'Ask about the anomaly in your assessment.', hint:'The Auditor’s Anomaly. The cycle flagged something that points at you.', req:{done:'m_form', notdone:'s_auditor'}, hide:true, scene:'s_auditor', n:0}]
});

contact('aoi', {
  where:'Nakamura Aoi', callImg:'char_nakamura-aoi.png',
  call:['“You’re Gin’s brother!” She says it like she already knows you. In a way she does. Gin talked about you.',
        'She makes a joke. You will learn later that the worse the joke, the more scared she is. This one is very bad.'],
  meetX:'Beck’s Stand, Platform 3, before the last train.', meetWhere:'Beck’s Stand, Platform 3', meetImg:'place_stationcafe.png',
  meet:['She is there with two coffees. One is for you. The man behind the counter never remembers anyone. She says that is the point.',
        'She asks how you are and then she waits for the answer. You find you give her a real one.',
        'She turns a bracelet on her wrist while she listens. Old beads. You do not touch it. You do not ask. She notices that you did not.'],
  gin:['“He talked about you all the time,” she says. “So I liked you before I met you. Sorry. That’s weird.”',
       'Then, quieter. “I always asked him how he was. He always actually answered. The last weeks he just said fine. Only fine.”']
});

contact('kato', {
  where:'An email, answered in four minutes', callImg:'char_kato-ryusei.png',
  call:['Kato does not do calls. You email. He answers in four minutes.',
        '<em>Gin mentioned you. Specifically. Come to the armory window if you want to talk. I will be the one not smiling.</em>'],
  meetX:'The armory window. A chess problem and one beer, after.', meetWhere:'The CVD armory, sub-level', meetImg:'cvdroom_the_armory.png',
  meet:['He counts your sigils back across the counter without looking at them. Then he looks at you. Really looks. A telepath, trying to read you.',
        'He frowns. Your suppression makes you hard to read. You can see it interests him more than he wants it to.',
        'After his shift he shows you a chess problem. You get it wrong. He explains why, a little condescending. He does not notice. You do.'],
  gin:['“Your brother was hard to read too,” he says. “The last month, harder. Like someone had put a second wall behind the first.”',
       'He turns a chess piece in his fingers. “I did not say anything. I should have.”']
});

contact('hana', {
  where:'Choi Hana', callImg:'char_choi-hana.png',
  call:['Her status says <em>don’t.</em> You call anyway.',
        'She picks up and says nothing. Then, “Gin’s brother.” Flat. “A registered intern. With my number. That is a problem.”'],
  meetX:'Find her where the grief pools.', meetHint:'Survive her contempt. Do not hit back.',
  meetWhere:'Shin-Ōkubo, after dark', meetImg:'place_mudang.png',
  meet:['She walks fast and does not wait for you. Every street she takes is a test. You keep up. You do not complain.',
        'She stops outside a building and reads it with her whole body. Grief, pooled on the third floor. She tells you which flat. She does not tell you how she knows.',
        'When you leave she says, “You didn’t flinch.” It is almost a compliment. She leaves before you can answer.'],
  gin:['“Gin never came to my streets,” she says. “He had his network. I had mine.”',
       '“But the week before he went quiet, the grief in Kita started moving north. All of it. Like water toward a drain.”'],
  ginReq:{relMin:{hana:0}}
});

contact('noa', {
  where:'Katagiri Noa', callImg:'char_katagiri-noa.png',
  call:['“Above the clinic,” she says. “The cats are in charge. Come up if you like.”',
        'Her voice is warm. It changes for one second when she hears your voice. You know why. You have Gin’s voice. She does not say it.'],
  meetX:'Go up. Meet the cats.', meetWhere:'Above the old vet clinic', meetImg:'cvdroom_cattery.png', meetFx:{stab:5},
  meet:['There are more cats than the lease allows. She knows every name. She remembers what you told her last time, word for word.',
        'On her shelf there is a small bowl, broken once and mended with gold. She sees you looking at it and does not explain it.'],
  gin:['She is quiet for a long time.',
       '“When he went silent I did something a senior officer is never supposed to do,” she says. “I chose what not to file.”',
       'She looks at you and then away. You have his eyes. She has to look at them across a desk and not come apart.'],
  ginReq:{relMin:{noa:30}}
});

contact('haruki', {
  where:'Tsukishiro Haruki', callImg:'char_tsukishiro-haruki.png',
  call:['“Good coffee, bad memory,” he says. “Come by.”',
        'He asks you a question. Then another. He really wants the answers. You notice he talks about coffee whenever the questions get too close to him.'],
  meetX:'The jazz bar, Thursday night.', meetWhere:'The jazz bar', meetImg:'place_fancybar.png',
  meet:['He makes you coffee first, at his place, before the bar. It is the best coffee you have ever had. Gin said the same thing once.',
        'At the bar he listens to the music with his eyes closed. There is a dried flower in his jacket pocket. He does not mention it.'],
  gin:['“Gin came to me about the old Kita file,” he says. “The disturbances before 2011.”',
       '“I have that file. Privately. My family does not know I kept it.” He sets his cup down. “Not yet, Rei. Not all of it.”']
});

contact('shimizu', {
  where:'Shimizu Ren', callImg:'char_shimizu-ren.png',
  call:['“Shimizu.” One word. Then, when she hears who it is, “I’m in. Whatever it is.”',
        'She does not soften things. She does not need to. Gin said if she tells you something will not work, it will not work. He tested it. It was expensive.'],
  meetX:'Sunday. Jazz, two hours.', meetHint:'Say it plainly. She distrusts a slow game.',
  meetWhere:'Sunday afternoon', meetImg:'place_fancybar.png',
  meet:['Two hours where she is not the person who has already decided. She orders for both of you. She is right about the drink.',
        'Her roommates think she does admin. She thinks this is funny. She laughs once, short, and it changes her whole face.'],
  gin:['“He talked about you,” she says. “At length. Gin never talks at length.”',
       '“The last month his suppression got better. Too good. Like he was holding something down that was not his.”']
});

contact('tanizaki', {
  where:'Toraya, the corner seat', callImg:'place_toraya.png',
  call:['He does not answer his phone. He is at Toraya, the corner seat, the way he always is. Six seats. Old tea.',
        'He pours. You drink. He pours again. You have learned. Nothing is said before the third cup.'],
  meetX:'Stay for the third cup.', meetWhere:'Toraya, the third cup', meetImg:'res_gridmentor.png',
  meet:['On the third cup he starts to talk. Wards. How a thin spot is tidied, not fought. Who on this street owes whom.',
        'He has a packet of seeds in his pocket. He tends graves on Saturdays. He does not explain anything until he is ready, and then he explains it once.'],
  gin:['“Your brother sat in that seat when he was younger than you are now,” he says.',
       '“Know what the tea means before you drink it, Rei.” He looks at your cup. “He did.”'],
  extra:[{x:'He has a job. A drowned client.', hint:'Tanizaki’s Drowned Client. A body found before the river gives it up.', req:{done:'m_lastweek', notdone:'s_drowned'}, hide:true, scene:'s_drowned', n:0}]
});

contact('tendo', {
  where:'Tendo Akira', callImg:'char_tendo-akira.png',
  call:['“Ask me about Nerima sometime,” he says instead of hello. “You won’t believe it.”',
        'He takes up more space than his body needs. He is loud about being good at his job. The annoying part is he is right.'],
  meetX:'Before dawn at the bath, then the temple.', meetWhere:'Tsuru-no-yu, before dawn', meetImg:'place_sento.png',
  meet:['He is the only one who comes to the bath before dawn. Mrs. Hara says so, and she is not complaining.',
        'He tells you about Nerima. You do not believe it. He laughs at your face. Then he goes quiet and asks what your real assessment would say. He already suspects. He has his own readings nobody filed.'],
  gin:['“Three years of cases next to him,” he says. “He never once told me what he was. I never told him what I am.”',
       '“Profiles that don’t match the file. That’s my whole interest, Uedera. You. Him. Me.”']
});

contact('moriya', {
  where:'Moriya Tatsuki', callImg:'char_moriya-tatsuki.png',
  call:['“Moriya.” He is patient on the phone. Too patient. He asks how you are and you can tell he is listening to how you answer, not what.'],
  meetX:'Ramen at Tatsuya. He tells more over ramen than across a desk.', meetHint:'Be precise about him. Flattery closes the door.',
  meetWhere:'Tatsuya, under the tracks', meetImg:'place_tatsuya.png',
  meet:['Six stools, one broth. He eats at Tatsuya most nights. He orders without looking at the menu.',
        'He shows you a drawing on his phone. A figure labelled Dad. His daughter. His whole face changes. Then it changes back.'],
  gin:['“Your brother vouched for you,” he says. “I noted it in your file.”',
       '“His absence is a data point. I have not filed it.” He looks at you over the bowl. “Yet.”']
});

contact('kurosawa', {
  where:'A coffee stand on a late platform', callImg:'char_kurosawa-shou.png',
  call:['There is no number. You go to the station coffee stands at night, one after another. On the fourth platform he is already there, with two cups.',
        '“You took a while,” he says. That is all he says.'],
  meetX:'Ride the last trains with him.', meetWhere:'The last train north', meetImg:'map_trains.png',
  meet:['He rides the late lines. A raven waits for him at one station. It does not belong to anyone. It belongs to him.',
        'At the end of the line he hands you a container of food without explaining it. You eat it. It is good. He does not mention it again.'],
  gin:['“A body tells you what it did,” he says. “Your brother’s body is being kept in good repair.”',
       '“That’s not a kindness, Rei. That’s maintenance.”'],
  leaveX:'Leave the platform.'
});

contact('mizuki', {
  where:'The Office of Public Confidence', callImg:'char_hagiwara-mizuki.png',
  call:['“Everything is under control,” her assistant says, and puts you through.',
        'Hagiwara Mizuki is reasonable. Devastatingly reasonable. She agrees with your first objection before you finish it.'],
  meetX:'Her glass office, after hours.', meetHint:'Never argue the Closing with her.',
  meetWhere:'Marunouchi, after hours', meetImg:'ch27_politics.png',
  meet:['Her office is glass on three sides. The city below looks managed from up here.',
        'She asks about your work and listens well. She is very good at it. Once, when a siren goes past, she glances at the window like it might open.',
        {req:{relMin:{mizuki:30}}, p:'“I sleep with the radio on,” she says, out of nowhere. “So the quiet can’t speak.” Then she changes the subject.'}],
  gin:['“Your brother was a good officer,” she says. “He noticed things he was not asked to notice.”',
       'She smiles. “I admired that.” It is the most frightening thing anyone has said to you this week.']
});

contact('usami', {
  where:'A bakery in Kōenji', callImg:'char_usami-hinata-ren.png',
  call:['“Please be gentle today,” his status says. When he answers, his voice is warm. It laughs easily.',
        'Then, for one sentence, it is someone else. Calmer. Older. “I am well. Thank you for asking.” Ren. And then Usami again, as if nothing happened.'],
  meetX:'Visit him at the bakery.', meetHint:'Accept the two of them as one. Do not try to fix it.',
  meetWhere:'Kōenji, the bakery', meetImg:'place_akebono.png',
  meet:['He is sweet with every customer. Really sweet. A rabbit on his mug.',
        'Ren reads you from across the counter. Your register. Accurately. The read is warm. You feel it like a hand on the back of your neck.'],
  gin:['“The thing in your brother,” Ren says, gently, through Usami’s mouth. “I could talk to it. Demon to demon.”',
       '“Get us into the same room,” Usami adds. “We’ll see what it says when it thinks only its own kind can hear.”']
});

contact('sei', {
  where:'Kuroda Sei', callImg:'char_kuroda-sei.png',
  call:['Sei answers on the first ring and does not say hello. He is still the way deep water is still.',
        'The grievance between your family and his is older than you. He does not want an apology. He wants the damage named, and help fixing it.'],
  meetX:'Vault, after midnight.', meetWhere:'Vault, Roppongi', meetImg:'place_club.png',
  meet:['The club is loud. He stands in it like it is silent. The doorman pretends not to see you both.',
        'He talks about the family the way other people talk about weather. He asks one question about Itsuki. Just one. You answer it honestly. Something in him unclenches a little.'],
  gin:['“A seated one,” he says. “We do not go near a seated one.”',
       '“Find your brother, intern. But do not bring it to our door.”']
});

contact('kaneda', {
  where:'The bar, eight stools', callImg:'char_kaneda-t-ru.png',
  call:['“First one’s on the house,” he says, the way he says it to everyone. He means it to everyone. That is the thing about him.'],
  meetX:'Be a regular. Sit at the counter.', meetHint:'Ask for nothing. Tip well.',
  meetWhere:'The counter, late', meetImg:'place_gaybar.png',
  meet:['He polishes a glass that is already clean while he listens. The bar rag over his shoulder.',
        'He looks after everyone in the room. You notice no one looks after him. You leave a good tip. He notices that.'],
  gin:['“Your brother used to buy the room a round,” he says. “Ask for nothing. Tip well.”',
       '“He stopped coming a few weeks back. Men stop coming for two reasons. He didn’t look like either.”'],
  extra:[{x:'Something about his late wife’s plum wine.', hint:'Kaneda’s Last Bottle. It refills itself a finger every night.', req:{done:'m_lastweek', notdone:'s_kaneda'}, hide:true, scene:'s_kaneda', n:0}]
});

contact('hara', {
  where:'Tsuru-no-yu', callImg:'char_hara-setsu.png',
  call:['“Favours aren’t free,” she says when she hears it is you. Then, “Your brother never brought you enough. I told him twice.”'],
  meetX:'Help her close up the bath.', meetWhere:'Tsuru-no-yu, closing', meetImg:'place_sento.png', meetFx:{stab:6},
  meet:['She is tiny and straight-backed and stronger than you. She hands you a brush. You scrub tiles for an hour.',
        'She tells you the history of every thin spot in Kita while you work. Not the CVD version. The true one.'],
  gin:['“Gin came here to be unarmed,” she says. “The only place he was.”',
       '“The last time, he sat in the far tub a long time. The old man who keeps it warm went cold around him.” She does not explain the old man.']
});

contact('switch', {
  where:'A number that changes every week', callImg:'char_switch.png',
  call:['There is no photograph of Switch anywhere in the CVD. There is barely a voice on the phone. A time. An address. A hang-up.'],
  meetX:'Go to this week’s Gathering.', meetWhere:'The Gathering, borrowed ground', meetImg:'place_gathering.png',
  meet:['A borrowed room behind a shuttered market. Tea. Lanterns. Ordinary people trading things that are not ordinary.',
        'Switch keeps the door. Wire-thin. She clocks you and lets you in. That is a kind of trust here.'],
  gin:['“Gin moved through the Grid like he owned a key to every door,” she says. “He did. He’d earned them.”',
       '“Don’t bring heat. That was his rule too.”'],
  extra:[{x:'A courier has gone dark.', hint:'The Grid Courier Gone Dark. Three missed drops.', req:{done:'m_briefing', notdone:'s_courier'}, hide:true, scene:'s_courier', n:0}],
  leaveX:'Hang up.'
});

contact('majima', {
  where:'Majima Kenji', callImg:'char_majima-kenji.png',
  call:['“Still here,” he says. “Surprising everyone. Me included.”',
        'He says what he means and nothing more. Favours with him compound. Owe him, and pay it back before he has to ask.'],
  meetX:'Back room of a pachinko hall.', meetWhere:'Tamaya Hall, the back room', meetImg:'place_pachinko.png',
  meet:['The noise out front is so loud it is a kind of privacy. His dog lies across the door.',
        'He gives you one thing. A name, a door, a time. He does not tell you what it will cost. You pay it before he asks. He notices.'],
  gin:['“One case with your brother,” he says. “One. He was the only man in the room who didn’t try to buy me.”']
});

contact('yua', {
  where:'Toho-dori, until it gets light', callImg:'npc_yua.png',
  call:['“Not a kid,” she says before you speak. “Don’t.”',
        'She has been watching the back of your neck for a year. She knows when you are in trouble before you do.'],
  meetX:'Buy her dinner. Show up when you said you would.', meetHint:'She needs one adult who keeps showing up. That is the whole thing.',
  meetWhere:'Kabukichō, under the cinema lights', meetImg:'place_toyoko.png',
  meet:['You buy her a proper dinner. She eats like someone might take it away. She shows off her network. Who sleeps where. Who to avoid.',
        'You walk her back under the cinema lights. You are on time. You said you would be. She acts like she did not notice. She noticed.'],
  gin:['“Your brother? Never met him,” she says. “You talk about him like he hung the moon.”', 'She pretends to look at her phone. “If you need people found, I know people. Just saying.”'],
  extra:[{x:'She owes the wrong people.', hint:'Yua’s Debt. The favour is smaller than money, and worse.', req:{done:'m_archive', notdone:'s_yua'}, hide:true, scene:'s_yua', n:0}],
  leaveX:'Hang up.'
});

contact('mori', {
  where:'Mori Haruto', callImg:'char_mori-haruto.png',
  call:['“We run this block,” his status says. On the phone he is quieter. Measured. Honest.',
        'There is a little girl in the background asking for something. His voice goes soft and suddenly much older. His sister.'],
  meetX:'The riverbank, after his sister is asleep.', meetHint:'Be a steady older friend. Nothing more.',
  meetWhere:'The riverbank, late', meetImg:'place_schoolyard.png',
  meet:['He sits on the concrete with his knees up and tells you about the gang, the rivals, the boy who sells by the arcade.',
        'He sees things. He does not know what they are. You do not tell him yet. You tell him to call you if he sees one again.'],
  gin:['“I never met him,” he says. “But you’ve been quieter this week. Like my mum when she comes home from nights.”', 'He does not ask more. He just sits closer on the concrete.'],
  extra:[{x:'Something in the dorm washroom.', hint:'The Thing in the Dorm. Only he can see it.', req:{done:'m_archive', notdone:'s_dorm'}, hide:true, scene:'s_dorm', n:0}]
});

/* ------------------------------------------------------------------ joining work */
function joinScene(img0, title, prose, roles){
  return [{img:title, imgSrc:img(img0), t:prose, c:roles.concat([{x:'Not now.', scene:'city', n:3}])}];
}
function role(career, x, hint, av, fx){
  var f = Object.assign({career:career}, fx||{});
  return {x:x, hint:hint, av:av, scene:'city', n:0, fx:f};
}

VP.scenes.join_cvd = joinScene('cvdroom_assessment_registry.png', 'Assessment and Registry',
  ['Okada sits on the panel. The intake chair is the same chair. The instrument still reads you as D. You have spent your life making sure of that.',
   '“You are already ours on paper,” she says. “An intern who files. Pick a track and you become ours in practice. Choose the room you can stand to stand in.”'],
  [ role('cvd_field','Field Operations. Investigator.','The division that helps. Aoi’s desk is by the door.','cvdroom_field_operations_floor.png',{rel:{aoi:5,okada:3}}),
    role('cvd_suppress','The suppression unit.','Holding things down. Shimizu’s people. You are already good at holding things down.','tk_suppression.png',{rel:{shimizu:5,okada:3}}),
    role('cvd_assess','Assessment and Registry.','Read other people’s ranks while you hide your own. Okada’s panel.','cvdroom_assessment_registry.png',{rel:{okada:8}, mad:3}),
    role('cvd_cattery','The Cattery. Cat handler.','Five crossing-cats named for dead operatives. Handlers only, and the cat has to agree.','cvdroom_cattery.png',{rel:{noa:5,okada:3}}),
    role('cvd_sigil','The Sigil Room. Sealwright.','Sumi and blood on washi. The back bench makes an operative unreadable.','cvdroom_sigil_room.png',{rel:{okada:3}}),
    role('cvd_archive','The Records Archive.','Every case ever opened, kept in the dark, in order.','cvdroom_the_records_archive.png',{rel:{okada:3}}) ]);

VP.scenes.join_grid = joinScene('place_gridroom.png', 'A vouch, over tea',
  ['There are no ranks in the Grid. No files. No centre to seize. Somebody vouches for you, and that person gives you one thing.',
   'Tanizaki pours the third cup. Then he puts a key on the table between you. “Don’t bring heat. Share what matters. Protect the ones in danger. Pay your debts.” He waits. “What are you going to carry?”'],
  [ role('grid_courier','Courier.','Carry between safe houses. Never the same route twice.','map_trains.png',{rel:{tanizaki:5,'switch':5}, flag:'grid_trust'}),
    role('grid_fixer','Fixer.','Broker favours. Majima’s kind of work, and his kind of danger.','place_pachinko.png',{rel:{tanizaki:5,majima:5}, flag:'grid_trust'}),
    role('grid_keeper','Safe-house keeper.','A warded room above a coin laundry. People sleep there because you keep it.','place_gridroom.png',{rel:{tanizaki:8}, flag:'grid_trust'}),
    role('grid_supplier','Supplier.','Salt, iron, ink, binding thread. The black market that keeps the unregistered alive.','res_ritualshop.png',{rel:{tanizaki:5}, flag:'grid_trust', item:{n:'Salt and iron',d:'Grid supply. Coarse salt, iron filings, a coil of cord.'}}) ]);

VP.scenes.join_tower = joinScene('tower_families.png', 'The Tower houses',
  ['Seven old families run a quiet piece of this city. They raise their children like estates. They temper them two or three ranks past what the bloodline should give.',
   'A boy with two paths open from birth is exactly what they want. That is the danger. That is also the offer.'],
  [ Object.assign(role('tower_kuroda','The Kuroda, in Nezu. Through Itsuki.','Teleportation. The most isolated house. Sei will train you. They do not forgive a debt. They file it.','tower_kuroda.png',{rel:{itsuki:4,sei:8}}), {req:{any:[{path:'buddy'},{rel:{itsuki:40}}], anyWhy:'Get closer to Itsuki (40)'}}),
    Object.assign(role('tower_tsukishiro','The Tsukishiro, in Bunkyō. Through Haruki.','The oldest lineage. A polished liaison seat with the CVD.','tower_tsukishiro.png',{rel:{haruki:8}}), {req:{rel:{haruki:35}}}) ]);

VP.scenes.join_reach = joinScene('prac_clairsent.png', 'The thing you were taught to bury',
  ['Your family’s answer to you was suppression. A child taught a dampening discipline before he could read. You have been ordinary on purpose for nineteen years.',
   'You could stop. Not all at once. A little, every night. No one would teach you. No one would protect you either. Growing strong is not getting safe. It is becoming a brighter target in a darker room.'],
  [ role('power_reach','Begin.','Every path you open beyond the first is noise the whole hidden world can hear.','prac_telepath.png',{mad:6, journal:'I started practising the reach. Alone. On purpose.'}) ]);

VP.scenes.join_walk = joinScene('place_nightcircuit.png', 'The long way',
  ['Gin used to say the long way finds what the short ways miss. You used to think it was just something he said.',
   'Bars. Baths. Kiosks. Underpasses. A cleaner’s cart. A busker’s case. The people who are awake when the city is not.'],
  [ role('street_walk','Walk it every night.','No badge. No vouch. Just your eyes and the people who talk to someone who keeps coming back.','place_nightcircuit.png',{rel:{kaneda:4,komatsu:4,hara:4}}) ]);

/* ------------------------------------------------------------------ shifts (once per chapter) */
function shift(career, where, image, prose, a, b){
  var once = {once:'shift', onceWhy:'You already worked this chapter.'};
  VP.scenes['shift_'+career] = [{img:where, imgSrc:img(image), t:prose, c:[
    Object.assign({scene:'city', n:0, req:once}, a, {fx:Object.assign({once:'shift', xp:6}, a.fx)}),
    Object.assign({scene:'city', n:0, req:once}, b, {fx:Object.assign({once:'shift', xp:6}, b.fx)}),
    {x:'Not tonight.', scene:'city', n:0}
  ]}];
}

shift('cvd_field','Field Operations floor, 2am','cvdroom_field_operations_floor.png',
  ['Fluorescent light. Whiteboards tracking possessions across the ward. A salt line in the break room that nobody talks about.','Aoi waves at you from the desk by the door. There is a case on your screen. A flat in Kita where the residents keep hearing a child on the stairs.'],
  {x:'Work it by the book, with Aoi.', hint:'Slow. Safe. She covers you.', fx:{rel:{aoi:5}, stab:3}},
  {x:'Read the scene properly. Drop the disguise a little.', hint:'Faster. Your real sight. Someone might notice the spike.', fx:{clair:1, mad:5, rel:{aoi:2}}});
shift('cvd_suppress','The suppression unit','tk_suppression.png',
  ['You spend your life holding it down. Here they call that a skill and write it on a form.','Shimizu walks the line with you. Containment geometry. Where to stand. When to let a thing think it has won.'],
  {x:'Learn her method exactly.', hint:'The Orimoto way. Discipline you can lean on.', fx:{rel:{shimizu:6}, stab:5}},
  {x:'Hold the breach yourself while she watches.', hint:'It will cost you. It will show her what you can carry.', fx:{rel:{shimizu:4}, clair:1, stab:-5}});
shift('cvd_assess','Assessment and Registry','cvdroom_assessment_registry.png',
  ['Every two months they read you. Today you sit on the other side of the chair and help read someone else.','A trainee in the chair. A number on the instrument. You can see it is wrong. A full grade too low. Like yours.'],
  {x:'Log what the instrument says.', hint:'Keep your head down. Okada watches you not lie.', fx:{rel:{okada:5}}},
  {x:'Quietly flag the error.', hint:'The right thing. It also draws an Auditor’s eye toward the panel.', fx:{rel:{okada:3}, mad:2, flag:'flagged_assessment', clair:1}});
shift('cvd_cattery','The Cattery','cvdroom_cattery.png',
  ['Five cats on cushions with brass name tags. Sera. Itou. Mochida. Hara. Kuga. Named for dead operatives. They carry people across the city in ways the rest of the building does not discuss.','Kuga, on the window cushion, watches you. Kuga is the strongest. Kuga has not decided about you.'],
  {x:'Feed them. Brush them. Be boring.', hint:'The cats decide on their own time.', fx:{rel:{noa:5}, stab:6}},
  {x:'Ask Kuga to carry you.', hint:'The cat’s consent, or nothing.', fx:{rel:{noa:3}, mad:4, clair:1, journal:'Kuga carried me across the ward and back. I will not describe it. I could not.'}});
shift('cvd_sigil','The Sigil Room','cvdroom_sigil_room.png',
  ['Long benches. Sumi ink and the smell of blood. Sealwrights brushing wards onto washi, slowly, not talking.','At the back, behind a curtain, the bench that makes an operative unreadable. By order only.'],
  {x:'Brush wards for the field teams.', hint:'Your hand gets steadier. So do you.', fx:{stab:5, item:{n:'A ward slip',d:'Brushed in the Sigil Room. It holds, a little, for a little while.'}}},
  {x:'Look behind the curtain.', hint:'You are not cleared. You look anyway.', fx:{mad:4, clair:1, flag:'seen_back_bench'}});
shift('cvd_archive','The Records Archive','cvdroom_the_records_archive.png',
  ['Every case the Division ever opened, kept in the dark, in order. A true thing for a true thing. Never for money.','Somewhere in here is the file on your brother. Sealed by an office, not a name.'],
  {x:'File what you are given. Learn the shelves.', hint:'Patience. The archive rewards it.', fx:{stab:4}},
  {x:'Pull a file you are not cleared for.', hint:'Kita, before 2011. The thin years.', fx:{mad:4, clair:1, flag:'archive_kita', journal:'The old Kita files. The disturbances cluster north, by the water, years before anyone called it a pattern.'}});
shift('grid_courier','A drop to carry','map_trains.png',
  ['A package, an address, a time. You change trains three times. You never take the same route twice.','Switch does not say thank you. Switch gives you the next drop. Here that is the same thing.'],
  {x:'Take the safe route. Arrive late.', hint:'Don’t bring heat.', fx:{rel:{'switch':5}, stab:2}},
  {x:'Cut through the underpass. Arrive on time.', hint:'Fast. The underpass is the thinnest walk-through place in Kita.', fx:{rel:{'switch':4}, mad:4, clair:1}});
shift('grid_fixer','A favour to broker','place_pachinko.png',
  ['Majima’s back room. The noise out front is a kind of privacy. Two people need something from each other and neither will say it first.','You are in the middle. That is the job.'],
  {x:'Make the deal fair.', hint:'Debt and reciprocity. The Grid remembers who was fair.', fx:{rel:{majima:5}, stab:2}},
  {x:'Read them both while they talk.', hint:'You will know who is lying. It costs.', fx:{rel:{majima:3}, clair:1, mad:4}});
shift('grid_keeper','The safe house','place_gridroom.png',
  ['A warded room above a coin laundry. A fold-out bed. A kettle. Ward-marks on every wall.','Tonight a woman sleeps here who the CVD would put in a cell. She does not tell you her name. You do not ask.'],
  {x:'Keep watch all night.', hint:'Protect the ones in danger.', fx:{rel:{tanizaki:5}, stab:-2, xp:4}},
  {x:'Renew the wards with your own sight.', hint:'Stronger wards. A brighter light in a dark street.', fx:{rel:{tanizaki:3}, clair:1, mad:4}});
shift('grid_supplier','Supplies to move','res_ritualshop.png',
  ['Salt from the ritual shop with no name. Iron from Maki’s. Cord, ink, mirror blanks. The black market that keeps the unregistered alive.','Everybody wants it. Nobody wants to be seen buying it.'],
  {x:'Deliver it quiet and cheap.', hint:'Share what matters.', fx:{rel:{tanizaki:4}, stab:3}},
  {x:'Keep some back for yourself.', hint:'You might need it. They might find out.', fx:{rel:{tanizaki:-3}, item:{n:'Iron filings and salt',d:'Kept back from a Grid delivery.'}}});
shift('tower_kuroda','The Kuroda compound, Nezu','res_towerdojo.png',
  ['Old wood gone black. A wall that has outlived three governments. Sei trains you in the cold morning.','He does not praise. He does not shout. He corrects your stance by one centimetre, and the whole world is different.'],
  {x:'Train the path the house can teach.', hint:'Sei trains a path toward the fifth level. Slowly.', fx:{rel:{sei:5}, clair:1, stab:2}},
  {x:'Ask him to push you past where it is safe.', hint:'Tempering. Two or three ranks past what the blood should give.', fx:{rel:{sei:6}, clair:1, tele:1, mad:8, stab:-6}});
shift('tower_tsukishiro','The Tsukishiro liaison seat','tower_tsukishiro.png',
  ['A polished room. A polished seat. The oldest family in the city, talking to the CVD through you.','Haruki sits beside you and makes coffee nobody asked for. It is still the best coffee in the building.'],
  {x:'Do the job. Carry messages. Say nothing extra.', hint:'The family notices obedience.', fx:{rel:{haruki:5}, stab:3}},
  {x:'Read the room for Haruki.', hint:'What the family wants that it is not saying.', fx:{rel:{haruki:6}, clair:1, mad:4}});
shift('power_reach','The reach, alone','prac_clairsent.png',
  ['The flat at night. The cold key in your hand. Nobody to teach you and nobody to stop you.','You reach. A little further than last time.'],
  {x:'Ration it. One path, carefully.', hint:'Slow. Survivable.', fx:{clair:1, mad:4, stab:-3}},
  {x:'Open both registers.', hint:'Everything at once. The hidden world will hear it.', fx:{clair:1, tele:1, mad:10, stab:-8, journal:'I opened both. For a second I could hear the whole building think. Then I could hear the things under the building listening back.'}});
shift('street_walk','The night circuit','place_nightcircuit.png',
  ['Public toilets and underpasses. A cleaner’s cart. A blind busker who packs up before the tunnel turns.','The people who are awake at three in the morning know things the CVD will never write down.'],
  {x:'Walk the circuit. Talk to whoever is awake.', hint:'The long way.', fx:{rel:{kaneda:3, komatsu:3, hara:3}, stab:5}},
  {x:'Sit with the dead at the riverside memorial.', hint:'Be quiet there.', fx:{clair:1, mad:3}});

/* ------------------------------------------------------------------ the pact */
VP.scenes.pact = [
  { img:'His number, 3:47 in the morning', imgSrc:img('ext_sojo.png'), title:'The Agreement',
    t:['It is his voice. That is the worst part. It is exactly his voice.',
       '“Rei. You know what I am now. The street calls it the Healer. I do not mind the word.”',
       '“There is another one. It wears a woman called Fukai Rinka. The mourners call her Kanna-sensei. It is farming their grief to make itself a god.”',
       '“I am going to end it. A thing like that can only be killed from inside a body, on this side. I have a body. I need eyes. Yours.”',
       'It waits. It is very patient. It sounds like your brother being reasonable.'],
    c:[
      {x:'Agree. Help it hunt Kishin.', hint:'It will spend everything to win. Everything includes Gin’s body. It will not spare the cult’s followers either.', scene:'city', n:0,
       fx:{flag:['pact_yushiro','pact_offered'], mad:10, journal:'I made an agreement with the thing wearing my brother. It wants to kill the other one. So do I. That is the whole agreement. I keep telling myself that.'}},
      {x:'Refuse. In Gin’s own code.', hint:'Three taps. I heard him, not you.', scene:'city', n:0,
       fx:{flag:['pact_offered','pact_refused'], gin:1, stab:-4, journal:'I refused it. I answered in the code Gin taught me. For one second the line went cold, like something on the other end had to remember how to breathe.'}},
      {x:'Hang up without a word.', hint:'Silence is also an answer. It will read it.', scene:'city', n:0, fx:{flag:'pact_offered'}}
    ]},
  { img:'An errand for the Healer', imgSrc:img('ch19_funnel.png'),
    t:['A text, in his calm voice. An address. A bereavement circle in a community hall. Folding chairs in a ring. An empty chair with a candle on it.',
       'You sit at the back. You watch who the grief flows toward. You write it down small, the way he taught you. You send it.',
       'Two days later one of the people in that ring is gone. Nobody can say where. The Healer thanks you. It sounds like Gin saying thank you.'],
    c:[{x:'Go home. Do not think about the empty chair.', scene:'city', n:0, fx:{once:'errand', mad:6, xp:8, flag:'cult_known'}}]},
  { img:'Breaking the agreement', imgSrc:img('char_uedera-gin.png'),
    t:['You tell it no more. You say it out loud in the empty flat, because you know it can hear you.',
       'The lights do not flicker. Nothing breaks. That would be easier.',
       'Instead your phone lights up with one word, in your brother’s lowercase. <em>understood.</em> And under it, a second later, two taps. The old code. Him.'],
    c:[{x:'Breathe.', scene:'city', n:0, fx:{unflag:'pact_yushiro', flag:'pact_broken', stab:-10, gin:1, journal:'I broke the agreement. The thing in Gin said it understood. I believe it. That is what frightens me.'}}]}
];

/* ------------------------------------------------------------------ the Director and the President */
VP.scenes.mizuki_offer = [
  { img:'A glass office above the city', imgSrc:img('char_hagiwara-mizuki.png'), title:'The Closing',
    t:['Hagiwara Mizuki pours you tea herself. She thanks you for coming. She agrees with you before you have said anything.',
       '“Here is what I believe, Rei. The veil is failing. The dead want back in. We cannot hold them with goodwill.”',
       '“So we catalogue every medium. We contain the ones who are dangerous. And we close it. Seal the centre. Weld it shut, permanently.”',
       '“You are not what your file says. I know that. I would rather have you with me than in a cell. Both are possible.”',
       'She is not a monster. That is what makes her dangerous.'],
    c:[
      {x:'Help her close it.', hint:'The veil welded shut. Every medium catalogued. Including you. Including Gin.', scene:'city', n:0,
       fx:{flag:['closing_side','mizuki_offered'], rel:{mizuki:20, okada:-15, tanizaki:-20, hana:-20}, journal:'I said yes to the Director. She shook my hand. Her hand was cold. She said thank you like she meant it.'}},
      {x:'Tell her no. Politely.', hint:'She will agree that it is a reasonable answer. Then she will proceed.', scene:'city', n:0,
       fx:{flag:'mizuki_offered', rel:{mizuki:-5}, journal:'I told the Director no. She smiled and said she understood. She wrote something down after I left.'}},
      {x:'Say nothing. Drink the tea.', hint:'Let her think you are deciding.', scene:'city', n:0, fx:{flag:'mizuki_offered'}}
    ]}
];
VP.scenes.adachi = [
  { img:'Director Adachi Kenshin', imgSrc:img('char_director-adachi-kenshin.png'), title:'The Door to the President',
    t:['Okada walks you in and stays by the door. Director Adachi does not stand. He reads you in the time it takes you to sit down. He knows exactly what you are.',
       'Gin wrote it in the back of his book. Do not lie to him. You get one attempt. After that he goes silent, and that silence is the last time he trusts you.',
       '“Okada says you have something,” Adachi says. “Show me.”'],
    c:[
      {x:'Put all of it on his desk. The vessel-farm. The seat. The Director’s plan.', hint:'Proof in front of the President is how the Closing is stopped.', scene:'city', n:0,
       fx:{flag:'president_door', rel:{okada:6}, xp:15, journal:'I told Adachi everything. He did not interrupt once. When I finished he said, “The President will see this tonight.” Okada let out a breath I did not know she was holding.'}},
      {x:'Hold some of it back.', hint:'You only get one attempt.', scene:'city', n:0,
       fx:{flag:'adachi_silence', rel:{okada:-8}, journal:'I held something back. Adachi noticed. He thanked me and that was the end of it. Okada did not look at me on the way out.'}}
    ]}
];

/* ------------------------------------------------------------------ endings */
var END = [
  ['anchor','The Anchor','char_the-axis.png',[
    'You take the chair. Not as a throne. As a duty. Your own register, the one your family buried in you before you could read.',
    'And because you did everything else right, it does not cost you your brother. You say his tenant’s true name out loud, with love, the only way it can be said. Tachibana Yushiro. A physician who crossed forty years ago refusing to leave the dying untended. The name does not defeat it. It anchors it. It lets go of Gin the way a tired man sets down a bag.',
    'The wall holds. The Axis, mostly light, stands with you. Kishin is exposed and the Director is buried under the proof on the President’s desk.',
    'You live an ordinary life in Tokyo after that. You channel something vast. Gin cooks for three again. Daiki eats like he has been starving.',
    'Tanizaki makes tea and does not say anything about it.']],
  ['continuation','The Continuation','finale_two_thirteens.png',[
    'You take the chair yourself. The wound closes around you. The flood never comes. Kita sleeps on and never knows.',
    'Gin walks off the embankment whole, into a morning you will only ever feel from underneath.',
    'It is the most generous thing you have ever done. Not everything held, so it costs you the rest of your life as a person. You knew that when you sat down.',
    'Sometimes he comes to the river and talks to you. You can hear him. You cannot answer.']],
  ['cost','The Cost','char_uedera-gin.png',[
    'You let it be Gin. You release the Axis. The worn body takes the seat. The wall mends.',
    'It is the choice he begged you to make with his one stolen sentence. It saves the city. It saves you.',
    'You carry the absence home. Two cups on the rack. You take one down. After a long time, you take down the second one too, and put it in a cupboard, and close the door.']],
  ['longgame','The Long Game','res_archive.png',[
    'You refuse to close it tonight. You take Gin off the embankment. You leave the chair open and the wall thin.',
    'It is the only door that does not spend a brother or a city in the next sixty seconds. It is not a victory. It is time.',
    'You go home and you write it all down, small, in the back of his book, the way he taught you. Then you start the next page.']],
  ['exorcism','The Exorcism','ch6b_expulsion.png',[
    'You refuse the chair, and you refuse to let the Healer have it. Shimizu holds the containment line with the Orimoto geometry. Kurosawa reads the body and tells you exactly when.',
    'At that moment you reach for your brother, not the thing in him, and you do not let go first.',
    'Yushiro is sent back. Gin is freed. The seat stays empty, and the wall stays thin, and that is a problem for another year.',
    'Gin sleeps for three days. When he wakes up he asks for tea. You make it. He tells you it is too strong. You both laugh until it stops being laughing.']],
  ['flood','The Flood','ext_sojo.png',[
    'You kept your agreement. The Healer found Kishin. It killed her from inside your brother’s body, on this side, the only place a thing like that can die.',
    'Then it opened the veil, because that was always the rest of its duty.',
    'The dead come back to Kita. Not all of them want to. Not all of the living survive meeting them.',
    'Your brother’s body is still walking somewhere north of the river. You do not know if anyone is inside it but the Healer. You tell yourself it was worth it. On some nights you believe you.']],
  ['throne','The Throne','ch21_entitysight.png',[
    'You reached too far, too often. The Madness did not break you. It made you room.',
    'You absorb what is in front of you and it feels like coming home. Both registers wide open. Every thin spot in Kita turns to look at you.',
    'The seat takes you. It does not take you well. Somewhere on the embankment your brother is taken the same way.',
    'Both Uedera brothers, dark. The city does not know your names. It knows your weather.']],
  ['closing','The Closing','ch27_politics.png',[
    'The Director wins. You helped her.',
    'Every medium in the northern wards is catalogued. The dangerous ones are contained. The centre is sealed. The veil is welded shut.',
    'The dead stop coming home along the river at Obon. So does everything else that used to cross. The Grid goes quiet. Some of the people in your phone stop answering.',
    'Mizuki sends you a note. It says thank you. It says everything is under control. You keep it in a drawer you do not open.']]
];
VP.endings = {};
VP.scenes.end = END.map(function(e, i){
  VP.endings[e[0]] = {name:e[1], idx:i};
  var t = e[3].slice();
  t.push({req:{partnerAny:true}, p:'{partner} is there afterwards. They do not ask what it cost. They already know. They stay.'});
  t.push({req:{relMin:{itsuki:60}}, p:'Itsuki paints the overpass one more time. For the first time, it comes out right.'});
  t.push({req:{relMin:{daiki:50}}, p:'Daiki never learns any of it. He keeps showing up anyway. On Saturdays you walk the river and he tells you terrible jokes, and you are nineteen.'});
  return {img:'The end. '+e[1], imgSrc:img(e[2]), title:e[1], book:'Ending', pillars:true, t:t, c:[
    {x:'Keep living in the city.', hint:'Your people are still in your phone. Some stories are not finished.', scene:'city', n:0},
    {x:'Begin again from the kitchen.', hint:'3:47 in the morning. The kettle is cold.', do:'reset'}
  ]};
});

/* ------------------------------------------------------------------ the world (lore panel) */
VP.loreTabs = {city:'The City', factions:'Factions', thirteen:'The Thirteen', ranks:'Ranks', gin:'Gin’s Notes', files:'Files'};
function card(title, ps, cls){ return '<div class="lore-card'+(cls?' '+cls:'')+'"><div class="lore-card-title">'+title+'</div>'+ps.map(function(p){return '<p>'+p+'</p>';}).join('')+'</div>'; }
VP.lore = [
  {tab:'city', html:card('TOKYO, AUGUST, OBON', ['Obon week. The dead come home along the water, and the families set paper lanterns on the river for them.', 'You live in Kita-ku, in Ōji, in a two-room flat that is really Gin’s. You just never left.'])},
  {tab:'city', html:card('THE VEIL', ['The membrane between the living and the dead. Some places have almost none of it left. Practitioners call them thin spots. Kita has more than its share.', 'Lately the whole ward has been thinning, the way water goes out before a wave.'])},
  {tab:'city', req:{flag:'seen_overpass'}, locked:'A place you have not stood yet.', html:card('THE ŌJI OVERPASS', ['The last ordinary place your brother stood. A man crossed it at 1:14 in the morning with his shadow falling ahead of him instead of behind.'])},
  {tab:'factions', html:card('THE CVD', ['The Civil Veil Directorate. The institution that registers, ranks and polices everyone with an open aperture.', 'Field Operations is the division that helps. Assessment and Registry turns an aperture into a rank and a number. Internal Affairs and Audit files. Containment keeps the cells.'])},
  {tab:'factions', html:card('THE GRID', ['The unregistered. No leadership. Organised the way water is, with no centre to seize.', 'Someone vouches for you and gives you one thing. Show up. Do not bring heat. Share what matters. Pay your debts. Protect practitioners in danger.'])},
  {tab:'factions', html:card('THE TOWER HOUSES', ['Seven old families. Tsukishiro, the oldest. Fujiwara-Kage, investigation. Orimoto, suppression. Higashiyama, the best field medics in the country. Kuroda, teleportation, the most isolated. Akiyama, divided. Nishimura, the newest.', 'They temper their children past what the blood should give. The Kuroda do not forgive a debt. They file it.'])},
  {tab:'factions', req:{flag:'cult_known'}, locked:'Something that feeds in warm places. You have not named it yet.', html:card('THE FAR-SHORE CIRCLE', ['A bereavement fellowship. The grieving come to put their grief down.', 'Some of them never pick themselves back up. The Circle calls its leader Kanna-sensei.'])},
  {tab:'thirteen', html:card('THIRTEEN SEATS', ['Supreme protectors of the veil. Each one aligned with a single emotion. Their existence is not public knowledge.', 'One seat is empty. Duty. The thirteenth. Everything stable depends on it, and no one holds it.'])},
  {tab:'thirteen', req:{done:'m_twelve'}, locked:'You do not know the holders yet.', html:'<div class="lore-card"><div class="lore-card-title">THE TWELVE WHO HOLD</div>'+
    [['I','Grief. Asakura Mio'],['II','Rage. Mori Takao'],['III','Love. Sasaki Kei'],['IV','Fear. Nakashima Yuna'],['V','Wonder. Chen Lian'],['VI','Despair. Watanabe Jun, weakening'],['VII','Joy. Hoshino Haru'],['VIII','Shame. Kobayashi Emi'],['IX','Hunger. Inoue Satoru'],['X','Courage. Fujiwara Natsumi'],['XI','Longing. Park Junho'],['XII','Awe. Kasumi Shin'],['XIII','Duty. Vacant']]
      .map(function(s){return '<div class="seat"><b>'+s[0]+'</b><span>'+s[1]+'</span></div>';}).join('')+'</div>'},
  {tab:'thirteen', req:{done:'m_word'}, locked:'There is a word for what is in your brother. You do not have it yet.', html:card('THE HEALER', ['The street word for the one that wears the Duty register and presents as help.', 'They do not consume the host. They employ him.'])},
  {tab:'ranks', html:card('THE RANKS', ['0 the Null. E Sensitive. D Postulate. C Adept. B Ritualist. A Arbiter. S Vanguard. SS Guardian. SSS Singularity.', 'Your file says D. Your file is a lie you have kept since before you could read.'])},
  {tab:'ranks', html:card('THE SIX PATHS', ['Clairsentience. Telepathy. Psychometabolism. Telekinesis. Psychokinesis. Teleportation.', 'Most people open one. You were born with two. Every path open beyond the first makes you louder to everything that listens.'])},
  {tab:'gin', req:{flag:'hasBook'}, locked:'His book. You have not opened it.', html:card('THE INDEX CARD', ['“If I stop writing, read it in order. Out of order it lies by omission.”'], 'gin')},
  {tab:'gin', req:{flag:'hasBook'}, locked:'', html:card('THE CONTACT PAGES', ['“If I am not available to make the introductions, the names on these pages will make time for Rei if he asks correctly. Ask how they are first.”'], 'gin')},
  {tab:'gin', req:{done:'m_archive'}, locked:'Read the Archive in order.', html:card('A MARGIN NOTE', ['“My brother. Notices everything. Always did.”'], 'gin')},
  {tab:'gin', req:{done:'m_archive'}, locked:'', html:card('ON THE CLINIC', ['“Go to her. Do not wait until you have to.”'], 'gin')},
  {tab:'gin', req:{done:'m_after14'}, locked:'The entries after the 14th.', html:card('THE 14TH', ['“Don’t trust my handwriting after the 14th.”'], 'gin')},
  {tab:'files', req:{any:[{flag:'path_cvd'},{flag:'cvd_reg_lead'},{flag:'cvd_registered'}]}, locked:'A CVD file you have not seen.', html:card('CVD FILE, SEALED', ['Logged at 1:14 in the morning. SECOND-PRESENCE INDICATORS. SUBJECT UNCOOPERATIVE.', 'Sealed from a height. By an office, not a name.'])},
  {tab:'files', req:{any:[{flag:'path_grid'},{flag:'grid_secret'}]}, locked:'Something the Grid does not say out loud.', html:card('A GRID CHARM', ['A charm of knotted cord and old iron. It goes cold and dead in your hands on one word.', 'DUTY.'])},
  {tab:'files', req:{flag:'archive_kita'}, locked:'Kita, before 2011.', html:card('KITA, BEFORE 2011', ['The old disturbances cluster north, toward the water, years before anyone called it a pattern.'])}
];
})();
