"use client";

import { useEffect, useState } from "react";
import { FriendCard, type Friend } from "./FriendCard";
import styles from "./FriendsPage.module.css";

export function FriendList({ friends }: { friends: Friend[] }) {
  const [orderedFriends, setOrderedFriends] = useState(friends);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const shuffled = [...friends];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }
      setOrderedFriends(shuffled);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [friends]);

  return (
    <section className={styles.grid} id="friend-links" aria-label="友人小站" data-reveal-group>
      {orderedFriends.length === 0 && <p>还没有添加友链，期待与你相遇。</p>}
      {orderedFriends.map(friend => (
        <FriendCard friend={friend} key={friend.url} />
      ))}
    </section>
  );
}
