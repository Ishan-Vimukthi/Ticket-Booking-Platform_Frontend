import React from 'react'
import Sidebar from '../../components/dashboard_Components/Sidebar'
import D_Navbar from '../../components/dashboard_Components/D_Navbar'
import EditProfileForm from '../../components/dashboard_Components/EditProfileForm'

const EditProfile = () => {
    return (
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <D_Navbar />
            <div className="p-5">
              <EditProfileForm />
            </div>
        </div>
        </div>
    )
}

export default EditProfile
