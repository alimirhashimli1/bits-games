import type { ItemKind } from '../systems/items';
import type { PersonLook } from './sprites/people';

/** Something a person hands Wren the first time she talks to them. */
export interface Gift {
  readonly item: ItemKind;
  /** What they say once she has it. */
  readonly after: readonly string[];
}

export interface Person {
  /** Shown above what they say. */
  readonly name: string;
  readonly look: PersonLook;
  /** One paragraph per page of the dialogue box. */
  readonly talk: readonly string[];
  readonly gift?: Gift;
}

/** Everyone Wren can talk to. Rooms place them by id. */
export const PEOPLE = {
  gran: {
    name: 'Gran Maudie',
    look: 'gran',
    talk: [
      'Wren! So you saw where the shards fell. I always knew that old sword of mine would wake up one day.',
      'One fell in the forest, north-west of here, near the old cellar under the roots. Mind the Blubs: they bite harder than they look.',
      'The other sank in the lake to the south-west. And come home for supper now and then.',
    ],
  },
  pim: {
    name: 'Pim',
    look: 'pim',
    talk: [
      "Welcome to Pim's! Walk up to anything on the counter and I will tell you what it costs.",
      'Gems only, mind. The monsters seem to carry plenty of them these days.',
    ],
  },
  tolly: {
    name: 'Tolly',
    look: 'tolly',
    talk: [
      'The lake has gone quiet since the Spire cracked. Not a single fish biting.',
      'My grandad hid his savings by the stump at the end of the reeds. Give it a whack with that sword, if you like: he would want them spent.',
    ],
  },
  bree: {
    name: 'Bree',
    look: 'bree',
    talk: [
      'Are you going on an adventure? Can I come? ... No? Then bring me back something shiny!',
      'Did you know some cliffs have cracks in them? Gran says caves hide behind, if you had something to blow them open.',
    ],
  },
  hermit: {
    name: 'Old Fennick',
    look: 'hermit',
    talk: [
      'Hm? A visitor, all the way up here? You have the look of your grandmother about you.',
      'The Spire has dark halls, girl, and darker things in them. Take my lantern. My eyes are too old for adventures.',
    ],
    gift: {
      item: 'lantern',
      after: ['Keep that lantern lit. In the Spire, what you cannot see will bite you.'],
    },
  },
} as const satisfies Record<string, Person>;

export type PersonId = keyof typeof PEOPLE;

/** Who stands behind the shop's counter, and answers when Wren asks about a ware. */
export const SHOPKEEPER: PersonId = 'pim';
