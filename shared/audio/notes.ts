/** Semitones above C for each note letter. */
const SEMITONES: Readonly<Record<string, number>> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const NOTE_PATTERN = /^([A-G])(#?)(-?\d)$/;
/** A4 = 440 Hz is MIDI note 69, and every semitone is a twelfth of an octave. */
const A4_MIDI = 69;
const A4_HZ = 440;
const SEMITONES_PER_OCTAVE = 12;

/** The pitch of a note name such as `A4`, `C#3` or `F5`, in hertz. */
export function note(name: string): number {
  const match = NOTE_PATTERN.exec(name);
  const letter = match?.[1];
  const octave = match?.[3];
  if (!letter || octave === undefined) throw new Error(`"${name}" is not a note name like A4 or C#3.`);

  const semitone = SEMITONES[letter];
  if (semitone === undefined) throw new Error(`"${name}" is not a note name like A4 or C#3.`);

  const midi = (Number(octave) + 1) * SEMITONES_PER_OCTAVE + semitone + (match?.[2] ? 1 : 0);
  return A4_HZ * 2 ** ((midi - A4_MIDI) / SEMITONES_PER_OCTAVE);
}
