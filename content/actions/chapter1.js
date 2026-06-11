/* Veil Protocol content :: Chapter One action handlers. Call engine globals at runtime. */
Object.assign(window.VP.actions, {
 takeBook(){G.flags.hasBook=true;G.player.inventory.push({n:"Gin's field book",e:'📓',d:"The whole archive, in his hand."});document.getElementById('dock-book').classList.remove('hidden');gainXP(1);},
 pathGrid(){G.flags.path='grid';G.flags.grid=true;meet('tanizaki');bumpStanding('grid',1);questStep('gin',1);openV('phone');phChat('tanizaki');},
 pathCVD(){G.flags.path='cvd';G.flags.cvd=true;bumpStanding('cvd',1);questStep('gin',1);openV('phone');phChat('okada');},
 pathBuddy(){G.flags.path='buddy';G.flags.buddy=true;questStep('gin',1);openV('phone');phChat('itsuki');},
 pathPower(){G.flags.path='power';G.flags.power=true;G.player.stability=Math.max(0,G.player.stability-12);fxVeil('dark');questStep('gin',1);},
 pathLook(){G.flags.path='look';G.flags.look=true;meet('kaneda');questStep('gin',1);},
 lookFight(){startFight('the-lingering',function(){if(ACTIONS.clueGin)ACTIONS.clueGin();G.node=9;renderScene();renderTop();window.scrollTo(0,0);});},
 clueGin(){questStep('gin',1);var q=G.quests.find(function(x){return x.id==='gin';});if(q)q.steps.push({t:'The wrong shadow on the Ōji overpass... find who it was',done:false});G.notes.unshift({txt:'A man with the wrong shadow... Ōji overpass, the night Gin vanished. (the Lingering saw him pass.)',day:G.day,time:fmt(G.min)});gainXP(4);},
 // ---- Chapter One... Itsuki & the Towers ----
 beginItsuki(){meet('itsuki');var g=G.places.find(function(p){return p.id==='geidai';});if(g)g.known=true;
    if(!G.quests.some(function(q){return q.id==='towers';}))G.quests.unshift({id:'towers',title:'Itsuki & the Towers',steps:[{t:'Bring the wrong-shadow thread to Itsuki',done:false},{t:'Reach the man: the family’s way or the painting’s',done:false}],arch:false});
  },
 itsukiCommit(){G.flags.itsukiHelps=true;questStep('towers',0);
    G.notes.unshift({txt:'Itsuki is on Gin’s case. A Kuroda moves when a Kuroda decides to, and he has decided.',day:G.day,time:fmt(G.min)});gainXP(5);},
 towerGate(){G.flags.kurodaSeen=true;bumpStanding('tower',1);
    G.notes.unshift({txt:'The Kuroda compound, Nezu. The teleport lineage, the most isolated of the seven houses. The cousin at the gate is a true teleportist, and not your friend.',day:G.day,time:fmt(G.min)});},
 towerPress(){G.flags.itsukiSpent=true;if(typeof bumpRel==='function')bumpRel('itsuki',6);
    G.notes.unshift({txt:'You made Itsuki spend the name. He does not get it back, and the family now owns that he spent it, and on you. He would do it again. That is the cost you chose.',day:G.day,time:fmt(G.min)});gainXP(3);},
 towerSpare(){advance(60);G.notes.unshift({txt:'You would not bleed him for it. The slower way costs time instead, and time is the man with the wrong shadow getting further north.',day:G.day,time:fmt(G.min)});gainXP(3);},
 towerSecret(){G.notes.unshift({txt:'You read what the Kuroda truly fear: not a demon, but a VACANT seat being filled. A throne of the Thirteen has stood empty, and a seated one on the move means the empty one is being walked toward. The membrane has been thinning since the seat went dark.',day:G.day,time:fmt(G.min)});gainXP(8);},
 towerLead(){questStep('towers',1);
    G.notes.unshift({txt:'The family’s truth: the man carries a seated one, top-grade, of the DUTY register. The Towers have feared a seat of the Thirteen on the move for generations, and will not follow it. What it is to Gin, the family would not say.',day:G.day,time:fmt(G.min)});gainXP(8);},
 seiOpens(){G.flags.kurodaOpen=true;bumpStanding('tower',1);meet('sei');var k=G.places.find(function(p){return p.id==='kurodacompound';});if(k)k.known=true;
    G.notes.unshift({txt:'Kuroda Sei reached once, through the family’s anchor-stone, toward the man and not the brother. The case has caught the family’s interest for reasons that are theirs.',day:G.day,time:fmt(G.min)});gainXP(6);},
 paintingJump(){G.player.stability=Math.max(0,G.player.stability-10);G.player.madness=Math.min(100,G.player.madness+8);if(typeof fxVeil==='function')fxVeil('dark');questStep('towers',1);
    G.notes.unshift({txt:'Itsuki forced the canvas into a door with blood and linseed. It half-held, and took you where it wanted, not where he aimed. The teleporter’s tax: a part of you stays behind, the world a half-degree off true.',day:G.day,time:fmt(G.min)});gainXP(6);},
 cultFight(){startFight('ridden-mourner',function(){G.flags.cultKnows=true;G.notes.unshift({txt:'The man came to the Far-Shore Circle and was not seized; he walked in carrying a sorrow it could not feed on, already feeding a passenger of the DUTY register, and walked out north, unafraid. The Circle fears him, and now it knows your face.',day:G.day,time:fmt(G.min)});G.scene='itsuki';G.node=11;renderScene();renderTop();window.scrollTo(0,0);});},
 paintFlee(){G.flags.cultKnows=true;G.flags.itsukiBlocked=true;
    G.notes.unshift({txt:'You ran for the tear and made it, and left the woman ridden, and learned less than you might have. The crossing back took the last of Itsuki’s gift: the canvas is blank, and the colour will not come for him. The Circle has your face and your friend’s.',day:G.day,time:fmt(G.min)});gainXP(4);},
 paintLead(){G.flags.itsukiBlocked=true;questStep('towers',1);
    G.notes.unshift({txt:'The painting’s truth: a cult that recruits the grieving, a man who walked through it carrying DUTY and out unafraid, north, toward water. The price was Itsuki’s gift, scraped blank, perhaps for good. He would do it again.',day:G.day,time:fmt(G.min)});gainXP(8);},
 beginCVD(){meet('okada');var p=G.places.find(function(x){return x.id==='cvd';});if(p)p.known=true;bumpStanding('cvd',1);
   if(!G.quests.some(function(q){return q.id==='cvd';}))G.quests.unshift({id:'cvd',title:'The Directorate',steps:[{t:'Bring the wrong-shadow thread to the CVD (Okada)',done:false},{t:'Choose how a person finds anything out in that building',done:false}],arch:false});
   questStep('cvd',0);
   G.notes.unshift({txt:'Okada: there are two ways to find anything out in the Directorate, and they do not lead to the same place. The record, or the human truth. Not both, not as a stranger.',day:G.day,time:fmt(G.min)});gainXP(5);},
 cvdRegister(){G.player.registered=true;bumpStanding('cvd',2);
   G.notes.unshift({txt:'You are in the system now. Name, level (a low D, as far as they can tell), address... all in Component One, readable for life. The institution does not let go of what it catalogues.',day:G.day,time:fmt(G.min)});gainXP(3);},
 cvdSecret(){G.notes.unshift({txt:'You read the assessor back. The pause was a STANDING ORDER on Gin\'s case, flagged to one office, high. Someone in the tower has been waiting, specifically, for his brother to walk in and ask.',day:G.day,time:fmt(G.min)});gainXP(8);},
 cvdAsset(){startFight('cvd-asset',function(){G.notes.unshift({txt:'The contained asset gives up the piece the file would not: the man crossed going NORTH, toward water.',day:G.day,time:fmt(G.min)});ACTIONS.cvdRegLead();G.scene='cvd';G.node=6;renderScene();renderTop();window.scrollTo(0,0);});},
 cvdRegLead(){questStep('cvd',1);
   G.notes.unshift({txt:'The Directorate\'s shape of it: a case logged 1:14am at Ōji, SECOND-PRESENCE INDICATORS, sealed under an office high enough to silence Okada. They know what took the man and have decided you are not to. You traded the human why away, and the system has your name now.',day:G.day,time:fmt(G.min)});gainXP(8);},
 cvdOff(){if(typeof bumpRel==='function')bumpRel('okada',8);
   G.notes.unshift({txt:'Okada looked off her own neck, no file, no record, because Gin was the kind of man you do that for. She thinks he was protecting something. She thinks it was you.',day:G.day,time:fmt(G.min)});gainXP(5);},
 cvdWitness(){startFight('stairwell-child',function(){G.notes.unshift({txt:'The witness by the water remembers Gin coming here, north, again and again in secret... and that on the last night, he did not come alone.',day:G.day,time:fmt(G.min)});ACTIONS.cvdOffLead();G.scene='cvd';G.node=10;renderScene();renderTop();window.scrollTo(0,0);});},
 cvdOffLead(){questStep('cvd',1);
   G.notes.unshift({txt:'The human shape of it, and no proof: a brother who changed, who was protecting you from a thing he would not name, who went north to the water in secret and did not come back from the last night alone. To hold the record... the seal, the office, the proof... you would have to become theirs.',day:G.day,time:fmt(G.min)});gainXP(8);},
 beginGrid(){meet('tanizaki');['sanya','gathering'].forEach(function(pid){var p=G.places.find(function(x){return x.id===pid;});if(p)p.known=true;});bumpStanding('grid',1);
    if(!G.quests.some(function(q){return q.id==='grid';}))G.quests.unshift({id:'grid',title:'The Grid',steps:[{t:'Bring the wrong-shadow thread to Tanizaki',done:false},{t:'Earn the Grid’s truth, the inner door or the hard turn',done:false}],arch:false});questStep('grid',0);
    G.notes.unshift({txt:'The Grid does not exist on paper. No files, no protection, only people and favors that are never free.',day:G.day,time:fmt(G.min)});gainXP(5);},
 gridScatter(){if(typeof bumpRel==='function')bumpRel('tanizaki',6);
    G.notes.unshift({txt:'You helped the Grid scatter ahead of the CVD sweep instead of grabbing your answer. The unregistered noticed. Trust is the only currency down here, and you spent the right way.',day:G.day,time:fmt(G.min)});gainXP(4);},
 gridGrab(){if(typeof bumpRel==='function')bumpRel('tanizaki',-4);
    G.notes.unshift({txt:'You put your answer ahead of the people scattering around you. You got it faster, and Tanizaki will remember that you did.',day:G.day,time:fmt(G.min)});gainXP(2);},
 gridName(){G.notes.unshift({txt:'You spent Gin’s credit, the last thing he left down here. The door is open, once.',day:G.day,time:fmt(G.min)});gainXP(3);},
 gridSecret(){G.notes.unshift({txt:'What the Grid is most afraid of: a VACANT seat of the Thirteen, a throne gone empty, and the membrane thinning toward it since the night it went dark. A seated demon on the move means the empty seat is being walked toward. That is what the man is carrying Gin into.',day:G.day,time:fmt(G.min)});gainXP(8);},
 gridCreditLead(){questStep('grid',1);
    G.notes.unshift({txt:'The Grid’s truth: a sensitive’s certainty, a charm gone dead, a seat of the Thirteen of the DUTY register riding the man north, toward water, and a grief-cult that will not touch him. No file holds it.',day:G.day,time:fmt(G.min)});gainXP(8);},
 gridCultFight(){startFight('ridden-mourner',function(){G.flags.cultKnows=true;if(typeof bumpRel==='function')bumpRel('tanizaki',8);G.notes.unshift({txt:'You cut the cord and freed the runner in his place. The Far-Shore medium let you go; the grieving always come back. The man crossed the Circle a fortnight back and even the cult’s medium knelt for what he carries. North, toward water, unafraid.',day:G.day,time:fmt(G.min)});G.scene='grid';G.node=10;renderScene();renderTop();window.scrollTo(0,0);});},
 gridRun(){G.flags.cultKnows=true;G.notes.unshift({txt:'You took the intel and left the runner ridden. Faster, and it does not feel clean. The man crossed the Circle and it went out of his way; north, toward water, carrying something that made a cult medium kneel.',day:G.day,time:fmt(G.min)});gainXP(4);},
 gridFreed(){questStep('grid',1);
    G.notes.unshift({txt:'The earned truth: a saved runner’s account. The man passed through the Far-Shore Circle and the cult fears him; even their medium knelt. A seat of the Thirteen, DUTY, going north toward water, unafraid.',day:G.day,time:fmt(G.min)});gainXP(8);},
 gridRunLead(){questStep('grid',1);
    G.notes.unshift({txt:'The earned truth, the thinner version: the man crossed the Circle, it went out of his way, he went north carrying a seat of the Thirteen. You did not stay to be sure, or to be clean.',day:G.day,time:fmt(G.min)});gainXP(6);},
 beginPower(){if(!G.quests.some(function(q){return q.id==='power';}))G.quests.unshift({id:'power',title:'The unstable gift',steps:[{t:'Reach for the gift you have hidden your whole life',done:false},{t:'Find where the man went, without giving the veil what it wants',done:false}],arch:false});questStep('power',0);
    G.notes.unshift({txt:'You reached, alone, and it came too easily. The gift costs Stability and raises Madness and thins the veil, and using it loudly makes you visible to everything that hunts by it.',day:G.day,time:fmt(G.min)});gainXP(5);},
 powerCareful(){G.player.stability=Math.max(0,G.player.stability-6);renderTop();
    G.notes.unshift({txt:'A careful read: fragments, the man going north, and a far-off thread of attention that brushed you, grief and patience together. The Far-Shore Circle fishes for the gifted, and it has felt you at the lowest volume.',day:G.day,time:fmt(G.min)});gainXP(3);},
 powerSecret(){G.notes.unshift({txt:'You read your own reach and saw the wall you built your whole life, and how thin it is, and understood why Gin made sure no one ever measured you. The technicality of being a D is the most fragile thing you own.',day:G.day,time:fmt(G.min)});gainXP(8);},
 powerCarefulLead(){questStep('power',1);
    G.notes.unshift({txt:'The careful truth: the man went north, toward water, carrying a weight that bends sight; a grief-cult has your scent at the lowest volume; and you know now that you could reach further any time, and that things wait on the other side of that door.',day:G.day,time:fmt(G.min)});gainXP(7);},
 powerDeep(){G.player.stability=Math.max(0,G.player.stability-15);G.player.madness=Math.min(100,G.player.madness+22);G.player.veil=Math.min(100,(G.player.veil||0)+18);if(typeof fxVeil==='function')fxVeil('dark');renderTop();
    G.notes.unshift({txt:'You dropped the disguise and reached all the way. The veil tore and did not close. Stability gutted, Madness spiking. The whole hidden world turned to look: a CVD sensor, a Grid ward, and under both a regard with thirteen facets, one awake.',day:G.day,time:fmt(G.min)});gainXP(4);},
 powerFight(){startFight('the-offered',function(){G.flags.veilScent=true;G.flags.thirteenNoticed=true;G.notes.unshift({txt:'You refused the seat, your fist closed on Gin’s cheap brass key, and forced the tear shut around a facet of the Thirteen. It withdrew, amused, patient. It will be back.',day:G.day,time:fmt(G.min)});G.scene='power';G.node=8;renderScene();renderTop();window.scrollTo(0,0);});},
 powerDeepLead(){G.flags.veilScent=true;G.flags.thirteenNoticed=true;questStep('power',1);
    G.notes.unshift({txt:'The deepest truth: the man carries a seat of the Thirteen of the DUTY register, walking the Axis-pull north toward an empty throne, unafraid. He was not taken; he was reached, at his hardest reach, for someone he loved. And now a facet of the Thirteen has looked at you.',day:G.day,time:fmt(G.min)});gainXP(8);},
 powerPullLead(){G.flags.veilScent=true;questStep('power',1);
    G.notes.unshift({txt:'You pulled back before the offer finished, and kept most of what you saw: the Axis, the empty seat, the man walking its pull north carrying DUTY, unafraid. The veil has your full scent now, and the offer was not withdrawn, only deferred.',day:G.day,time:fmt(G.min)});gainXP(6);},
 beginLook(){meet('kaneda');['suzuran','river'].forEach(function(pid){var p=G.places.find(function(x){return x.id===pid;});if(p)p.known=true;});
    if(!G.quests.some(function(q){return q.id==='look';}))G.quests.unshift({id:'look',title:'The long walk',steps:[{t:'Walk the city and let it find you',done:false},{t:'Find where the man went, by paying attention',done:false}],arch:false});questStep('look',0);
    G.notes.unshift({txt:'You abandoned the threads and walked. It is Obon, the week the doors stand open. The city is not empty; it only looks empty to people who are not paying attention.',day:G.day,time:fmt(G.min)});gainXP(5);},
 lookPeople(){if(typeof bumpRel==='function')bumpRel('kaneda',6);
    G.notes.unshift({txt:'You and Kaneda pulled an old man’s grief back into his own hands. The Far-Shore Circle fishes the warm rooms too, not just the river: anywhere the grieving gather and feel safe. Three this month, Kaneda says. Somebody is hungry in this ward.',day:G.day,time:fmt(G.min)});gainXP(4);},
 lookSecret(){G.notes.unshift({txt:'You read the ward under Kaneda: the whole district has been thinning for weeks, a slow tide going out, and the cult feeds harder because something far bigger is pulling the water of the world toward an empty place. The small predators gorge in the shallows it leaves.',day:G.day,time:fmt(G.min)});gainXP(8);},
 lookPeopleLead(){questStep('look',1);
    G.notes.unshift({txt:'The warm-rooms truth: a cult feeding harder than it should, a ward going thin, and a man who walks nights with his shadow ahead of him, going north, toward water. The direction the not-saying points.',day:G.day,time:fmt(G.min)});gainXP(7);},
 lookFight(){startFight('ridden-mourner',function(){G.flags.cultKnows=true;G.notes.unshift({txt:'You broke the rite and freed the mourner at the water. The dead, grateful, showed you: the man crossed north carrying not a passenger but a THRONE, a seat of the Thirteen of the DUTY register, and the dead themselves turned from it. He was not afraid.',day:G.day,time:fmt(G.min)});G.scene='look';G.node=8;renderScene();renderTop();window.scrollTo(0,0);});},
 lookRiverLead(){questStep('look',1);
    G.notes.unshift({txt:'The water’s truth: a seat of the Thirteen on the move, the dead turning from it, a cult gorging in the shallows of a world being pulled toward an empty place, and your brother walking north into all of it, unafraid.',day:G.day,time:fmt(G.min)});gainXP(8);},
 reset(){resetGame();}
});
