/* Batch 1: fully author two side missions and three romances.
 * Flips matching queued items to authored, in place. Run: node tools/batch1.mjs */
import fs from "fs";
const P = new URL("../content/story/campaign.json", import.meta.url).pathname;
const j = JSON.parse(fs.readFileSync(P, "utf8"));

/* ===================== SIDE MISSION: Kaneda's Last Bottle ===================== */
const kaneda = {
  title: "Kaneda's Last Bottle",
  giver: "Kaneda Tōru (the honest table)",
  status: "authored",
  hook: "A bar owner's final bottle of his late wife's plum wine keeps refilling itself a finger overnight. Grief, an anchored spirit, and a man who would rather be haunted than healed.",
  beats: [
    {
      scene: "The honest table, an hour before open",
      prose: [
        "Kaneda's place is six stools and a counter the colour of long use, down a Jūjō side-street where the vending machines hum the only light. He lets you in before open because Gin's name still works like a key in this part of the city, and he sets a cup of barley tea in front of you without asking, the way a man does when he has decided to talk and needs his hands busy first. You read the room before he says anything — you cannot help it, the way you cannot help hearing your own pulse — and the room reads back grief, but the clean kind, the kind that has been folded and put away and taken out only on the right nights. It is not the room that is wrong. It is the bottle behind him, on the high shelf, where the light does not reach and something nonetheless keeps a small, patient account.",
        "He pours you nothing, because the bottle is not for pouring. <em>Sachiko made it,</em> he says, and the name comes out worn smooth. Plum wine, the last batch she put up the summer before the stroke, eleven jars that became ten that became one, drunk down over six years of anniversaries to the width of two fingers in the bottom of the glass. <em>Two fingers,</em> he says again, and looks at it, and you watch him not reach for it. <em>I measured it. I marked the glass. I am not a superstitious man, Uedera-kun. I marked the glass with a grease pencil and I went to bed and in the morning there were three fingers, and I have not slept right since.</em>"
      ],
      choices: [
        {
          x: "Read the bottle directly — throw your sight at it.",
          hint: "The fast knowledge. Objects hold contact-history; this one held her hands for a whole summer. Reading it will tell you what is anchored here — and announce, to anything listening on the other side, that a strong unmanaged aperture just opened in the room."
        },
        {
          x: "Ask him what he wants to happen.",
          hint: "The slow, decent question, and the one that complicates everything. A man who marks a glass and keeps it is not always a man who wants the measuring to stop."
        }
      ]
    },
    {
      scene: "What the glass remembers",
      prose: [
        "Whichever way you come to it, the bottle resolves under your attention like a held breath. There is no demon here and no suffering-being weight, none of the deposited dread that makes a Nerima stairwell unbearable; there is a <em>person</em>, thin and intact and gentle, anchored not to the bar and not to Kaneda but to the wine itself — to the one object in the world that still holds the work of her hands. Register I, grief, the most common and the most misread: a spirit that does not haunt so much as <em>wait</em>, deepening the sorrow already in a place without ever intending harm, the way a low note under a song makes the whole song heavier. She is topping the bottle up. You feel it the moment you understand it, and the understanding is unbearably tender: she is not draining anything, not feeding, not asking. She is filling the glass back toward full because for forty years that is what she did when his cup got low, and death changed the medium and not the habit.",
        "It is the kindest haunting you have ever read and it is killing him by inches, which is the part the official framework gets wrong about grief-register spirits and the part you understand in your own chest before you can put it in words. Every morning he wakes to proof that she is still tending him. Every morning he cannot drink the proof, because to drink it would be to lower the level she keeps raising, and so the one bottle that should have run out and let him grieve cleanly will now, gently, lovingly, never empty, and he will stand behind that counter being cared for by his dead wife until it hollows him out completely. The cruelty is that nothing here is cruel."
      ],
      choices: [
        {
          x: "Tell Kaneda exactly what you read — all of it.",
          hint: "The truth he is owed and may not survive whole. To name her is to make her real to him in a way the grease-pencil mark let him keep at arm's length."
        },
        {
          x: "Tell him only that it is harmless, and buy yourself time to think.",
          hint: "A mercy and a small lie of omission. You would be deciding, for a grown man, how much of his own haunting he gets to know — the exact thing the bureaus do, that you have always hated them for."
        },
        {
          x: "Say nothing yet; find out if she can be spoken to.",
          hint: "Spirits with intact selves can sometimes be reached. But reaching her means opening further, here, in a thin district during Obon — and a grief-anchor that learns it has been noticed does not always stay gentle."
        }
      ]
    },
    {
      scene: "The thing he will not say he wants",
      prose: [
        "You get it out of him eventually, the way you get the true thing out of anyone, by being quiet longer than is comfortable. He does not want her gone. Of course he does not. He has spent six years drinking a bottle down so that the drinking would be a thing he did <em>with</em> her, one anniversary at a time, and the prospect of an empty bottle was never relief — it was the second funeral, the real one, the one where the last work of her hands finally passed through him and out of the world. The refilling terrifies him and he would not trade it for anything. <em>If you make it stop,</em> he says, not as a threat, just as a man laying his cards face up on his own honest table, <em>then I have to bury her again, and I am not — I don't think I am — </em> and he does not finish it, and the unfinished part is the whole job.",
        "This is the place where your two registers pull opposite ways and you feel both of them, the searching one and the suppressed one, the part of you that wants to fix and the part of you that knows fixing is sometimes just tidying away another person's love because it makes <em>you</em> uncomfortable to watch it cost them. Gin would have known what to do here. Gin always knew the difference between a haunting that harms and a haunting that merely hurts, and you are starting to understand that the difference is not in the spirit at all. It is in whether the living one has finished needing it. Kaneda has not finished. The bottle is the only place his hands and hers still meet."
      ],
      choices: [
        {
          x: "Help her finish her own habit — gently, with him in the room.",
          hint: "Not an exorcism. A leave-taking. You would be guiding a gentle spirit to set down a task she no longer needs to do, and asking a man to let his wife stop tending him — which may free them both or may be the cruelty he fears."
        },
        {
          x: "Leave the anchor exactly as it is and teach Kaneda to live beside it.",
          hint: "Cohabitation is a real, documented outcome. But a grief-anchor in a thinning district during Obon is not a fixed thing; what is gentle this week can deepen, and you would be betting his slow hollowing against the membrane holding."
        },
        {
          x: "Move the anchor — decant the wine into vessels he can actually drink.",
          hint: "A trick more than a rite: split the contact-history across many small cups so the level he must lower is shared, not singular. Clever, and it may simply teach her to fill them all."
        }
      ]
    },
    {
      scene: "Obon, and the door that is open anyway",
      prose: [
        "You do not get to choose the night. It is the thirteenth of August and the lanterns are out along the river and every shrine in Kita has its gate propped for the dead who are, this week and only this week, expected. Whatever you decide to do with Sachiko's bottle, you do it inside that — inside a city that has, for three days, agreed to leave the door open, which is exactly the condition under which a gentle anchor can become something with more reach than it ever wanted. You light the small fire Kaneda's mother would have lit, in the alley, in a chipped dish, because the form matters even to people who say it does not, and Kaneda stands in his own doorway with his hands at his sides like a man at a graveside, which is what this is.",
        "If you choose to help her finish, it does not look like the bureau footage. There is no cold blast, no figure, no voice. There is a bottle that, while you hold the register steady and Kaneda finally says the thing out loud — <em>you can stop now, I've got it, I've got the bar, go on</em> — settles, at last, to two fingers, and does not rise in the morning. If you choose to leave her, the bar simply stays what it has been, a haunted, gentle, slowly emptying man behind a counter, and you carry the knowledge that you let a kindness keep costing him because it was his to spend. Either way you are the one who has to watch his face do the thing faces do when a long argument with the dead is finally, quietly, conceded."
      ],
      choices: [
        {
          x: "Stay until morning, and check the glass with him.",
          hint: "Be present for the result you caused, whatever it is. Witnessing the cost is the least the work asks of you, and the most it can promise."
        },
        {
          x: "Leave him to the morning alone.",
          hint: "Some leave-takings are not yours to attend. Walking out means trusting a grieving man with his own grief — and never knowing, for certain, which way the level went."
        }
      ]
    },
    {
      scene: "What the honest table pays back",
      prose: [
        "Kaneda is a contact, not a holder and not a node, and the thing he gives you in return is not power or a heading — it is a table you can come back to, which on the roads ahead turns out to be worth more than either. A man who has watched you handle his dead wife with your hands open and your verdict unhidden will, after this, pour you the barley tea and tell you the true thing instead of the safe one, and in a city run on managed information that is a rarer asset than a Tower favour. If you helped Sachiko set down her task, he tells you, the next time you are in, that he slept the whole night through for the first time in six years and hated you for an hour at dawn and then did not. If you left the anchor, he tells you nothing, and pours the tea anyway, and the not-telling is its own kind of trust.",
        "You also carry out a smaller, sharper thing, filed wherever you file the lessons this morning keeps handing you: that the Directorate's neat taxonomy of harm has no column for a love that injures by persisting, and that the gentlest entities in the catalogue are the ones most likely to teach you what you actually believe about letting go. Gin knew this. It is, you are increasingly sure, the exact knowledge the thing wearing him is using against him right now — a duty that injures by persisting, a tending that will not stop because stopping would mean the task is finally over. You leave Kaneda's with the taste of barley tea and the cold understanding that you have just rehearsed, on a bottle of plum wine, the argument you are walking north to have over your brother."
      ],
      choices: [
        {
          x: "Carry the lesson north, toward Gin.",
          hint: "Let the small mercy sharpen the large one. What you learned about a love that injures by persisting is the shape of the thing in Gin — and you go knowing it now, which is worse and better."
        },
        {
          x: "Mark the table as a place to return.",
          hint: "Bank the trust. An honest counter in Jūjō is a fixed point on roads designed to keep you moving — somewhere the verdict is true and the tea is hot, for after."
        }
      ]
    }
  ]
};

