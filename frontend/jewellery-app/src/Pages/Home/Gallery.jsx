import React from 'react'
// import img1 from '../../assets/Images/home-image.jpg'
import img1 from '../../assets/Images/gallery-image.jpg'
import img2 from '../../assets/Images/gallery-image-1.jpg'
import img3 from '../../assets/Images/gallery-image-2.jpg'
import img4 from '../../assets/Images/gallery-image-3.jpg'
import img5 from '../../assets/Images/gallery-image-4.jpg'
import img6 from '../../assets/Images/gallery-image-5.jpg'
import img7 from '../../assets/Images/gallery-image-6.jpg'
import img8 from '../../assets/Images/gallery-image-7.jpg'

// const images = [img1, img2, img3, img4, img5, img6, img7, img8]
const images = [img1, img2, img3, img4, img5, img6, img7, img8]

const Gallery = () => {
  return (
    <div className="p-6">
      <h2 className="mb-6 text-3xl font-bold text-yellow-400">
        Jewellery Collection
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Jewellery ${index + 1}`}
            className="h-72 w-full rounded-2xl object-cover shadow-xl"
          />
        ))}
      </div>
    </div>
  )
}

export default Gallery