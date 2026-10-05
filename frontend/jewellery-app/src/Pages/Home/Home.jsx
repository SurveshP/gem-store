import React from 'react'
import { useNavigate } from 'react-router-dom'
import img1 from '../../assets/Images/home-image.jpg'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <img
        src={img1}
        alt="Jewellery Banner"
        className="h-80 w-full max-w-3xl rounded-3xl object-cover shadow-2xl"
      />

      <Button
        text="Show More"
        onClick={() => navigate('/gallery')}
        className="mt-6 px-6"
      />
    </div>
  )
}

export default Home