/* ===================== SIDE MISSION: The Bookseller's Locked Shelf ===================== */
const bookseller = {
  title: "The Bookseller's Locked Shelf",
  giver: "Sōma the bookseller, Jūjō",
  status: "authored",
  hook: "A shelf behind the counter that no key opens and no fire has ever touched. The books on it have contact-history, and one of them remembers Gin.",
  beats: [
    {
      scene: "A shop that smells of foxed paper and held breath",
      prose: [
        "Sōma's secondhand shop is the kind of narrow that makes you turn sideways between the stacks, three storeys of other people's libraries pressed into a frontage barely wider than its door. The old man has run it since before Gin was born and he does not look up when you come in; he finishes the page he is on, the way booksellers do, asserting that the book outranks the customer. When he does look up he goes very still, and you understand that he has placed you by the face — Gin's jaw, Gin's way of standing in a doorway as if apologising for the space he takes — and that the placing has cost him something. <em>You're the brother,</em> he says, and it is not a question, and behind him, on the high shelf with the small brass lock, something shifts its weight the way a sleeper does when a familiar voice enters the room.",
        "You feel the shelf before you properly see it. It is not loud. It is the opposite of loud — a pocket of held quiet in a shop already quiet, a dozen volumes that have stopped radiating the soft contact-history of handled books and started radiating something denser, more deliberate, the way a word repeated too many times stops being a word. Sōma watches you feel it. <em>Sixty years I've had this shop,</em> he says, <em>and forty of them that shelf has been locked, and I did not lock it. The key turned itself the week your brother stopped coming in.</em>"
      ],
      choices: [
        {
          x: "Ask why Gin came in — and what he came in for.",
          hint: "The human thread first. Gin had a reason to frequent a Jūjō secondhand shop, and the reason is on that shelf, and Sōma has been waiting four years for someone with the right face to ask."
        },
        {
          x: "Read the shelf before you let the old man frame it for you.",
          hint: "Trust your own sight over his telling. Objects with deep contact-history can hold more than memory; reading a locked shelf in a thin district means deciding to know what is on it before you know whether you can put it down."
        }
      ]
    },
    {
      scene: "What objects keep when no one is looking",
      prose: [
        "Sōma makes tea on a hotplate that should have been condemned a decade ago and tells you the part the bureaus would file as folklore and you now know to be field-accurate. Objects are not alive. They do not think. What they have, the old man says — and he says it the way a man says a thing he worked out alone over years and never had anyone to tell — is <em>contact-history</em>: decades of being present when things happened, of being held during specific moments, of sitting in the same room as entities that left a residue the way a fire leaves smoke in cloth. Most books carry a little. A book that was held by the same grieving hands every night for thirty years carries a lot. And a book that was in the room, open, during a crossing — during the exact moment a self came apart at the membrane — carries something that is not memory at all, but a kind of standing wound, a place where the page <em>remembers being a threshold.</em>",
        "That, he tells you, is what the shelf is. Not cursed, which is a word for people who need the comfort of a villain. <em>Accumulated.</em> He bought a dead exorcist's library forty years ago without knowing what some of the volumes had sat through, and the worst of them found their own level on the high shelf the way water finds the low place, and there they have stayed, quietly thickening, a small private membrane of their own behind the counter of a shop in Jūjō. And four years ago your brother came in, white to the lips, and asked to be left alone with the shelf, and the lock — Sōma swears this on his dead wife — turned itself when Gin put his hand flat against the wood."
      ],
      choices: [
        {
          x: "Ask which book Gin held.",
          hint: "Narrow it from a shelf to a single spine. The one Gin reached for is the one that remembers him — and a book that remembers a man can sometimes be made to give him back, in pieces, which is exactly as dangerous as it sounds."
        },
        {
          x: "Ask what the dead exorcist was, and how he died.",
          hint: "Provenance. A library is its owner's afterlife; knowing what kind of practitioner assembled these volumes tells you what kind of residue you are about to disturb during the one week the door stands open."
        }
      ]
    },
    {
      scene: "The spine that remembers your brother",
      prose: [
        "The lock does for you what it did for Gin: it turns under your hand, the small brass tongue sliding back with a click you feel in your teeth, and the shelf exhales four years of held quiet into the shop. You do not reach blindly. You let your sight walk the spines until one of them looks back — a slim casebound notebook, no title, the boards swollen with damp that was never water — and the moment your attention lands on it you are not in the shop. You are in a low place where the water remembers, and it is night, and a man with your brother's careful hands is writing by lamp-light an argument with himself about whether a debt that was never his to pay might nonetheless be the only honest thing left to do. The book held the room when Gin first found the low place. It kept the threshold. And it has been keeping it, faithfully, on the high shelf, for four years, the way Sachiko's bottle kept filling — an object continuing a function past every reason except the function itself.",
        "This is the find and the danger in one motion. The notebook is a fixed copy of a night you have been trying to reconstruct from the outside — Gin's Saturday, the address in no file, the seam where the entries stop being entries and start being arguments — and to read it is to stand where he stood, in his own dread, at the exact hour the thing wearing him made its reasonable case. It will tell you more than any node ever could. It will also open you, here, in a shop pressed against a private membrane, during the one week the dead are expected, while your unmanaged aperture floods the room with the omnidirectional noise that buried the warning the first time. The book remembers being a threshold. Held by the wrong hands on the wrong night, a threshold is a door, and a door is a thing that opens both ways."
      ],
      choices: [
        {
          x: "Read it here, now, with the shelf open and the city's door propped.",
          hint: "The most Gin you will ever get back, at the highest price. You would be standing in the recorded dread of the night he was turned, in a thinning room, broadcasting — and learning, perhaps, the one thing the nodes could not give you. It will cost your Stability and may cost more."
        },
        {
          x: "Take it out of the shop sealed, to read somewhere warded.",
          hint: "Patience over hunger. Tanizaki's wards, or the clinic's blue curtain, could let you open the book without opening the room. Slower, safer, and it means carrying a kept threshold through the Obon streets in your own bag."
        },
        {
          x: "Lock the shelf again and leave the notebook where Gin left it.",
          hint: "The hardest restraint. Gin put his hand flat on this wood and walked away from what it held; there may be a reason he chose to leave the record of his turning sealed, and honouring that means giving up the clearest window you have found."
        }
      ]
    },
    {
      scene: "What it costs to read a kept threshold",
      prose: [
        "Say you read it — most do; you came across a city for exactly this. The notebook does not narrate. It deposits. You get the low place in fragments that arrive in the wrong order, the way Itsuki's sight came back scrambled: the smell of river-mud at slack tide, the particular cold of a place where a great many crossings have happened unmourned, a voice that is not a voice making its case in the register of pure reasonableness — <em>they are owed, and no one will pay them, and you are the only one who can, and is that not the definition of a duty?</em> — and your brother's hand on the page getting tighter and truer with every line until the line between what Gin wanted and what it wanted stops being a line and becomes a rhyme. You learn the address. You learn the shape of the argument. You learn, worst of all, that he was not deceived. He was <em>persuaded</em>, by something that only ever asked him to do what was right, and the persuasion is the most frightening thing you have ever stood inside because you can feel, reading it, how nearly it would work on you.",
        "And the room answers, because you opened the book in it. Sōma's shop goes the particular degree colder that means a residue has noticed a strong unmanaged aperture and oriented toward it; the other spines on the high shelf lean their quiet weight your way; somewhere under the floorboards the building does the listening thing buildings do in this city this week. You do not get out of this clean. Either you spend Stability you cannot spare holding the room shut while you finish reading, or you stop short of the end to keep the membrane from lurching, and never learn the last line your brother wrote before the entries became arguments. Sōma stands by the hotplate with the cold tea going colder and does not interfere, because he is sixty years a bookseller and he has always understood that some books are only honestly read at a price."
      ],
      choices: [
        {
          x: "Finish it — pay the Stability, take the whole night.",
          hint: "The complete record of Gin's turning, and a dent in you that does not buff out. You walk away knowing the address and the argument entire — and a little nearer, yourself, to the omnidirectional noise that is part of the campaign's hidden clock."
        },
        {
          x: "Stop at the lurch — protect the room, lose the last page.",
          hint: "Choose the district over the data. You keep the membrane from tipping and the shelf from waking the rest of itself, and you carry out an unfinished knowledge that will gnaw at every later road."
        }
      ]
    },
    {
      scene: "The lock, and who keeps it after you",
      prose: [
        "However far you read, the shelf is your problem now in a way it was Sōma's only by accident, and the old man knows it and is, in his dry way, relieved. He has carried a private membrane behind his counter for forty years out of nothing but the bookseller's refusal to burn a book, and he is too old to carry it much longer, and you are the first person to walk in with the right face and the wrong, useful gift. You can re-lock the shelf and leave him the keeping, which means a thinning district has one more quiet wound in it that no bureau will ever survey. You can take the worst of the volumes to Tanizaki, who knows what to do with kept thresholds and will not thank you for the work. Or you can do the thing Gin did not do, and end the notebook — not read it, <em>end</em> it, let the recorded night finally cross the way the man in it never got to — which closes your clearest window forever and may be the only mercy on the shelf.",
        "Whatever you choose, Sōma gives you the one thing a bookseller has to give, which is provenance: the name of the dead exorcist whose library this was, and the fact — offered last, the way the true thing always is — that the man had a student, decades back, who came to nothing the bureaus recorded and may not have come to nothing at all. A thread for later. You leave the shop turning sideways between the stacks the way you came in, the brass lock warm now where a dozen hands have never warmed it, and the street outside doing its Obon business of small fires and propped gates, and you understand that you have added a place to the map your brother drew — a shelf in Jūjō where, if the worst ever comes, a door stands already half-open behind a sixty-year-old counter."
      ],
      choices: [
        {
          x: "Re-lock it and leave Sōma the keeping.",
          hint: "Preserve the window and the wound together. You may need the notebook again; the cost is a thinning district carrying one more sealed threshold and an old man carrying it for you."
        },
        {
          x: "Take the worst volumes to Tanizaki to be properly warded.",
          hint: "Hand the danger to the one man in Kita who can hold it. It puts you further in Tanizaki's debt and the Grid's orbit — and admits you cannot keep what you found."
        },
        {
          x: "End the notebook — let Gin's recorded night finally cross.",
          hint: "The mercy that costs you everything the book could still tell. You close your clearest window forever, on purpose, the way Gin closed the lock — and you will never be sure whether you freed something or buried the last of him you could reach."
        }
      ]
    }
  ]
};

