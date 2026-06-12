'use client';

import { useState } from 'react';

interface Employee {
  id: string;
  name: string;
  status: 'Available' | 'Unavailable';
}

export default function TaskAssign() {
  //state variable
  const [taskName] = useState();
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [assignedEmployee, setAssignedEmployee] = useState<Employee | null>(null);

  //employee database 
  const employeeDatabase: Employee[] = [
    // Backend provide employee data 
  ];

  //search employee using ID
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchResults([]);

    // validate employee ID input
    if (!searchId.trim()) {
      alert('Please enter an Employee ID');
      setIsSearching(false);
      return;
    }

    try {
      // Call backend API to search employees

    } catch (error) {
      alert('Error searching employees');
    }

    setIsSearching(false);
  };

  //assign task available employee
  const handleAssign = (employee: Employee) => {
    if (employee.status === 'Unavailable') {
      alert('This employee is currently unavailable');
      return;
    }

    // Call backend API to assign task

    // save assign employee information
    setAssignedEmployee(employee);
    setSearchId('');
    setSearchResults([]);
  };

  //page design
  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="w-full min-h-screen bg-pink-100 p-8 md:p-10">
        {/* Title */}
        <h1 className="text-4xl font-semibold mb-6 text-gray-900">
          <span className="text-grey-600">Task Assign:</span> {taskName}
        </h1>

        {/* Employee search form */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="searchId"
              className="block text-lg font-semibold text-gray-900"
            >
              Search Employee: ID
            </label>
            <div className="flex gap-2">
              <input
                id="searchId"
                type="text"
                placeholder="Enter EmployeeID:"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                disabled={isSearching}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2 rounded transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3 mb-6">
            {searchResults.map((employee) => (
              <div
                key={employee.id}
                className={`p-4 rounded-lg border-2 ${
                  employee.status === 'Available'
                    ? 'bg-green-100 border-green-400'
                    : 'bg-red-100 border-red-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold">
                      ID: {employee.id} {employee.name}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        employee.status === 'Available'
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      Status: {employee.status}
                    </p>
                  </div>
                  {employee.status === 'Available' && (
                    <button
                      onClick={() => handleAssign(employee)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition-colors duration-200"
                    >
                      Assign
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assigned Employee Display */}
        {assignedEmployee && (
          <div className="mt-8 p-4 bg-blue-100 border-2 border-blue-400 rounded-lg">
            <p className="text-gray-900 font-semibold">
              ✓ Task assigned to: {assignedEmployee.name} (ID: {assignedEmployee.id})
            </p>
          </div>
        )}

        {/* No Results Message */}
        {searchResults.length === 0 && searchId && !isSearching && (
          <div className="text-center py-8">
            <p className="text-gray-600">No search results. Try a different ID.</p>
          </div>
        )}
      </div>
    </div>
  );
}
