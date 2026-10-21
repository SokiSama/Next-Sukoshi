"use client";

import { useRef } from "react";
import { ArrowRight } from "@phosphor-icons/react";

type TrainFriend = {
  title: string;
  avatar: string;
  url: string;
};

type TrainJumpCardProps = {
  friends: TrainFriend[];
};

export function TrainJumpCard({ friends }: TrainJumpCardProps) {
  const lastIndexRef = useRef(-1);
  const availableFriends = friends.filter((friend) => friend.url);
  const previewFriends = availableFriends.slice(0, 5);

  const visitRandomFriend = () => {
    if (availableFriends.length === 0) return;

    // eslint-disable-next-line react-hooks/purity -- Runs only in the user's click handler.
    let nextIndex = Math.floor(Math.random() * availableFriends.length);
    if (availableFriends.length > 1 && nextIndex === lastIndexRef.current) {
      nextIndex = (nextIndex + 1) % availableFriends.length;
    }

    lastIndexRef.current = nextIndex;
    window.open(availableFriends[nextIndex].url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="card train-jump-card" aria-labelledby="train-jump-title">
      <header className="train-jump-heading">
        <span className="train-jump-icon" aria-hidden="true">
          <img src="/assets/cover.svg" alt="" />
        </span>
        <div>
          <h2 id="train-jump-title">列车跃迁</h2>
          <p>随机拜访一位友人</p>
        </div>
      </header>

      <div className="train-jump-footer">
        <div className="train-jump-avatars" aria-hidden="true">
          {previewFriends.map((friend) => (
            <img
              key={friend.url}
              src={friend.avatar}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
        <button
          className="train-jump-button"
          type="button"
          onClick={visitRandomFriend}
          disabled={availableFriends.length === 0}
        >
          <span>开始跃迁</span>
          <ArrowRight weight="bold" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
