import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import { get_mob_stream } from "../../utils/helpers";
import MPVKTIcon from "../../public/MPVKT_Icon.svg";
import styles from "../../styles/Recents.module.css";
import React, { useState } from "react";

interface RecentSearchData {
  hash: string;
  filename: string;
  stream_link: string;
  download_link: string;
  has_thumb: number;
  thumb_url: string;
  created_at: string;
  updated_at: string;
  search_frequency: number;
}

export default function Recents({
  isMobile,
  data,
}: {
  isMobile: boolean;
  data: RecentSearchData[];
}) {

  const [searchData, setSearchData] = useState(data)

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let sortedData = [...searchData];
    if (value === "latest") {
      sortedData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setSearchData(sortedData);
    } else if (value === "oldest") {
      sortedData.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
      setSearchData(sortedData);
    } else if (value === "searched") {
      sortedData.sort((a, b) => b.search_frequency - a.search_frequency);
      setSearchData(sortedData);
    }
  }

  const getMpvData = (data: RecentSearchData) => {
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
  return (
    <>
      <Head>
        <title>Recent Searches</title>
        <meta name="description" content="Open media links" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {searchData && searchData.length !== 0 ? (
        <section>
          <h1 className={styles.main_title}>Recent Searches</h1>
          <select onChange={handleSelectChange} name="sort" className={styles.sort_select}>
            <option value="latest">Updated Latest</option>
            <option value="oldest">Updated Oldest</option>
            <option value="searched">Most Searched</option>
          </select>
        </section>
      ) : null}
      <div className={styles.main_container}>
        {searchData && searchData.length > 0 ? (
          searchData.map((item) => (
            <div key={item.hash} className={styles.item_card}>
              <Image
                height={100}
                width={100}
                placeholder="blur"
                blurDataURL={`${process.env.BLUR_URL}`}
                src={item.thumb_url}
                alt="Image"
              />
              <a href={"/?id=" + item.hash}>
                <h5>{item.filename}</h5>
              </a>
              <div className={styles.meta_container}>
                <span>
                  Updated:{" "}
                  {new Date(item.updated_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>Searched: {item.search_frequency}</span>
              </div>
              <a href={getMpvData(item).link} className={styles.player_link}>
                <Image src={getMpvData(item).img} alt="player" />
                <span>{getMpvData(item).app}</span>
              </a>
            </div>
          ))
        ) : (
          <h1>No Recent Searches</h1>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const userAgent = context.req.headers["user-agent"];
  const isMobile = Boolean(
    userAgent?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
    ),
  );
  const uuid = context.query.uuid;
  if (uuid === undefined || uuid !== process.env.UUID_SECRET) {
    return {
      props: {
        isMobile,
        data: [],
      },
    };
  }

  const res = await fetch(
    `${process.env.API_URL}/recent/search?ref_secret=${process.env.REF_SECRET}`,
  );
  const data: RecentSearchData[] = await res.json();
  if (
    res.status !== 200 ||
    (res.status === 200 && Object.keys(data).length === 0)
  ) {
    return {
      props: {
        isMobile,
        data: [],
      },
    };
  }

  data.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
  return {
    props: {
      isMobile,
      data,
    },
  };
}
