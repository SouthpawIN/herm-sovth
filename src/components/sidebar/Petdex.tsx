import { useEffect, useState } from "react"
import { useGateway } from "../../app/gateway"
import type { AvatarState } from "../avatar/states"

export type PetCell = [number, number, number, number, number, number, number, number]
export type PetFrame = PetCell[][]
export type PetCells = {
  enabled?: boolean
  frames?: PetFrame[]
  frameMs?: number
}

export const petState = (state: AvatarState) => {
  if (state === "idle") return "idle"
  if (state === "error") return "failed"
  if (state === "speaking") return "wave"
  if (state === "working") return "run"
  return "review"
}

const color = (r: number, g: number, b: number, a: number) =>
  a === 0 ? undefined : `#${[r, g, b].map(n => n.toString(16).padStart(2, "0")).join("")}`

export const PetFrameView = ({ frame }: { frame: PetFrame }) => (
  <box flexDirection="column">
    {frame.map((row, i) => (
      <text key={i}>
        {row.map((cell, j) => {
          const [tr, tg, tb, ta, br, bg, bb, ba] = cell
          return <span key={j} fg={color(tr, tg, tb, ta)} bg={color(br, bg, bb, ba)}>▀</span>
        })}
      </text>
    ))}
  </box>
)

export const Petdex = ({ state = "idle", cols = 20 }: { state?: AvatarState; cols?: number }) => {
  const gw = useGateway()
  const [data, setData] = useState<PetCells | null>(null)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    let live = true
    setFrame(0)
    gw.request<PetCells>("pet.cells", { state: petState(state), cols }).then(value => {
      if (live) setData(value.enabled ? value : null)
    }).catch(() => { if (live) setData(null) })
    return () => { live = false }
  }, [gw, state, cols])

  useEffect(() => {
    const frames = data?.frames ?? []
    if (frames.length < 2) return
    const timer = setInterval(() => setFrame(i => (i + 1) % frames.length), data?.frameMs ?? 120)
    return () => clearInterval(timer)
  }, [data])

  const current = data?.frames?.[frame]
  return current ? <PetFrameView frame={current} /> : null
}