/* replace queued side missions with authored versions */
function replaceSide(obj) {
  const i = j.sideMissions.findIndex((s) => s.title === obj.title);
  if (i >= 0) j.sideMissions[i] = obj; else j.sideMissions.push(obj);
}
replaceSide(kaneda);
replaceSide(bookseller);

/* ===================== ROMANCE: Hagiwara Mizuki ===================== */
const mizuki = {
  who: "Hagiwara Mizuki",
  status: "authored",
  ceiling: "fade to black",
  stages: [
    {
      stage: "Notice",
      caption: "the professional warmth, and the half-second it slips",
      scenes: [
        "You meet Hagiwara Mizuki in the register where everyone meets her: Public Confidence, the smile that has reassured nine hundred frightened civilians that the thing on their landing was a draught and the cold spot a plumbing fault. She is very good. She is the best you have ever watched, and you are a reader by birth and trade, and that is precisely why you notice — the warmth is real the way a stage light is real, exactly as bright as the room requires and not one lumen more, dimmed and raised by a hand you can almost see on the dial. She manages your discomfort about Gin so smoothly that you are halfway to comforted before you catch the technique, and catching it is the first interesting thing that has happened between you, because she watches you catch it, and something behind the performance goes briefly, genuinely still.",
        "It is a half-second and then the smile comes back up and she is once more the woman whose job is the gap between what the public knows and what is happening. But you have read the still place under it now, and you cannot unread it: a discipline thirty years deep, a person who has performed warmth so long and so well that meaning it has become the dangerous, expensive, almost-forgotten thing. You leave the conversation with the file you came for and the small dangerous knowledge that Hagiwara Mizuki noticed you noticing, and did not, for once, reach for the dial."
      ]
    },
    {
      stage: "Trust",
      caption: "she gives you what she thinks, not what she says",
      scenes: [
        "Trust with Mizuki is not built out of time spent; she has spent managed time with thousands. It is built out of a single substitution. There comes a night — late, the office emptied, a cover story half-written on her screen about a Kita incident you both know was no plumbing fault — when she stops giving you the public version and gives you, instead, what she actually thinks: that the cover-ups are sometimes the only thing standing between a frightened city and a panic that would get more people killed than the truth ever could, and that she has known this for thirty years and believed it for twenty-nine and has lately, for the first time, begun to lie awake doubting the maths. To say that to anyone is a breach of a discipline she has built her whole self on. To say it to Gin's brother, who reads people for a living and cannot be performed at, is to hand you the one thing she has never given the machine: the cost.",
        "You understand what it is the moment she does it, because you have your own suppressed registers and you know exactly what it takes to let one down on purpose. She is not flirting. She is doing something far more naked than flirting — she is letting a person see the price of the lies she keeps, which she has never let anyone see, because seeing it is the first step to being unable to keep them. The trust runs both ways and frightens you equally: she could end you with a sentence to the right committee, and she is choosing, instead, to be doubted out loud in front of you, which for a woman whose entire value is certainty is the closest thing to undressing she owns."
      ]
    },
    {
      stage: "Turn",
      caption: "gated: you protect her breach instead of using it",
      gate: "Rei has to bury or deflect the discrepancy Mizuki let slip — taking a real risk to his own standing to protect her one true thing — rather than trading it to Moriya or the Grid for leverage on Gin.",
      scenes: [
        "The turn is not a confession and it cannot be bought with one. It is gated on what you do with the thing she gave you, because Mizuki has spent thirty years watching people receive a confidence and calculate its market value, and she will not love anyone she has not first watched decline to spend her. The discrepancy she let slip — the doubt, the half-written cover story, the admission that the maths might be wrong — is worth a great deal to the right buyer. Moriya in Internal Affairs would trade you real movement on Gin's file for it. The Grid would take it as proof of what they already believe. You hold, in other words, the exact currency this whole morning has taught you to spend, and the turn happens only if you refuse to spend it — if you take a risk to your own standing to bury her breach, deflect the committee's attention, protect the one true thing she let exist outside the machine, and let her watch you get nothing for it.",
        "When she realises what you have done — and she will realise it, she reads institutions the way you read rooms — the dial-hand comes off the warmth entirely, for the first time since you met her, and what is left is not a performance dimmed to nothing but a woman, tired and thirty years disciplined and astonished to be protected rather than managed. <em>You could have had Gin's file moved,</em> she says, not quite believing it, and you let the silence say that you know, and she crosses the room. What passes between you after that is the thing she has performed a thousand times and meant never: warmth raised by no hand on any dial, exactly as bright as the two of you require and, for once, no one watching to dim it. The door closes on the empty office, and the cover story stays half-written on the dark screen until morning."
      ]
    },
    {
      stage: "Fade",
      caption: "one true thing, kept outside the machine",
      scenes: [
        "What you have with Mizuki afterward is not a secret the way her work is a secret; it is the opposite of her work, the one arrangement in her life that no committee manages and no cover story explains. She still performs warmth all day — the city still needs the dial, and she is still the best hand on it the Division has — but she comes back, at night, to the single room where she does not have to, and lets the performance fall off her at the door like a wet coat. You are careful with it the way you are careful with anything that took thirty years to risk. She protects you for real now, which is a more dangerous thing than her job allows, and you protect her breach the way you protected it the first time, and between the two of you there is finally one true thing kept alive outside the machine that you both, in your different ways, serve.",
        "It does not fix what she does for a living and you do not ask it to. Some nights the maths still keeps her awake, and you lie beside her in the dark and do not perform comfort, because she would catch it, and catching it would ruin the only place she has ever been able to stop reading the dial. That is the whole of it and it is enough: the woman whose gift is making frightened people believe the comfortable lie has one person she does not have to lie to, and one room where the warmth she raises is meant. The fade is that room, and the door of it, and the morning that finds the cover story still half-written because for one night neither of you needed it."
      ]
    }
  ]
};

