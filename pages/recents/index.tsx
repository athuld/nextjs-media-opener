import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import styles from "../../styles/Recents.module.css";
import React, { useState } from "react";
import RecentSearchData from "../../types/IRecentSeachData";
import RecentCard from "../../components/RecentCard";

export default function Recents({
  isMobile,
  data,
  uuid,
}: {
  isMobile: boolean;
  data: RecentSearchData[];
  uuid?: string;
}) {

  const SORT_OPTIONS = {LATEST: "latest", OLDEST: "oldest", SEARCHED: "searched"}

  const [searchData, setSearchData] = useState(data)
  const [sortOption, setSortOption] = useState("latest");

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === SORT_OPTIONS.LATEST && sortOption === SORT_OPTIONS.LATEST) return;
    if (value === SORT_OPTIONS.OLDEST && sortOption === SORT_OPTIONS.OLDEST) return;
    if (value === SORT_OPTIONS.SEARCHED && sortOption === SORT_OPTIONS.SEARCHED) return;

    setSortOption(value);
    const res = await fetch(
      `/api/pagination?uuid=${uuid}&page=1&sort=${value}`,
    );

    const newData: RecentSearchData[] = await res.json();
    if (res.status !== 200 || newData.length === 0) return;
    setSearchData(newData);
  }

  const handleLoadClick = async () => {
    const button = document.getElementById("load-more-btn") as HTMLButtonElement;
    button.disabled = true;
    button.innerText = "Fetching...";
    const currentLength = searchData.length;
    const res = await fetch(
      `/api/pagination?uuid=${uuid}&page=${Math.floor(currentLength / 10) + 1}&sort=${sortOption}`,
    );
    const newData: RecentSearchData[] = await res.json();
    if (res.status === 200 && newData.length > 0) {
      setSearchData([...searchData, ...newData]);
      button.disabled = false;
      button.innerText = "Load more";
    }else{
        button.disabled = true;
        button.innerText = "No more data";
    }
  }

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
        <>
        {searchData.map((item) => (
              <RecentCard key={item.hash} {...item} />
          ))}
          <button onClick={()=>handleLoadClick()} id="load-more-btn" className={styles.load_more_btn}>Load more</button>
        </>
        ): (
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
        uuid
      },
    };
  }

  const res = await fetch(
    `${process.env.API_URL}/recent/search?ref_secret=${process.env.REF_SECRET}&page=1`,
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
        uuid
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
      uuid
    },
  };
}
