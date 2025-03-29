import React from 'react'
import Sidebar from '../../components/dashboard_Components/Sidebar'
import D_Navbar from '../../components/dashboard_Components/D_Navbar'
import AdminEditProfile from '../../components/dashboard_Components/AdminEditProfile'

const EditProfile = () => {
    return (
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <D_Navbar />
            <div className="p-5">
              <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
            </div>
            <div>
                <AdminEditProfile />
            </div>
        </div>
        </div>
    )
}

export default EditProfile
