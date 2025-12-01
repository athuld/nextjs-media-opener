import Image from "next/image";
import styles from "../../../styles/Recents.module.css";
import RecentSearchData from "../../../types/IRecentSeachData";
import { getMpvData } from "../../../utils/helpers";

export default function RecentCard(item: RecentSearchData) {
  return (
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
  );
}
