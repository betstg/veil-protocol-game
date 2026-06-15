import fs from "fs";

const path = "content/story/campaign.json";
const c = JSON.parse(fs.readFileSync(path, "utf8"));

c.roads.look = {
  title: "The Long Walk",
  status: "authored",
  acts: [
    "Open: the city decides for you",
    "Deepen: what the short ways step over",
    "Converge: arriving without a faction at your back"
  ],
  beats: [
    {
      scene: "The kitchen, 3:47 on the stove clock, and the decision to take nothing but your feet",
      prose: [
        "There are five ways out of this room and four of them ask you to spend something you can't get back — a name handed to a badge, a favour owed to the Grid, the registers behind your eyes pried open until the world goes thin around you. You stand in the cooling kitchen with the rice still warm in the cooker and you understand, with the flat certainty that arrives only at four in the morning, that you are going to refuse all four. You are going to do the slow, stupid, human thing. You are going to walk out the door with nothing in your hands and look for your brother the way a person looks for a person.",
        "It is not nobility. You want to be honest with yourself about that much while you still can be. It is fear — fear of the badge, which keeps what it touches; fear of the Gift, which keeps the one who uses it; fear most of all of becoming, in the search for Gin, the kind of thing Gin would no longer recognise as his sibling. The other roads are faster and you can feel the speed of them pulling at you like a draft under the door. But fast is how he was taken. Fast is the seam in the air at chest height where something stepped through that should not be able to step through anything. You decide, in the dark, that whatever has him moves at the speed of taking, and you will move at the speed of finding, and you will trust that the second speed reaches further in the end.",
        "So you do the small things a person does. You write a note for the family that says less than you know. You put on shoes that can take a night of pavement. You leave the rice. And at the genkan you stop with your hand on the door and feel the absence of everything the other roads would have armed you with — no procedure, no protection, no sight — and you step out into the Obon dark anyway, into a Tokyo lit for the returning dead, with nothing to find your living brother but attention and time."
      ],
      choices: [
        {
          x: "Leave now, in the dark, before you can talk yourself onto a faster road.",
          hint: "Move while the trail is warm and you'll be on the streets ahead of the dawn crowds. You also leave with no money plan, no contact, and no idea how many nights this costs — the long walk has no timetable, and Gin's lucid windows do."
        },
        {
          x: "Wait for first light and gather what a traveller needs — cash, a map, his photo.",
          hint: "An hour of preparation makes the walk survivable for days instead of one. Every hour you spend packing is an hour the thing wearing your brother spends walking him north."
        },
        {
          x: "Knock on one door first — wake someone who loved Gin and ask before the city wakes.",
          hint: "A second pair of eyes and a second memory could halve the search. It also means letting another person into a danger you chose to face alone precisely so no one else would have to."
        }
      ]
    },
    {
      scene: "The last trains gone, the night city of Obon, choosing a direction by ordinary signs",
      prose: [
        "Without the sight you have no line of cooling footprints to follow, and at first the loss of it is vertiginous — you keep reaching for a sense you've decided not to use, the way a tongue keeps finding the gap of a pulled tooth. But the city is not silent to ordinary eyes; it is only quieter, and slower, and you have to learn its plainer language fast. A man your brother's height was seen, or wasn't. A timetable on the kitchen shelf was folded back to the Kita line. A cab driver at the Sugamo rank remembers a fare who didn't speak and didn't seem to know where he was going, only north, always a little further north, as if north were a person calling him.",
        "This is the road's whole discipline and you feel it close around you like a habit: you cannot leap, so you must accumulate. Each scrap is nearly nothing — a direction, a time, the colour of a coat — and only by laying them end to end across a night of walking do they become a thread you can pull. You walk Hakusan-dori with the lanterns swinging overhead, the families home for Obon eating late, the smell of grilling and incense and rain that hasn't fallen yet, and you do the arithmetic of the ordinary: who would have been awake, who would have seen, who would tell a stranger the truth at this hour. The dead are supposedly walking these same streets tonight, come home for the festival. You find you are not afraid of them. You are afraid of being too slow for the one who isn't dead yet.",
        "By the third hour your feet have begun to hurt in the specific, instructive way that tells you this is real now, this is your body spent on this and not retrievable, and somewhere under the tiredness you notice the first quiet gift of the slow road: you are still entirely yourself. No register has opened. Nothing on the other side of anything has turned to look at you. You are just a tired person walking north through a festival, asking after a brother, and for one block the ordinariness feels less like weakness than like the only armour that was ever going to work."
      ],
      choices: [
        {
          x: "Follow the cab driver's 'north' literally — straight up the Kita line on foot.",
          hint: "The driver's instinct points the same way the timetable does; trusting it could save you a night. It also stakes everything on one half-asleep memory, and if he's wrong you've walked hours into the wrong ward."
        },
        {
          x: "Work the witnesses outward in a slow spiral instead of chasing one lead.",
          hint: "Methodical canvassing catches the contradictions a single lead would hide. It is achingly slow, and the trail cools a degree with every door, every dawn, every hour you spend being thorough."
        },
        {
          x: "Stop walking and just watch one intersection he'd have to cross.",
          hint: "Patience at a chokepoint sometimes beats motion — let the city bring him to you. Or let the whole night pass at one corner while he takes a street you never imagined, and learn nothing but the look of a lamppost at four a.m."
        }
      ]
    },
    {
      scene: "A convenience store at the edge of nowhere, the small economy of asking strangers for help",
      prose: [
        "There is a particular kind of person awake at this hour in a konbini at the edge of a residential ward — the night clerk who has seen everything and judges none of it, the salaryman drinking canned coffee to delay going home, the old woman buying flowers for a grave she'll visit at dawn. You come in under the white light smelling of rain and roads and you have to decide, fast, how much of the truth a stranger will hold for you. Too little and they shrug; too much and they back away from the kind of trouble that follows a sibling looking for a sibling at four in the morning during the festival of the dead. The slow road runs on these small transactions, and you are learning their exchange rate the hard way.",
        "The clerk is younger than you expected and he looks at the photo of Gin a long time before he says anything, and when he speaks it is not what you wanted but it is true, which on this road is the only currency that compounds. He's seen the man. Not tonight — two nights ago, and again last week, the same man, always northbound, always with the slightly wrong walk of someone being steered, and once with a second person who the clerk can't quite describe, except that being near them made the cold drinks case hum in a way he'd reported to maintenance twice. You stand in the fluorescent hum and feel the braid of it: your brother, more than once, on a route, with a passenger the ordinary eye can only register as a malfunction. The slow road has just told you something no faster road would have stopped to hear — that this isn't a kidnapping, it's a routine.",
        "You buy something you don't need, because that is how this economy works, and the clerk tells you one more thing while he makes change: there's a woman who runs a late stall three stations up who 'keeps track of the ones who wander', who the unregistered and the half-touched go to when the official world has no slot for them. He doesn't have a name for what she does. You do — or you have a guess, and the guess is the first time tonight the supernatural has reached into your human search, not as a power you wield but as a place you might walk to. You thank him properly, the way you'd want a stranger thanked for helping look for your brother, and you go back out into the dark with one more thread and the strange warmth of having been, for two minutes, simply helped."
      ],
      choices: [
        {
          x: "Go straight to the woman who 'keeps track of the ones who wander'.",
          hint: "She may have seen Gin's route with eyes that understand it — the best lead of the night. People who track the wandering are rarely free with what they know, and you have nothing to trade but a story she's heard a hundred times."
        },
        {
          x: "Press the clerk for the route's other stops before you lose him to his shift.",
          hint: "Pinning the whole pattern now means you can find Gin even if the woman won't help. It also keeps a kind young man longer in a conversation that could mark him, to whatever hums the drinks case, as someone who talked."
        },
        {
          x: "Rest an hour here, eat, let your body keep up with the road.",
          hint: "You cannot walk to Kita on an empty body and a sleepless night; the road is long and you are the vehicle. Every hour of rest is an hour the routine runs without you watching it."
        }
      ]
    },
    {
      scene: "The late stall three stations north, and the people the factions never count",
      prose: [
        "The woman's stall is the kind of place the official world draws no line around — a few stools, a kerosene heater for a night that isn't cold, a hand-lettered menu, and a clientele that the Directorate's registries and the Tower's records have simply never managed to contain. These are the unregistered and the half-touched, the animal-mediums and the once-possessed and the people who saw something once and have organised their whole quiet lives around never seeing it again. They are exactly the people the fast roads step over, because a faction's eye slides off anyone it can't file, and you understand as you sit down among them that the slow road has brought you to the one census that might actually have your brother in it.",
        "The woman does not perform mystery; she ladles soup and watches you decide whether to be honest. When you put Gin's photo on the counter she doesn't touch it, only looks, and then she looks at you — at your eyes, specifically, at the place behind them you have kept folded shut all night — and something in her face settles, as if she has just confirmed a suspicion she'd rather have been wrong about. 'You're his,' she says. 'The one who could look and won't.' It is not a question and it is not an accusation, but it lands like both, and around you the quiet clientele go a degree quieter, the way a room does when someone says the true thing out loud. She has seen Gin. She has seen, she tells you, what walks in his steps. And she has been counting how many of her people have gone north and not come back, the way you count anything you can't stop.",
        "What she gives you is not a location but a shape, and it is worse for being a shape: the northbound ones, the wanderers, the half-touched who drift up the Kita line and thin out of her count — they aren't being taken at random. They're being gathered. Someone up there has been, in her flat word, 'tidying' — collecting the loose, the unregistered, the bright-but-unguarded, the way you'd sweep filings toward a magnet. Your brother is part of the tidying and also, she thinks, doing some of it, his familiar warmth used to make the gathering gentle, a known face to lead the unknown north. 'The Healer,' she says, and the word in her mouth is not a title, it's a diagnosis. 'He doesn't take. He invites. That's why none of your factions have a file thick enough to stop it. You can't arrest an invitation.'"
      ],
      choices: [
        {
          x: "Ask her to point you at the next person scheduled to 'wander' north.",
          hint: "Following the next invitation in real time could walk you straight to the gathering point. It means using a stranger as bait on a road you swore would cost no one but you."
        },
        {
          x: "Ask instead what the gathered ones have in common — find the pattern, not the path.",
          hint: "Understanding who gets invited might tell you why Gin was, and what the Healer is building toward. Pattern is slower than pursuit, and the soup-stall's heater won't keep the trail warm while you think."
        },
        {
          x: "Show her you trust her — let the fold come loose, just once, just for her to see.",
          hint: "Opening the registers a hair would prove you're truly Gin's and might earn you everything she knows. It is the first crack in the one rule that has kept you human all night, and cracks on this road do not reseal."
        }
      ]
    },
    {
      scene: "Northbound at dawn with no one behind you, and the cost of refusing the fast lanes comes due",
      prose: [
        "Dawn finds you on a Kita-bound platform with the festival burning down to its embers, the lanterns guttering, the dead presumably gone home, and your feet a single continuous ache that has stopped being information and become just the weather of your body. This is the hour the road bills you for everything you refused. A faction would have driven you here. The Gift would have flown you. You walked, and the walking has spent a whole night and most of your strength to bring you only to the edge of the place the others would have started from, and you feel the unfairness of it the way you feel the cold rail under your hands — flatly, without anyone to appeal to. No one is behind you. No procedure protects you. If the thing wearing Gin turns and notices the tired person on the platform, there is no one you can call who will come.",
        "And it does notice — not the way the Gift would be noticed, with the seat's cold eye opening, but in the small, human, deniable way the slow road is haunted: a man across the platform who is reading you a beat too long, a station attendant whose helpfulness has one wrong edge, a sense, unprovable, that the routine you've been tracing has begun, lazily, to trace you back. This is the road's particular dread. It cannot show you a monster, so it shows you the possibility of one in every ordinary face, and leaves you no sight to confirm or dismiss it. You have made yourself into exactly one thing all night — a person asking after Gin — and you are far enough up the line now that asking has become a way of announcing yourself to whatever is doing the gathering.",
        "You could still buy speed, even here, even now. There is always a faster road available to someone desperate enough at dawn — a payphone number the soup-woman slipped you that rings a Grid fixer, a Directorate poster on the platform wall with a tip line that would put a car and a badge behind you within the hour, the simple final option of unfolding your eyes and burning the rest of the distance. The whole night has been a refusal of these, and the refusal has gotten you here intact and unnoticed and nearly out of road. The question the platform asks, while the man across the way folds and unfolds his newspaper, is whether intact and unnoticed is worth the last hour you may have before a lucid window in your brother closes for good."
      ],
      choices: [
        {
          x: "Hold the line — stay slow, stay human, ride the last stretch as just a passenger.",
          hint: "Refuse speed one final time and you arrive the way you set out: unread, unowned, yourself. You may also arrive too late, and spend the rest of your life knowing exactly which trains you let pass."
        },
        {
          x: "Make the one call — the Grid fixer, a single fast favour at the very end.",
          hint: "One ride from a fixer closes the distance before the window shuts. The Grid never does a favour that doesn't become a handle, and you'd be handing it the thing you walked all night to keep."
        },
        {
          x: "Confront the man with the newspaper — force the ordinary dread to declare itself.",
          hint: "Making the watcher show his hand ends the not-knowing that's eating you. If he's nothing, you've burned time and nerve; if he's something, you've started a fight with no faction at your back and no sight to fight with."
        }
      ]
    },
    {
      scene: "The fast lane, refused: a CVD junior offers you a car, a badge, and a name to fill in",
      prose: [
        "They come for the unaffiliated last, because the unaffiliated are the hardest to find, and the irony of it nearly makes you laugh as the unmarked car slows beside you on the Kita street and the window comes down on a young CVD officer who is trying very hard to look like help. The Directorate has been watching the gathering too — of course it has, a routine that thins the membrane is exactly the kind of thing it exists to file — and it has noticed, at the very end, the one variable its registries couldn't predict: a sibling tracking the whole pattern on foot, with no faction, no Gift signature, no file. You are, to the young officer's evident discomfort, a blank space in the records that walked itself to the centre of an active case, and the Directorate would very much like to fill the blank in.",
        "The offer is reasonable, which is what makes it dangerous. A car for the last stretch you're too tired to walk. A badge's worth of protection for the threshold you're about to cross unarmed. Resources, backup, the apparatus of a faction that genuinely wants the membrane left alone — all of it yours, in exchange for the one thing the whole night was built to withhold: your brother's name, formally given, on the Directorate's terms, which means Gin stops being a person you're looking for and becomes a person they're processing. The junior officer says the word 'cooperation' and you hear, underneath it, the soft click of a handle being fitted to your brother. Every road but this one began by handing over that handle. You have walked all night precisely to arrive without it, and here, at the last mile, exhaustion makes the case for giving it up better than any officer could.",
        "You look at the young officer and you can see he half hopes you'll refuse — that some part of him knows the difference between a sibling and an informant and would rather not be the one who erases it. The slow road has made you legible to the Directorate in the gentlest possible way, as a witness and not a weapon, and that legibility is itself a kind of door: walk through it and you finish the search with the whole machine behind you and your brother's name in its mouth. Stay on the pavement and you keep faith with the only principle that's gotten you this far, and you keep walking toward the thinning wall with nothing, still, but your own two feet and the warmth of a brother you refuse to spend."
      ],
      choices: [
        {
          x: "Refuse the badge and keep walking — no name, no handle, no faction.",
          hint: "Holding to the road's whole point means arriving at the wall as no one's instrument. It also means facing what's there with a tired body, no backup, and a young officer's car pulling away from the last help you'll be offered."
        },
        {
          x: "Take the ride but not the deal — accept the car, refuse to give the name.",
          hint: "Bargaining for the distance without paying in Gin's name is the cleverest play available. The Directorate does not give half-favours, and a debt left vague at dawn is a debt they get to define later."
        },
        {
          x: "Give the officer everything — the routine, the soup-woman's count, the Healer.",
          hint: "Handing the Directorate the full pattern arms the one faction that wants the membrane saved. It also turns every person who helped you tonight into a line in a file, and your brother into a case the machine now owns."
        }
      ]
    },
    {
      scene: "The last streets to the wall, the trail made entirely of small human things",
      prose: [
        "The final approach to the thinning wall is, on this road, the strangest part, because you arrive at it not by sight and not by procedure but by the sheer mass of small things you have carried up the Kita line all night. A clerk's memory of a humming cooler. A cab driver's word for the direction of a calling. A soup-woman's tally of the vanished. A timetable folded to a single stop. Laid end to end, the ordinary facts have become a line as straight and certain as anything the Gift could draw, and you walk it into a quiet northern neighbourhood where the wrongness, when you finally reach it, is not visible at all — it is felt, the way you feel a held breath in a house, the way the dawn light here seems to arrive a half-second late, as if it had to come a little further than light should have to.",
        "You understand, walking these last streets, that the slow road has given you the one thing the fast roads never could: you know how the gathering was done, because you retraced it at the speed it was done at. You know it was gentle. You know it wore a familiar face. You know the people it took were the uncounted, the ones no faction would miss, and you know your brother's warmth was the bait that made the leaving feel like being led home. None of this is sight. All of it is understanding, accumulated on foot, and it has brought you to the threshold with a map of the crime drawn entirely in human testimony — admissible nowhere, true everywhere, and yours alone.",
        "And then, in the late-arriving light, you see him. Not a residue, not a braid of pressures — Gin, your brother, standing at the place where the air comes a half-second late, ordinary as anything, waiting at a thinned wall the way a person waits at a bus stop, his familiar warmth doing the patient work of making a monstrous place look like somewhere it's safe to gather. He has not seen you yet. You have walked all night to be a person finding a person, and here at the end the road has kept its promise exactly: you have found him, with your own tired eyes, paying only in time and shoe leather and the steady refusal to become anything that would have gotten you here faster. The cost was that it took all night. The gift is that you arrive as yourself, unread, with nothing behind you and nothing owed, and a clear human sight of your brother before he turns."
      ],
      choices: [
        {
          x: "Call his name across the quiet street — reach him as a person, out loud.",
          hint: "A voice he's known his whole life might surface the real Gin faster than any power. It also announces you, plainly, to the patient thing wearing him, in the one place it has worked hardest to keep quiet."
        },
        {
          x: "Watch first — learn what he's doing here before you let yourself be seen.",
          hint: "A few minutes of observation might show you the mechanism of the gathering and how to break it. Every minute is a minute closer to whatever the half-late light is waiting for, and to losing the cover of being unnoticed."
        },
        {
          x: "Close the distance quietly and put a hand on him before he can turn.",
          hint: "Touch is the most human argument you have, and the hardest for a passenger to answer. Reaching a thinned wall and laying hands on the bait is also exactly the proximity the Healer's whole gentle routine was built to produce."
        }
      ]
    },
    {
      scene: "The threshold, reached by the long way, where being no one is the only card you hold",
      prose: [
        "You arrive at the wall the way only this road could deliver you — with nothing. No badge to flash, no favour to call in, no register flung open to read the seam entire. The other roads converge here too, each handing you a different instrument and a different price already paid; you converge here empty-handed, and for a vertiginous moment the emptiness feels like the failure the whole night was secretly building toward. The membrane has been worked thin in front of you, lovingly, by someone who calls thinning a healing, and you cannot read the plan off it the way the Gift would. You can only stand where your feet have brought you and understand it the slow way: that this is where the gathered ones were gathered, that the vacant Thirteenth Seat is the magnet the soup-woman's filings were swept toward, that your brother's warmth has been the kindness that made a culling feel like a homecoming.",
        "But the road has been building you a different weapon all night, and you feel it now as the last thing it gives you: you are, to the thing on the other side of the wall, illegible. The Gift would have made you the brightest object in northern Tokyo, a flare fired at the opening eye. The factions would have made you a known quantity, a file the Healer could have read in advance. You are neither. You are a tired person who walked here on testimony and stubbornness, carrying no signature anything can lock onto, and at the threshold of a place built to collect the bright and the registered, being no one at all turns out to be the one approach the trap was never designed to catch. The seat's cold attention sweeps the wall and finds nothing to fix on, because you brought nothing for it to fix on, and in that blind spot you are still, impossibly, free to move.",
        "And then his familiar warmth finds you — not flung across a seam by the Gift, but simply Gin, close enough now to feel you the human way, and for one window the size of a held breath the passenger is asleep or distracted or outvoted and it is only your brother, lucid and horrified to see you here. He does not tell you you're too bright; on this road there is no brightness to warn against. He tells you the other thing, the worse and truer thing, in the only language the wall leaves him: that he can't stop walking north, that the kindness in him is being used as bait, that he had hoped no one would ever come the long way and find him doing it. You have found him as yourself, unread, unowned, with nothing behind you and nothing owed — and the only question the wall leaves is what a person with no instrument but their own two hands and their own real face does, now, at the thinned edge of the place their brother is being used to fill."
      ],
      choices: [
        {
          x: "Answer him as his sibling — no plan, no power, just the truth between you.",
          hint: "The one thing the Healer's gentle routine can't counterfeit is the real history between you and Gin. Spent here, at the wall, it might wake the man inside the bait — or it might be the last lucid window you ever get, used up on a conversation instead of a rescue."
        },
        {
          x: "Stay illegible and try to walk him out the way you walked in — quietly, as nobody.",
          hint: "Leading Gin back down the line as two unremarkable people might slip you both past the seat's blind attention. The thing wearing him does not have to stay asleep, and the long road home is long, and you have no faction to catch you if it wakes."
        },
        {
          x: "Refuse to take a side at the wall — hold the threshold, change nothing, just stay with him.",
          hint: "Refusing to act, here, keeps every ending still possible and keeps you human to the last. It also leaves the membrane thinning, the seat waiting, and your brother walking north — and someday the not-choosing becomes a choice the city made for you."
        }
      ]
    }
  ]
};

fs.writeFileSync(path, JSON.stringify(c, null, 2) + "\n");
console.log("look road authored, beats:", c.roads.look.beats.length);
