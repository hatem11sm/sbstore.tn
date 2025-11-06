import React from 'react'
import Image from 'next/image'
function Loading() {
  return (
    <div>
      <Image src={"/load.gif"} alt='loading...' />
    </div>
  )
}

export default Loading
