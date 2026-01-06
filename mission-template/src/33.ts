const songs = [
  {
    title: "Song List",
    tracks: [
      { id: 1, name: "Song A", duration: 210 },
      { id: 2, name: "Song B", duration: 180 },
      { id: 3, name: "Song C", duration: 240 },
    ],
    singer: "John Doe",
  },
];

interface Track {
  id: number;
  name: string;
  duration: number;
}

interface Song {
  title: string;
  tracks: Track[];
  singer: string;
}

// const consolelogSongs = (param: string) => {
//   console.log(songs[param]);
// };

const consolelogSongs = (key: keyof Song[]) => {
  console.log(songs[key]);
};
const consolelogSongs2 = (param: "title" | "tracks" | "singer") => {
  console.log(songs[0][param]);
};

///

function pluck<T>(records: T[], key: keyof T) {
  return records.map((r) => r[key]);
}

const songs2 = pluck<Song>(songs, "title");

export type ExcelColumn = Record<string, unknown>;

const SUPPORTED_COLUMNS = ["title", "age", "name", "referral"] as const;
type SupportedColumn = (typeof SUPPORTED_COLUMNS)[number];

function render(row: ExcelColumn, key: SupportedColumn) {
  if (!SUPPORTED_COLUMNS.includes(key)) {
    throw new Error("Unsupported column");
  }

  return row[key] || "";
}

render({ title: "hello", age: 30 }, "referral");
