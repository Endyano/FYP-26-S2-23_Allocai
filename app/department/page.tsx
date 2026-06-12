'use client';

import Link from 'next/link';

export default function DepartmentHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Department Management System
        </h1>

        {/* 🛠️ Changed grid structure cleanly to 2 columns for balance since we have 4 items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          
          {/* Manage Tasks */}
          <Link href="/department/tasks">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-slate-300 border border-slate-100 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Manage Tasks</h2>
              <p className="text-gray-600">View and manage existing tasks</p>
            </div>
          </Link>

          {/* Create Task */}
          <Link href="/department/create">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-slate-300 border border-slate-100 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Create Task</h2>
              <p className="text-gray-600">Create or edit a new task</p>
            </div>
          </Link>

          {/* Assign Task */}
          <Link href="/department/assign">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-slate-300 border border-slate-100 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Assign Task</h2>
              <p className="text-gray-600">Assign tasks to employees</p>
            </div>
          </Link>

          {/* Cancellation Request */}
          <Link href="/department/cancellation">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-slate-300 border border-slate-100 transition-all cursor-pointer">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Cancellation Requests</h2>
              <p className="text-gray-600">Approve or reject cancellation requests</p>
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
}