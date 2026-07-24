'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupWizard() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Add your API call here to save the company name
      
      // Redirect to the appropriate dashboard (e.g., company-admin_dashboard)
      router.push('/Features/company-admin_dashboard'); 
    } catch (error) {
      console.error("Failed to save setup data", error);
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Redirect straight to dashboard if they skip
    router.push('/Features/company-admin_dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to Smart Task Allocation
        </h1>
        <p className="text-gray-600 mb-6">
          Let's set up your workspace. You can always change this later.
        </p>

        <form onSubmit={handleSaveAndContinue}>
          <div className="mb-4">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company / Team Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Engineering Team"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col space-y-3 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Skip for now
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}