/* ===================== ROMANCE: Katagiri Noa ===================== */
const noa = {
  who: "Katagiri Noa",
  status: "authored",
  ceiling: "fade to black",
  stages: [
    {
      stage: "Notice",
      caption: "the resemblance is the obstacle, not the draw",
      scenes: [
        "Katagiri Noa worked Gin's last months from the inside of the CVD and she knows things about your brother that are not in any file, which is the reason you seek her out and the reason it goes wrong the first three times. She looks at you and flinches — not at you, at the resemblance, the jaw and the doorway-stance and the way you hold a teacup as if apologising to it — and you watch her grief do the arithmetic that grief does, subtracting the living man in front of her from the dead-or-worse one she is mourning, and arriving, every time, at a remainder she cannot stand to sit with. You are, for the first several conversations, not a person to Noa. You are an echo with a pulse, and she is too honest to pretend otherwise and too kind to say it, so she gives you the facts you came for in a voice held very flat and gets you out of her sightline as fast as decency allows.",
        "And you notice her anyway, under the flinch, which is its own complication. You notice that the grief is clean — not the performed grief of the office but the real kind, folded and put away and taken out only when she thinks no one reads her — and that it is grief for a man she clearly loved in some register she has never named even to herself. You notice that she chose not to file something about Gin's last months, kept it back, carried it, which is the act of a person whose loyalties run deeper than her clearance. You notice, in short, a person worth knowing, standing behind a wall built of your own brother's face, and you understand that to be noticed back you will have to become, to her, someone other than the ghost."
      ]
    },
    {
      stage: "Trust",
      caption: "she lets a new thing exist without it erasing the old",
      scenes: [
        "Trust arrives the day you stop trying to be a comfort to her about Gin and let her be one to you instead — the day you sit in her grief without managing it, without offering the resemblance as a consolation prize, without doing the thing everyone does and saying <em>he'd be proud</em> in the voice that asks to be thanked. You just let it be true that you are both mourning the same man in different tenses, hers past and yours present, and that neither tense cancels the other. Something in Noa unclenches when she sees that you are not going to use her love for Gin as a door into her, that you would rather she kept it intact than spent any of it on you. She starts, cautiously, to look at you and see <em>you</em> — the tired nineteen-year-old reading every room he enters because he cannot help it, the brother who is not a replacement and has stopped, in front of her, trying to be a balm.",
        "What she gives you in return for not erasing her grief is the thing she chose not to file: the truth of Gin's last months as she watched them from the inside, the changes she logged in her own private memory and never in the system because the system would have done something administrative and irreversible with them. It is a breach of her training and a far deeper trust than the facts themselves — she is telling you that she protected your brother from his own institution, quietly, at risk to herself, out of a love she has never once named. You receive it the way she gave it, without making it about the two of you, and that restraint is what finally lets the wall down. The resemblance stops being a haunting. It becomes, at last, just a family likeness, and she can look at it without subtracting."
      ]
    },
    {
      stage: "Turn",
      caption: "gated: you choose her cleanly, not as Gin's echo",
      gate: "Rei has to act on what Noa chose not to file in a way that honours Gin without using Noa as the route to him — and, in a moment where leaning on the resemblance would get him what he wants, deliberately refuse to be the ghost she's grieving.",
      scenes: [
        "The turn is gated on a refusal, and it is the hardest refusal on this road, because the resemblance <em>works</em> and you both know it. There comes a moment — late in the chase north, when you need something only Noa can give and she is raw and the dead man's face is right there on you like a key in a lock — when leaning on the likeness would get you everything: the access, the protection, the closeness, all of it pouring toward you on a current of love that was never meant for you. The turn happens only if you decline to draw on that current. If you use what she chose not to file to honour Gin honestly, without making Noa the route to him; if, in the moment the resemblance would do all the work, you put it down on purpose and make her look at the person you actually are and choose <em>him</em>, not the ghost — knowing she might not, knowing you are trading a sure thing for a true one.",
        "When she chooses you anyway — Rei, the living one, the one whose grief is present tense and whose face is only a coincidence she has made her peace with — it is the cleanest thing either of you has done in a season of compromises. There is no substitution in it. She is not loving Gin through you and you are not being loved as a relic, and the absence of that lie is so unfamiliar to both of you that you spend a long quiet moment just located in it, two people who got here by refusing the easy version. What follows keeps that honesty: warmth that belongs to the two of you and to no third absent party, a door closing on a small apartment where, for once, the dead are allowed to stay dead and the living are allowed to want each other plainly. The grief is still hers. It is simply, finally, sitting in a different room."
      ]
    },
    {
      stage: "Fade",
      caption: "two true things, instead of one substituting the other",
      scenes: [
        "What you build with Noa is a deliberate refusal of the most natural mistake either of you could make, and the discipline of it is what makes it real. She grieves Gin and she chooses you, and these are two true things held side by side rather than one quietly standing in for the other, and the holding takes daily work neither of you resents. She will say his name in the dark sometimes and you will let it be his name, not a wound and not a comparison, and you will say it back, because you are mourning him too and the one place you are both allowed to do it out loud turns out to be here, with each other, the two people who loved him in incompatible tenses and decided not to make that a competition.",
        "If the campaign takes Gin from you both, the grief you already practised holding without substitution is the thing that lets you survive it together rather than dissolving into each other's loss. If it gives him back, damaged and present, Noa is the one who taught you that a person can be loved without being asked to replace anyone, and you find you know how to receive a brother on those terms because she showed you. Either way the fade is the same small apartment, the same allowance — that the dead may stay dead and the living may still, plainly, without apology or echo, want each other — and the quiet, hard-won knowledge that you got here the long way, by putting down the key that would have opened the lock too easily."
      ]
    }
  ]
};

