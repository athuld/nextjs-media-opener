import RecentSearchData  from "../types/IRecentSeachData";
import MPVKTIcon from "../public/MPVKT_Icon.svg";

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
  let MPVKT_PLAYER = get_mob_stream(
    encodedFileName,
    "live.mehiz.mpvkt",
    data.download_link,
  );
  let mpvData = {
    app: "mpvKt Player",
    link: MPVKT_PLAYER,
    img: MPVKTIcon,
  };
  return mpvData;
};
