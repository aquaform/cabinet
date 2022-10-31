
export type NavTypes = "PAGINATION" | "TOC" | "SEARCH" | "BOOKMARKS" | "COMMANDS";

export const navTypes = {
    PAGINATION: "PAGINATION" as NavTypes,
    TOC: "TOC" as NavTypes,
    SEARCH: "SEARCH" as NavTypes,
    BOOKMARKS: "BOOKMARKS" as NavTypes,
    COMMANDS: "COMMANDS" as NavTypes,
};

export type NavPosition = "TOP" | "LEFT";

export const navPositions = {
    TOP: "TOP" as NavPosition,
    LEFT: "LEFT" as NavPosition,
};
