import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import AloneImg from "../public/Alone_Meme.jpg";
import VLCImg from "../public/VLC_Icon.png";
import MPVImg from "../public/MPV_Icon.png";
import MPVKTIcon from "../public/MPVKT_Icon.svg";
import MXImg from "../public/MX_Icon.png";
import NextImg from "../public/NEXT_Icon.png";
import CopyIcon from "../public/copy.svg";
import DownloadIcon from "../public/download.svg";
import PreviousIcon from "../public/previous.svg";
import NextIcon from "../public/next.svg";
import React, { useState } from "react";
import { useRouter } from 'next/router'


export default function Home({ isMobile, data, streamLinks,cfLink }: any) {
  let deviceType = isMobile ? "mobile" : "desktop";
  const [stData, setStData] = useState(data);
  const [dlLink, setDlLink] = useState(cfLink)
  const [stLinks, setStLinks] = useState(streamLinks);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const router = useRouter()
  const cf_link = process.env.CLOUDFLARE_LINK || "https://stream.athuld.workers.dev";

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
    let text = getDownloadURL();
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
        setDlLink(`${process.env.CLOUDFLARE_LINK||'https://stream.athuld.workers.dev'}/${resData.hash}`)
        router.push(`/?id=${resData.hash}`,undefined,{shallow:true})
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

  const getDownloadURL = () => {
    // return `/${stData.hash}`
    return dlLink
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
            <div className={styles.content_main}>
              {stData.has_thumb === 1 && stData.thumb_url != "" ? (
                <div className={styles.img_main}>
                  <Image
                    width={100}
                    height={100}
                    sizes="100vw"
                    placeholder="blur"
                    blurDataURL={`${process.env.BLUR_URL}`}
                    src={stData.thumb_url}
                    alt="Main Image"
                  />
                  <p className={styles.title}>{stData.filename}</p>
                </div>
              ) : null}
              <div className={styles.content_details}>
                {stData.has_thumb != 1 ? (
                  <p className={styles.title}>{stData.filename}</p>
                ) : null}
                <div className={styles.action_section}>
                  <input
                    type="text"
                    className={styles.copy_input}
                    defaultValue={getDownloadURL()}
                    name="copy"
                    id="copy"
                  />
                  <a
                    id="copy_btn"
                    className={styles.action_btn}
                    onClick={handleCopyClick}
                  >
                    <Image
                      src={CopyIcon}
                      className={styles.svg_btn}
                      alt="Copy"
                    />
                  </a>
                  <a
                    className={styles.action_btn}
                    target="_blank"
                    href={getDownloadURL()}
                    download={stData.filename}
                  >
                    <Image
                      src={DownloadIcon}
                      className={styles.svg_btn}
                      alt="Download"
                    />
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
              </div>
            </div>
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
  let VLC_ANDROID = get_mob_stream(
    encodedFileName,
    "org.videolan.vlc",
    stream_link
  );
  let MPV_MOBILE = get_mob_stream(encodedFileName, "is.xyz.mpv", stream_link);
  let MPVKT_PLAYER = get_mob_stream(encodedFileName, "live.mehiz.mpvkt", stream_link);
  let MX_PLAYER = get_mob_stream(
    encodedFileName,
    "com.mxtech.videoplayer.ad",
    stream_link
  );
  let NEXT_PLAYER = get_mob_stream(
    encodedFileName,
    "dev.anilbeesetti.nextplayer",
    stream_link
  );
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
        app: "mpvKt Player",
        link: MPVKT_PLAYER,
        img: MPVKTIcon,
        class: `${styles.player} ${styles.mpv}`,
      },
      {
        app: "MX Player",
        link: MX_PLAYER,
        img: MXImg,
        class: `${styles.player} ${styles.mx}`,
      },
      {
        app: "Next Player",
        link: NEXT_PLAYER,
        img: NextImg,
        class: `${styles.player} ${styles.next}`,
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

  const res = await fetch(`${process.env.API_URL}/file?hash=${id}&ref_secret=${process.env.REF_SECRET}`);
  const data = await res.json();
  if (Object.keys(data).length === 0) {
    return {
      props: {
        isMobile,
        data: {},
      },
    };
  }
  const streamLinks = await getStreamLinks(data);
  let cfLink = `${process.env.CLOUDFLARE_LINK}/${data.hash}`
  return {
    props: {
      isMobile,
      data,
      streamLinks,
      cfLink
    },
  };
}
