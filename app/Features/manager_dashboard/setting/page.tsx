'use client';

const permissionsData = [
  { feature: 'Set Hour Limits', manager: true, dept: false, casual: false },
  { feature: 'Approve Disputes', manager: true, dept: true, casual: false },
  { feature: 'View Reports', manager: true, dept: true, casual: false },
  { feature: 'Delete Staff', manager: true, dept: false, casual: false },
  { feature: 'Create Tasks', manager: true, dept: true, casual: false },
  { feature: 'Assign Tasks', manager: true, dept: true, casual: false },
];

// Helper component for check/cross icons
const PermIcon = ({ allowed }: { allowed: boolean }) => (
  allowed ? (
    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  ) : (
    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </div>
  )
);

export default function SettingPage() {
  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Role Permissions</h2>
            <p className="text-sm text-slate-500 mt-1">Manage what each role can access and modify in Allocai.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-95 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Edit Roles
          </button>
        </div>
        
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-center text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-left">Feature Access</th>
                <th className="px-6 py-4 font-semibold border-l border-slate-200">Manager</th>
                <th className="px-6 py-4 font-semibold border-l border-slate-200">Department Staff</th>
                <th className="px-6 py-4 font-semibold border-l border-slate-200">Casual Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {permissionsData.map((perm, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-900 font-medium text-left">{perm.feature}</td>
                  <td className="px-6 py-4 border-l border-slate-100"><PermIcon allowed={perm.manager} /></td>
                  <td className="px-6 py-4 border-l border-slate-100"><PermIcon allowed={perm.dept} /></td>
                  <td className="px-6 py-4 border-l border-slate-100"><PermIcon allowed={perm.casual} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}