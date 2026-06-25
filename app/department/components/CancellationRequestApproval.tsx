'use client';

import { useState } from 'react';

// define request status
type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

// structure cancel request
interface CancellationRequest {
  id: string;
  taskName: string;
  requestedBy: string;
  reason: string;
  status: RequestStatus;
}

export default function CancellationRequestApproval() {

  // store all cancel request
  const [requests, setRequests] = useState<CancellationRequest[]>([]);

  //track number of processed request (approve / reject)
  const [processedCount, setProcessedCount] = useState(0);

  // approve
  const handleApprove = (id: string) => {
    const request = requests.find((r) => r.id === id);

    if (request) {
      setRequests(
        requests.map((r) =>
          r.id === id
            ? { ...r, status: 'Approved' as RequestStatus }
            : r
        )
      );

      setProcessedCount((prev) => prev + 1);

      alert(`Approved: ${request.taskName}`);
    }
  };

  // rejcect
  const handleReject = (id: string) => {
    const request = requests.find((r) => r.id === id);

    if (request) {
      setRequests(
        requests.map((r) =>
          r.id === id
            ? { ...r, status: 'Rejected' as RequestStatus }
            : r
        )
      );

      setProcessedCount((prev) => prev + 1);

      alert(`Rejected: ${request.taskName}`);
    }
  };

  // filter only pending request
  const pendingRequests = requests.filter(
    (r) => r.status === 'Pending'
  );

  // page design
  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="w-full min-h-screen bg-pink-100 p-8 md:p-10">
        
        {/* Title */}
        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          Cancellation Request Approval
        </h1>

        {/* Summary */}
        <p className="text-lg font-semibold text-gray-700 mb-6">
          Pending: {pendingRequests.length} | Processed: {processedCount}
        </p>

        {/* Empty State */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-xl font-semibold text-gray-700">
              No cancellation requests
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Render each request */}
            {requests.map((request) => (
              <div
                key={request.id}
                className={`p-5 rounded-lg border-2 ${
                  request.status === 'Pending'
                    ? 'bg-pink-50 border-pink-300'
                    : request.status === 'Approved'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  
                  {/* task information */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Task: {request.taskName}
                    </h3>

                    <p className="text-gray-700 mb-1">
                      Requested By:{' '}
                      <span className="font-medium">
                        {request.requestedBy}
                      </span>
                    </p>

                    <p className="text-gray-700">
                      Reason:{' '}
                      <span className="font-medium">
                        {request.reason}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold text-white ${
                        request.status === 'Pending'
                          ? 'bg-orange-400'
                          : request.status === 'Approved'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {request.status}
                    </span>

                    {request.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleApprove(request.id)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            handleReject(request.id)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {request.status === 'Approved'
                          ? '✓ Approved'
                          : '✗ Rejected'}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}