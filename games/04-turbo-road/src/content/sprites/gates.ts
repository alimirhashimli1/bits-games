/**
 * The gates across the road, in sprite pixels (drawn at the scenery's scale): two striped
 * posts beyond the rumble strips, and a banner high enough for the Comet to pass under.
 */
export const GATE = {
  /** 64 pixels is 3,200 world units: the posts stand just outside the rumble strips. */
  width: 64,
  /** 40 pixels is 2,000 units: the banner's lower edge is well above the camera. */
  height: 40,
  postWidth: 4,
  /** Posts are striped in this many pixels of each colour. */
  stripeHeight: 4,
  bannerHeight: 12,
  /** A finish banner's chequered border is made of squares this size. */
  chequerSize: 2,
} as const;

/** How one gate looks: its words and colours. */
export interface GateStyle {
  readonly text: string;
  /** A chequered border round the banner, for a finish line. */
  readonly chequered: boolean;
  readonly colors: {
    readonly postLight: string;
    readonly postDark: string;
    readonly banner: string;
    readonly bannerEdge: string;
    readonly text: string;
  };
}

export const CHECKPOINT_GATE: GateStyle = {
  text: 'CHECKPOINT',
  chequered: false,
  colors: {
    postLight: '#f4f4f4',
    postDark: '#d8242c',
    banner: '#2448b8',
    bannerEdge: '#101c4a',
    text: '#ffd23f',
  },
};

/** The chequers painted across the road at a finish line. */
export const FINISH_LINE = {
  light: '#f4f4f4',
  dark: '#1b1b22',
  /** Squares across the road's full width. */
  squares: 12,
} as const;
