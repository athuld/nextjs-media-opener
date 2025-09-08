export function get_mob_stream(
  encodedFilename: string,
  packageName: string,
  stream_link: string
) {
  const final_url =
    stream_link.replace("http", "intent") +
    `#Intent;type=video/any;package=${packageName};S.title=${encodedFilename};scheme=http;end;`;
  return final_url;
}
