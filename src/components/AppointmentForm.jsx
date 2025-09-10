import { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';

// Define the form validation schema
const appointmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  listingId: z.string().min(1, 'Listing ID is required'),
  scheduledAt: z.string().min(1, 'Date and time is required'),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  notes: z.string().optional(),
  agentNotes: z.string().optional(),
  internalNotes: z.string().optional(),
});

const AppointmentForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  isAdmin = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      status: 'SCHEDULED',
      ...initialData,
      scheduledAt: initialData.scheduledAt 
        ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
        : ''
    }
  });

  // Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success('Appointment saved successfully!');
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set initial values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (key === 'scheduledAt' && value) {
          setValue(key, new Date(value).toISOString().slice(0, 16));
        } else {
          setValue(key, value);
        }
      });
    }
  }, [initialData, setValue]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData?.id ? 'Edit Appointment' : 'New Appointment'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User ID */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              User ID *
            </label>
            <input
              id="userId"
              type="text"
              {...register('userId')}
              disabled={initialData?.id || isSubmitting}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.userId ? 'border-red-500' : ''
              } ${initialData?.id && 'bg-gray-100'}`}
            />
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
            )}
          </div>

          Listing ID
          <div>
            <label htmlFor="listingId" className="block text-sm font-medium text-gray-700 mb-1">
              Listing ID *
            </label>
            <input
              id="listingId"
              type="text"
              {...register('listingId')}
              disabled={initialData?.id || isSubmitting}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.listingId ? 'border-red-500' : ''
              } ${initialData?.id && 'bg-gray-100'}`}
            />
            {errors.listingId && (
              <p className="mt-1 text-sm text-red-600">{errors.listingId.message}</p>
            )}
          </div>

          {/* Scheduled Date & Time */}
          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="scheduledAt"
                type="datetime-local"
                {...register('scheduledAt')}
                disabled={isSubmitting}
                className={`block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.scheduledAt ? 'border-red-500' : ''
                }`}
              />
            </div>
            {Boolean(errors.scheduledAt) && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              disabled={isSubmitting}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.status ? 'border-red-500' : ''
              }`}
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            disabled={isSubmitting}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.notes ? 'border-red-500' : ''
            }`}
            placeholder="Add any notes about the appointment..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Admin-only fields */}
        {isAdmin && (
          <>
            <div>
              <label htmlFor="agentNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Agent Notes (Internal)
              </label>
              <textarea
                id="agentNotes"
                rows={2}
                {...register('agentNotes')}
                disabled={isSubmitting}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.agentNotes ? 'border-red-500' : ''
                }`}
                placeholder="Add internal notes for agents..."
              />
              {errors.agentNotes && (
                <p className="mt-1 text-sm text-red-600">{errors.agentNotes.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Internal Notes (Admin Only)
              </label>
              <textarea
                id="internalNotes"
                rows={2}
                {...register('internalNotes')}
                disabled={isSubmitting}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.internalNotes ? 'border-red-500' : ''
                }`}
                placeholder="Add private admin notes..."
              />
              {errors.internalNotes && (
                <p className="mt-1 text-sm text-red-600">{errors.internalNotes.message}</p>
              )}
            </div>
          </>
        )}

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Appointment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
