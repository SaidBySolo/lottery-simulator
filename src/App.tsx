import { useState, useEffect } from 'react';
import { ChainClient, HttpCachingChain, HttpChainClient, fetchBeacon } from "drand-client";


const App = () => {
  const [chain, setChain] = useState<ChainClient | null>(null)
  const [numbers, setNumbers] = useState<number[][]>([])
  const [setCount, setSetCount] = useState<number>(1)

  const fetchChain = async () => {
    const chain = new HttpChainClient(new HttpCachingChain("https://drand.cloudflare.com/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971") , {
      disableBeaconVerification: false, // `true` disables checking of signatures on beacons - faster but insecure!!!
      noCache: false, // `true` disables caching when retrieving beacons for some providers
    })
    setChain(chain)
  }

  useEffect(() => {
    fetchChain()
  }, [])

  const generateHash = async (input: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const getNumbers = async () => {
    if (!chain) return
    const beacon = await fetchBeacon(chain)
    const randomness = beacon.randomness

    const generateSet = (seed: string) => {
      let seedValue = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const random = () => {
        const x = Math.sin(seedValue++) * 10000
        return x - Math.floor(x)
      }
      const numbers = new Set<number>()
      while (numbers.size < 6) {
        const num = Math.floor(random() * 45) + 1
        numbers.add(num)
      }
      return Array.from(numbers).sort((a, b) => a - b)
    }

    const allSets = []
    for (let i = 0; i < setCount; i++) {
      const nonce = await generateHash(randomness + "-" + i)
      allSets.push(generateSet(nonce))
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
      <h1>로또 번호 생성기</h1>
      {numbers.map((set, index) => (
        <h3 key={index}>세트 {index + 1}: {set.join(", ")}</h3>
      ))}
      <select value={setCount} onChange={(e) => setSetCount(Number(e.target.value))}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button onClick={() => getNumbers()}>숫자 가져오기</button>
    </div>
  )
}

export default App
