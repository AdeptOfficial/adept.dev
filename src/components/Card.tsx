import React from 'react'
import Profile from './Profile';
import Container from './Container';

const Card = () => {
  return (
      <div className="rounded-3xl overflow-hidden shadow-xl my-3 bg-blue-500 max-h-screen max-w-screen">
        <img src="src/img/bg.jpg" alt="top-img" className="max-h-72 w-full" />
          <Profile />
          <Container />

      </div>
  )
}

export default Card