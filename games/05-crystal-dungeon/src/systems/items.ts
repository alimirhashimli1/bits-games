/** The items Wren can hold in her hand and use, in the order the inventory lists them. */
export const ITEM_KINDS = ['moonrang', 'bombs', 'lantern'] as const;

export type ItemKind = (typeof ITEM_KINDS)[number];
