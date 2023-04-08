import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { GetServerSidePropsContext } from "next";

export default function Home({ isMobile, data, streamLinks }: any) {
  let deviceType = isMobile ? "mobile" : "desktop";

  const handleClick = () => {
    let text = data.download_link;
    let copyBtn = document.getElementById("copy_btn");
    let copyText = document.getElementById("copy_icon_text");
    let alert = document.getElementById("alert");
    try {
      navigator.clipboard.writeText(text);
      copyText != null ? (copyText.innerText = "Copied") : null;
      copyBtn?.classList.add(styles.copy_btn);
      alert?.classList.add(styles.alert);
      setTimeout(() => {
        alert?.classList.remove(styles.alert);
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAlertRemove = () => {
    let alert = document.getElementById("alert");
    alert?.classList.remove(styles.alert);
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
        >
          Copied to clipboard
        </span>
        <div className={styles.card}>
          {Object.keys(data).length === 0 ? (
            <div className={styles.centre_card}>
              <p className={styles.title}>No Files To Stream :(</p>
              <img src="/Alone_Meme.jpg" alt="Alone" />
            </div>
          ) : (
            <>
              <p className={styles.title}>{data.filename}</p>
              <div className={styles.action_section}>
                <input
                  type="text"
                  className={styles.copy_input}
                  defaultValue={data.download_link}
                  name="copy"
                  id="copy"
                />
                <a
                  id="copy_btn"
                  className={styles.action_btn}
                  onClick={handleClick}
                >
                  <span
                    className={"material-symbols-rounded " + styles.copy_icon}
                  >
                    content_copy
                  </span>
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
                  target="_blank"
                  className={styles.action_btn}
                  href={data.download_link}
                >
                  <span className="material-symbols-rounded ">download</span>
                  {!isMobile ? (
                    <span className={styles.action_btn_text}>Download</span>
                  ) : null}
                </a>
              </div>
              <div className={styles.stream_section}>
                {streamLinks[deviceType].map((link: any, index: number) => {
                  return (
                    <a key={index} href={link.link} className={link.class}>
                      <img src={link.img} className={styles.img} alt="player" />
                      <span>{link.app}</span>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

async function getStreamLinks(data: any) {
  const stream_link: string = data.stream_link;
  let VLC_STREAM = "vlc://" + stream_link;
  let MPV_MOBILE =
    stream_link.replace("http", "intent") +
    "#Intent;type=video/any;package=is.xyz.mpv;scheme=http;end;";
  let encodedUrl = Buffer.from(stream_link).toString("base64");
  let MPV_DESKTOP = "mpv://" + encodedUrl;
  let streamLinks = {
    mobile: [
      {
        app: "Vlc Mobile",
        link: VLC_STREAM,
        img: "/VLC_Icon.png",
        class: `${styles.player} ${styles.vlc}`,
      },
      {
        app: "Mpv Mobile",
        link: MPV_MOBILE,
        img: "/MPV_Icon.png",
        class: `${styles.player} ${styles.mpv}`,
      },
    ],
    desktop: [
      {
        app: "Mpv Desktop",
        link: MPV_DESKTOP,
        img: "/MPV_Icon.png",
        class: `${styles.player} ${styles.mpv}`,
      },
      {
        app: "Vlc Desktop",
        link: VLC_STREAM,
        img: "/VLC_Icon.png",
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
  const streamLinks = await getStreamLinks(data);
  return {
    props: {
      isMobile,
      data,
      streamLinks,
    },
  };
}
