import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Simulated data for testing
        const mockData = [
          {
            id: 1,
            user: { name: 'John Doe', email: 'john@example.com' },
            listing: { title: 'Modern Apartment', address: '123 Main St' },
            scheduledAt: new Date().toISOString(),
            status: 'SCHEDULED'
          },
          {
            id: 2,
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            listing: { title: 'Luxury Villa', address: '456 Park Ave' },
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            status: 'CONFIRMED'
          }
        ];
        setAppointments(mockData);
        setError('');
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Client</th>
              <th className="px-4 py-2 border">Property</th>
              <th className="px-4 py-2 border">Date & Time</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="border px-4 py-2">{appointment.id}</td>
                <td className="border px-4 py-2">
                  <div>{appointment.user.name}</div>
                  <div className="text-sm text-gray-600">{appointment.user.email}</div>
                </td>
                <td className="border px-4 py-2">
                  <div className="font-medium">{appointment.listing.title}</div>
                  <div className="text-sm text-gray-600">{appointment.listing.address}</div>
                </td>
                <td className="border px-4 py-2">
                  {format(new Date(appointment.scheduledAt), 'MMM d, yyyy h:mm a')}
                </td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
