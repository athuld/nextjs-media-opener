import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import AloneImg from "../public/Alone_Meme.jpg";
import VLCImg from "../public/VLC_Icon.png";
import MPVImg from "../public/MPV_Icon.png";
import MXImg from "../public/MX_Icon.png";
import CopyIcon from "../public/copy.svg";
import DownloadIcon from "../public/download.svg";
import PreviousIcon from "../public/previous.svg";
import NextIcon from "../public/next.svg";
import React, { useState } from "react";

export default function Home({ isMobile, data, streamLinks }: any) {
  let deviceType = isMobile ? "mobile" : "desktop";
  const [stData, setStData] = useState(data);
  const [stLinks, setStLinks] = useState(streamLinks);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  const showNotification = (message: string, btnClass: string) => {
    let alert = document.getElementById("alert");
    let copyBtn = document.getElementById("copy_btn");
    let copyText = document.getElementById("copy_icon_text");
    handleAlertRemove();
    if (btnClass == styles.copy_alert) {
      copyText != null ? (copyText.innerText = "Copied") : null;
      copyBtn?.classList.add(styles.copy_btn);
    }
    alert != null ? (alert.innerText = message) : null;
    alert?.classList.add(btnClass);
    alert?.classList.add(styles.alert);
    const tId = setTimeout(() => {
      if (alert?.classList.contains(styles.alert)) {
        handleAlertRemove();
      }
    }, 3000);
    setTimeoutId(tId);
  };

  const handleCopyClick = () => {
    let text = data.cloudflare_link;
    try {
      navigator.clipboard.writeText(text);
      showNotification("Link copied to clipboard!", styles.copy_alert);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAlertRemove = () => {
    let alert = document.getElementById("alert");
    let copyBtn = document.getElementById("copy_btn");
    let copyText = document.getElementById("copy_icon_text");
    copyText != null ? (copyText.innerText = "Copy") : null;
    copyBtn?.classList.remove(styles.copy_btn);
    alert?.classList.remove(styles.alert);
    alert?.classList.remove(styles.error_alert);
  };

  const getActionApiData = async (action: string) => {
    const ipAddress = new URL(stData.stream_link).hostname;
    try {
      const res = await fetch(
        `/api/action/?hash=${stData.hash}&ip_address=${ipAddress}&action=${action}`
      );
      clearTimeout(timeoutId);
      const resData = await res.json();
      if (Object.keys(resData).length != 0) {
        setStData(resData);
        handleAlertRemove();
        setStLinks(await getStreamLinks(resData));
      } else {
        showNotification(
          `Sorry there is no more ${action} link!`,
          styles.error_alert
        );
      }
    } catch (err) {
      console.log("Error fetching data" + err);
    }
  };

  const handleNextAction = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    await getActionApiData("next");
  };

  const handlePreviousAction = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    await getActionApiData("previous");
  };

  return (
    <>
      <Head>
        <title>Media Opener</title>
        <meta name="description" content="Open media links" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <span
          id="alert"
          onClick={handleAlertRemove}
          style={{ display: "none" }}
        ></span>
        <div className={styles.card}>
          {Object.keys(stData).length === 0 ? (
            <div className={styles.centre_card}>
              <p className={styles.title}>No Files To Stream :(</p>
              <Image src={AloneImg} alt="Alone" />
            </div>
          ) : (
            <>
              <p className={styles.title}>{stData.filename}</p>
              <div className={styles.action_section}>
                <input
                  type="text"
                  className={styles.copy_input}
                  defaultValue={stData.cloudflare_link}
                  name="copy"
                  id="copy"
                />
                <a
                  id="copy_btn"
                  className={styles.action_btn}
                  onClick={handleCopyClick}
                >
                  <Image src={CopyIcon} className={styles.svg_btn} alt="Copy" />
                  {!isMobile ? (
                    <span
                      id="copy_icon_text"
                      className={styles.action_btn_text}
                    >
                      Copy
                    </span>
                  ) : null}
                </a>
                <a
                  className={styles.action_btn}
                  target="_blank"
                  href={stData.download_link}
                  download={stData.filename}
                >
                  <Image
                    src={DownloadIcon}
                    className={styles.svg_btn}
                    alt="Download"
                  />
                  {!isMobile ? (
                    <span className={styles.action_btn_text}>Download</span>
                  ) : null}
                </a>
              </div>
              <div className={styles.stream_section}>
                {stLinks[deviceType]?.map((link: any, index: number) => {
                  return (
                    <a key={index} href={link.link} className={link.class}>
                      <Image
                        src={link.img}
                        className={styles.img}
                        alt="player"
                      />
                      <span>{link.app}</span>
                    </a>
                  );
                })}
              </div>
              <div className={styles.interactive_section}>
                <a
                  onClick={handlePreviousAction}
                  href=""
                  className={`${styles.action_btn} ${styles.interactive_btn}`}
                  target="_blank"
                >
                  <Image
                    className={styles.arrow_btn}
                    src={PreviousIcon}
                    alt="Previous"
                  />
                  {!isMobile ? (
                    <span className={styles.action_btn_text}>Previous</span>
                  ) : null}
                </a>
                <a
                  href=""
                  onClick={handleNextAction}
                  className={`${styles.action_btn} ${styles.interactive_btn}`}
                  target="_blank"
                >
                  {!isMobile ? (
                    <span className={styles.action_btn_text}>Next</span>
                  ) : null}
                  <Image
                    className={styles.arrow_btn}
                    src={NextIcon}
                    alt="Next"
                  />
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function get_mob_stream(
  encodedFilename: string,
  packageName: string,
  stream_link: string
) {
  const final_url =
    stream_link.replace("http", "intent") +
    `#Intent;type=video/any;package=${packageName};S.title=${encodedFilename};scheme=http;end;`;
  return final_url;
}

async function getStreamLinks(data: any) {
  const stream_link: string = data.download_link;
  let VLC_DESKTOP = "vlc://" + stream_link;
  let encodedFileName = encodeURIComponent(data.filename);
  let VLC_ANDROID = get_mob_stream(encodedFileName,"org.videolan.vlc",stream_link)
  // let VLC_ANDROID = `intent:${stream_link}#Intent;package=org.videolan.vlc;S.title=${encodedFileName};end;`;
  let MPV_MOBILE = get_mob_stream(encodedFileName,"is.xyz.mpv",stream_link)
  // let MPV_MOBILE =
  //   stream_link.replace("http", "intent") +
  //   `#Intent;type=video/any;package=is.xyz.mpv;S.title=${encodedFileName};scheme=http;end;`;
  let MX_PLAYER = get_mob_stream(encodedFileName,"com.mxtech.videoplayer.ad",stream_link)
  // let MX_PLAYER = `intent:${stream_link}#Intent;type=video/any;package=com.mxtech.videoplayer.ad;S.title=${encodedFileName};scheme=http;end;`;
  let encodedUrl = Buffer.from(stream_link).toString("base64");
  let MPV_DESKTOP = "mpv://" + encodedUrl;
  let streamLinks = {
    mobile: [
      {
        app: "Vlc Mobile",
        link: VLC_ANDROID,
        img: VLCImg,
        class: `${styles.player} ${styles.vlc}`,
      },
      {
        app: "Mpv Mobile",
        link: MPV_MOBILE,
        img: MPVImg,
        class: `${styles.player} ${styles.mpv}`,
      },
      {
        app: "MX Player",
        link: MX_PLAYER,
        img: MXImg,
        class: `${styles.player} ${styles.mx}`,
      },
    ],
    desktop: [
      {
        app: "Mpv Desktop",
        link: MPV_DESKTOP,
        img: MPVImg,
        class: `${styles.player} ${styles.mpv}`,
      },
      {
        app: "Vlc Desktop",
        link: VLC_DESKTOP,
        img: VLCImg,
        class: `${styles.player} ${styles.vlc}`,
      },
    ],
  };
  return streamLinks;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userAgent = context.req.headers["user-agent"];
  const isMobile = Boolean(
    userAgent?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );

  const id = context.query.id;
  if (id === undefined) {
    return {
      props: {
        isMobile,
        data: {},
      },
    };
  }

  const res = await fetch(`${process.env.API_URL}/file?hash=${id}`);
  const data = await res.json();
  if (Object.keys(data).length === 0) {
    return {
      props: {
        isMobile,
        data: {},
      },
    };
  }
  data["cloudflare_link"] = `${process.env.CLOUDFLARE_LINK}/${id}`;
  const streamLinks = await getStreamLinks(data);
  return {
    props: {
      isMobile,
      data,
      streamLinks,
    },
  };
}
