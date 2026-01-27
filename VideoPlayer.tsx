"use client"

const REMOTE_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

export default function VideoPlayer() {
  const src = `/api/video/proxy?url=${encodeURIComponent(REMOTE_URL)}`

  return (
    <video controls playsInline preload="metadata" src={src} />
  )
}
