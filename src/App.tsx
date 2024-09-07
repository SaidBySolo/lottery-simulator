import { useEffect, useState } from 'react'
import { ChainClient, HttpChain, HttpChainClient, fetchBeaconByTime } from "drand-client";

const App = () => {
  const [chain, setChain] = useState<ChainClient | null>(null)
  const [numbers, setNumbers] = useState<number[][]>([])
  const [setCount, setSetCount] = useState<number>(1)

  const fetchChain = async () => {
    const chain = new HttpChainClient(new HttpChain("https://api.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"))
    setChain(chain)
  }

  useEffect(() => {
    fetchChain()
  }, [chain])

  const getNumbers = async () => {
    if (!chain) return

    const allSets = []

    for (let i = 0; i < setCount; i++) {
      const beacon = await fetchBeaconByTime(chain, Date.now())
      const randomness = beacon.randomness
      const numbersSet = new Set<number>()
      let index = i * 2

      while (numbersSet.size < 6) {
        const randomNum = parseInt(randomness.slice(index, index + 2), 16) % 45 + 1
        numbersSet.add(randomNum)
        index += 2
        if (index >= randomness.length) {
          index = 0
        }
      }

      allSets.push(Array.from(numbersSet).sort((a, b) => a - b))
    }

    setNumbers(allSets)
  }

  return (
    <div style={
      {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw"
      }
    }>
      {numbers.map((set, index) => (
        <div key={index}>Set {index + 1}: {set.join(", ")}</div>
      ))}
      <input
        type="number"
        value={setCount}
        onChange={(e) => setSetCount(Number(e.target.value))}
        min="1"
        max="5"
      />
      <button onClick={getNumbers}>Get Numbers</button>
    </div>
  )
}

export default App