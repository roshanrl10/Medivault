import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'doctor' || user?.role === 'admin') {
        return <DoctorDashboard />;
    }

    return <PatientDashboard />;
};

export default Dashboard;
