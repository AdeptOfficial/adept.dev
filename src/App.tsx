import { useState } from 'react'
import './App.css'
import Card from './components/Card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='app'>
      <h1 className="text-3xl font-bold underline">
        Welcome to AdepT.dev!
      </h1>
      <Card/>
    </div>
  )
}

export default App
