// import React from 'react'
// import { Outlet } from 'react-router-dom'

// const ProtectedRoute = () => {
//     return (
//         <Outlet />
//     )
// }

// export default ProtectedRoute

import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { Navigate, Outlet } from 'react-router-dom'
import Loader from './Loader'

const ProtectedRoute = () => {
    const { isLoaded, isSignedIn } = useUser()

    if (!isLoaded) return <Loader />
    if (!isSignedIn) return <Navigate to="/login" replace />

    return <Outlet />
}

export default ProtectedRoute