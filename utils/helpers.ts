import RecentSearchData  from "../types/IRecentSeachData";
import MPVExIcon from "../public/mpvExtended.png";

export function get_mob_stream(
  encodedFilename: string,
  packageName: string,
  stream_link: string,
) {
  const final_url =
    stream_link.replace("http", "intent") +
    `#Intent;type=video/any;package=${packageName};S.title=${encodedFilename};scheme=http;end;`;
  return final_url;
}

export const getMpvData = (data: RecentSearchData) => {
  let encodedFileName = encodeURIComponent(data.filename);
  let MPVEx_PLAYER = get_mob_stream(
    encodedFileName,
    "app.marlboroadvance.mpvex",
    data.download_link,
  );
  let mpvData = {
    app: "mpvEx Player",
    link: MPVEx_PLAYER,
    img: MPVExIcon,
  };
  return mpvData;
};