/* ===================== ROMANCE: Tendo Akira ===================== */
const tendo = {
  who: "Tendo Akira",
  status: "authored",
  ceiling: "fade to black",
  stages: [
    {
      stage: "Notice",
      caption: "an anomaly knows an anomaly",
      scenes: [
        "Tendo Akira flirts with the room the way some men breathe — easily, expensively, meaning none of it — and you would have written him off as charm-shaped and hollow except that the first time he turns the charm on you, you read straight through it, and he feels you do it. There is a flicker, fast as Mizuki's dial slipping, and then he doubles down on the performance precisely because it has been seen, which is the most honest thing he has done all evening and he does not know it. He is an anomaly the way you are an anomaly — something the instruments read wrong, a person who has spent his life being plausible because being legible was never safe — and two anomalies recognising each other across a crowded Gathering is its own dangerous intimacy, a click of mutual identification neither of you asked for and neither can quite take back.",
        "You notice that the charm is armour and that it is very good armour, fitted over years, and that underneath it is an operative who has never once, in his charmed and privileged life, met a consequence his family's network could not pre-empt. You notice that he clocks your suppressed registers the way you clock his easy lie, and that the clocking unsettles him more than it unsettles you, because you came here knowing you were hiding and he has half-convinced himself the armour <em>is</em> him. He gives you his number with a line he has used a hundred times, and you take it knowing the line is nothing and the giving is the tell, and you both pretend, charmingly, that nothing has been recognised at all."
      ]
    },
    {
      stage: "Trust",
      caption: "reaching the operative under the charm",
      scenes: [
        "Trust with Tendo is a matter of refusing to be charmed past, repeatedly, until he runs out of armour and has to stand in front of you as the thing the armour was covering. It takes a while. He is genuinely delightful and the delight is a wall, and every time you get near the operative underneath he deploys another easy, glittering, frictionless charm, and every time you decline to be deflected by it something in him both panics and, helplessly, hopes. The turn in the trust comes the night he tries to charm his way out of a real fear — something about the family network, the recognition that the two of you are visible in a way that even his privilege cannot indefinitely buy off — and you simply do not let him, you stay in the conversation past the point where the charm should have ended it, and he discovers there is a person on the other side of his performance who would rather have him frightened and real than smooth and gone.",
        "When the armour finally comes off it is not graceful, because he has never done it and has no practice at being unpolished. What is under it is sharper and sadder than the surface and far better company: an operative who reads consequence coming the way you read rooms, who has spent his whole life one charming half-step ahead of every reckoning, and who is, for the first time, with someone he cannot outrun because that someone can see him doing the running. He trusts you with the fear he has never named — that the network which shielded him is also the leash, that being recognised is the one thing the charm cannot fix — and the trust is the more total for how badly he does it. You have reached the operative under the charm, and the operative, it turns out, has been very lonely behind all that ease."
      ]
    },
    {
      stage: "Turn",
      caption: "gated: a consequence his privilege can't pre-empt",
      gate: "Rei has to stand between Tendo and a reckoning the family network would normally erase — taking the consequence onto himself rather than letting Tendo charm or buy his way clear — so that, for the first time, Tendo meets something the privilege can't pre-empt and is chosen through it rather than rescued out of it.",
      scenes: [
        "The turn is gated on the one thing Tendo's life has never contained: a consequence that does not get pre-empted. It comes when the visibility you both feared arrives for real — a reckoning the family network would ordinarily make vanish before it touched him — and you put yourself between him and it, take the cost onto your own standing, and refuse to let him charm or buy or outrun his way clear of this one. Not because he cannot escape it; he could, the network is right there. But because you decline to let him, and you stay, and you make him meet the consequence as a real thing with you beside him in it rather than as one more problem money makes disappear. For a man who has never in his life been unable to slip a reckoning, being held inside one — on purpose, by someone who is paying for the privilege of holding him there — is more naked than any touch.",
        "He does not know how to be rescued by being refused rescue, and the not-knowing is where he finally stops performing. The charm has nowhere to go; the consequence will not be flirted with; and there is only you, having spent something real to stand in it with him, asking nothing and offering only presence. That is the moment he chooses you, or rather the moment he stops being able to choose anyone else — the first time in his charmed life that he has been wanted <em>through</em> a reckoning instead of out of one. What follows keeps the honesty the armour never allowed: two anomalies who have stopped being plausible at each other, a door closing on the recognition that started across a crowded room and has nowhere left to hide. He is frightened and real and, for once, not running, and you are the reason, and he lets you be."
      ]
    },
    {
      stage: "Fade",
      caption: "he stops outrunning himself",
      scenes: [
        "What you have with Tendo afterward is the slow, improbable project of a man learning to stand still. The charm does not disappear — it is genuinely part of him and you would not want it gone — but it stops being the whole drawbridge, stops slamming up the instant anything real approaches, and underneath it the operative gets to simply exist in your company without being one half-step ahead of his own life. He is startled, daily, by being known and not leaving; you watch him brace for the disappointment he has always heard coming and watch it, repeatedly, not come, and the watching is its own kind of tenderness. Two anomalies, visible to each other, plausible to no one, finally not performing.",
        "The leash is still real and the family still wants its charming, useful son, and there will be reckonings the network cannot make vanish now that the two of you are recognised together. You both know it. But he has learned, from the one consequence you would not let him slip, that being chosen through a reckoning is survivable — better than survivable — and he stops outrunning himself long enough to be wanted plainly, in a quiet room, by someone who saw through the armour on the first night and stayed anyway. The fade is that room, and the unfamiliar stillness in it, and a man who spent his whole life half a step ahead of everything finally, for an evening, exactly where he is."
      ]
    }
  ]
};

/* replace queued romances with authored versions */
function replaceRom(obj) {
  const i = j.romances.findIndex((r) => r.who === obj.who);
  if (i >= 0) j.romances[i] = obj; else j.romances.push(obj);
}
replaceRom(mizuki);
replaceRom(noa);
replaceRom(tendo);

fs.writeFileSync(P, JSON.stringify(j, null, 2) + "\n");
const authored = JSON.stringify(j).match(/"status":"authored"/g) || [];
const queued = JSON.stringify(j).match(/"status":"queued"/g) || [];
console.log("batch1 done. authored:", authored.length, "queued:", queued.length);
